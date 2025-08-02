import { LotteryTicket, Drawing, User, WINNING_CLASSES, DisplayOverrideRequest } from "../../shared/types";
import { users } from "../routes/simple-auth";

// In-memory storage for lottery data (in production, use a database)
const tickets: Map<string, LotteryTicket> = new Map();
const drawings: Map<string, Drawing> = new Map();

// Initialize with a current drawing
const initializeDrawings = () => {
  const currentDrawing: Drawing = {
    id: "drawing-001",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    mainNumbers: [], // Empty until drawn
    worldNumbers: [], // Empty until drawn
    jackpotAmount: 1000000, // 1 million starting jackpot
    realJackpot: 0, // Will be calculated from ticket sales
    simulatedJackpot: 1000000, // Admin can control this
    isActive: true,
    winnersByClass: {},
  };

  drawings.set(currentDrawing.id, currentDrawing);
};

// Initialize on module load
initializeDrawings();

const createNextDrawing = (previousDrawing?: Drawing) => {
  const nextDrawingNumber = drawings.size + 1;

  // Preserve jackpot from previous drawing if no Class 1 winner
  let nextJackpot = 1000000; // Default base jackpot (1 million EUR)
  if (previousDrawing) {
    if (previousDrawing.winnersByClass && previousDrawing.winnersByClass[1] > 0) {
      // Class 1 winner found, reset to base jackpot
      nextJackpot = 1000000;
    } else {
      // No Class 1 winner, carry over the jackpot and add 40% of ticket sales
      const previousDrawingTickets = Array.from(tickets.values()).filter(
        ticket => ticket.drawingDate === previousDrawing.date
      );
      const ticketSalesRevenue = previousDrawingTickets.length * 2; // 2€ per ticket
      const jackpotIncrease = Math.floor(ticketSalesRevenue * 0.4); // 40% goes to jackpot
      nextJackpot = previousDrawing.jackpotAmount + jackpotIncrease;
    }
    console.log(`🎲 Jackpot logic: Class 1 winners: ${previousDrawing.winnersByClass[1] || 0}, Previous: ${previousDrawing.jackpotAmount}, Next: ${nextJackpot}`);
  }

  const nextDrawing: Drawing = {
    id: `drawing-${nextDrawingNumber.toString().padStart(3, '0')}`,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    mainNumbers: [], // Empty until drawn
    worldNumbers: [], // Empty until drawn
    jackpotAmount: nextJackpot,
    realJackpot: 0, // Will be calculated from ticket sales
    simulatedJackpot: nextJackpot,
    isActive: true,
    winnersByClass: {},
  };

  drawings.set(nextDrawing.id, nextDrawing);
  return nextDrawing;
};

export const createTicket = (
  userId: string,
  mainNumbers: number[],
  worldNumbers: number[],
): LotteryTicket => {
  const currentDrawing = getCurrentDrawing();
  if (!currentDrawing) {
    throw new Error("No active drawing available for ticket purchase");
  }

  const ticket: LotteryTicket = {
    id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    mainNumbers: [...mainNumbers].sort((a, b) => a - b),
    worldNumbers: [...worldNumbers].sort((a, b) => a - b),
    cost: 2, // Always 2€
    drawingDate: currentDrawing.date, // Link to specific drawing
    isWinner: false,
    createdAt: new Date().toISOString(),
  };

  tickets.set(ticket.id, ticket);

  console.log(`🎫 Ticket created for drawing ${currentDrawing.id} (${currentDrawing.date})`);

  // Update real jackpot (40% of ticket sales)
  updateRealJackpot();

  return ticket;
};

export const getTicketsByUser = (userId: string): LotteryTicket[] => {
  return Array.from(tickets.values()).filter(
    (ticket) => ticket.userId === userId,
  );
};

export const getCurrentDrawing = (): Drawing | null => {
  for (const drawing of drawings.values()) {
    if (drawing.isActive) {
      return drawing;
    }
  }
  return null;
};

export const getLatestCompletedDrawing = (): Drawing | null => {
  const allDrawings = Array.from(drawings.values());
  // Find the latest completed drawing (has numbers and is not active)
  const completedDrawings = allDrawings.filter(
    drawing => !drawing.isActive && drawing.mainNumbers.length > 0
  );

  if (completedDrawings.length === 0) return null;

  // Sort by ID (newest first) and return the latest one
  completedDrawings.sort((a, b) => b.id.localeCompare(a.id));
  return completedDrawings[0];
};

export const updateRealJackpot = () => {
  const currentDrawing = getCurrentDrawing();
  if (currentDrawing) {
    // Only count tickets for the current drawing
    const currentDrawingTickets = Array.from(tickets.values()).filter(
      ticket => ticket.drawingDate === currentDrawing.date
    );
    const totalRevenue = currentDrawingTickets.length * 2; // 2€ per ticket
    const jackpotFromTickets = Math.floor(totalRevenue * 0.4); // 40% goes to jackpot

    // Update the real jackpot to show current accumulated amount
    // This displays the base jackpot (1M or carried over) plus current drawing contribution
    currentDrawing.realJackpot = jackpotFromTickets;
    drawings.set(currentDrawing.id, currentDrawing);
  }
};

export const updateJackpotAmount = (
  newAmount: number,
  isSimulated: boolean = true,
): boolean => {
  const currentDrawing = getCurrentDrawing();
  if (currentDrawing) {
    if (isSimulated) {
      currentDrawing.simulatedJackpot = newAmount;
      currentDrawing.jackpotAmount = newAmount; // Display the simulated amount
    } else {
      currentDrawing.realJackpot = newAmount;
    }
    drawings.set(currentDrawing.id, currentDrawing);
    return true;
  }
  return false;
};

// Intelligent number drawing - avoids commonly picked numbers
export const performIntelligentDrawing = (manualNumbers?: {
  mainNumbers: number[];
  worldNumbers: number[];
}): Drawing | null => {
  console.log("🎲 Starting intelligent drawing...");

  const currentDrawing = getCurrentDrawing();
  if (!currentDrawing) {
    console.log("❌ No current drawing found");
    return null;
  }

  console.log("🎲 Current drawing:", currentDrawing.id);

  let drawnMainNumbers: number[];
  let drawnWorldNumbers: number[];

  if (manualNumbers) {
    drawnMainNumbers = manualNumbers.mainNumbers;
    drawnWorldNumbers = manualNumbers.worldNumbers;
  } else {
    // Analyze commonly picked numbers for current drawing tickets only
    const currentDrawingTickets = Array.from(tickets.values()).filter(
      ticket => ticket.drawingDate === currentDrawing.date
    );
    const mainNumberFrequency = new Map<number, number>();
    const worldNumberFrequency = new Map<number, number>();

    // Count frequency of each number
    currentDrawingTickets.forEach((ticket) => {
      ticket.mainNumbers.forEach((num) => {
        mainNumberFrequency.set(num, (mainNumberFrequency.get(num) || 0) + 1);
      });
      ticket.worldNumbers.forEach((num) => {
        worldNumberFrequency.set(num, (worldNumberFrequency.get(num) || 0) + 1);
      });
    });

    // Choose less frequently picked numbers
    drawnMainNumbers = chooseLeastFrequent(1, 50, 5, mainNumberFrequency);
    drawnWorldNumbers = chooseLeastFrequent(1, 12, 2, worldNumberFrequency);
  }

  console.log("🎲 Drawn numbers - Main:", drawnMainNumbers, "World:", drawnWorldNumbers);

  // Update drawing
  currentDrawing.mainNumbers = drawnMainNumbers;
  currentDrawing.worldNumbers = drawnWorldNumbers;
  currentDrawing.isActive = false; // Mark as completed
  drawings.set(currentDrawing.id, currentDrawing);

  console.log("🎲 Drawing updated and marked as completed");

  // Calculate winners
  calculateWinners(currentDrawing);

  console.log("🎲 Winners calculated");

  // Create next drawing
  const nextDrawing = createNextDrawing(currentDrawing);
  console.log("🎲 Next drawing created:", nextDrawing.id);

  return currentDrawing;
};

const chooseLeastFrequent = (
  min: number,
  max: number,
  count: number,
  frequency: Map<number, number>,
): number[] => {
  const candidates: { number: number; frequency: number }[] = [];

  for (let i = min; i <= max; i++) {
    candidates.push({ number: i, frequency: frequency.get(i) || 0 });
  }

  // Sort by frequency (ascending) then by random for ties
  candidates.sort((a, b) => {
    if (a.frequency === b.frequency) {
      return Math.random() - 0.5;
    }
    return a.frequency - b.frequency;
  });

  return candidates
    .slice(0, count)
    .map((c) => c.number)
    .sort((a, b) => a - b);
};

const calculateWinners = (drawing: Drawing) => {
  // Only consider tickets for this specific drawing
  const drawingTickets = Array.from(tickets.values()).filter(
    ticket => ticket.drawingDate === drawing.date
  );
  const winnersByClass: Record<number, number> = {};

  drawingTickets.forEach((ticket) => {
    const mainMatches = ticket.mainNumbers.filter((num) =>
      drawing.mainNumbers.includes(num),
    ).length;
    const worldMatches = ticket.worldNumbers.filter((num) =>
      drawing.worldNumbers.includes(num),
    ).length;

    const winningClass = determineWinningClass(mainMatches, worldMatches);

    if (winningClass > 0) {
      ticket.isWinner = true;
      ticket.winningClass = winningClass;
      ticket.winningAmount = calculateWinningAmount(
        winningClass,
        drawing.jackpotAmount,
      );
      tickets.set(ticket.id, ticket);

      // Credit winnings to user balance
      const userAccount = Array.from(users.values()).find(user => user.id === ticket.userId);
      if (userAccount) {
        userAccount.balance += ticket.winningAmount;
        users.set(userAccount.email, userAccount);
        console.log(`💰 Credited ${ticket.winningAmount}€ to user ${userAccount.email} (Ticket: ${ticket.id.slice(-6)}, Class: ${winningClass})`);
      }

      winnersByClass[winningClass] = (winnersByClass[winningClass] || 0) + 1;
    }
  });

  drawing.winnersByClass = winnersByClass;
  drawings.set(drawing.id, drawing);
};

const determineWinningClass = (
  mainMatches: number,
  worldMatches: number,
): number => {
  if (mainMatches === 5 && worldMatches === 2) return 1; // Jackpot
  if (mainMatches === 5 && worldMatches === 1) return 2;
  if (mainMatches === 5 && worldMatches === 0) return 3;
  if (mainMatches === 4 && worldMatches === 2) return 4;
  if (mainMatches === 4 && worldMatches === 1) return 5;
  if (mainMatches === 3 && worldMatches === 2) return 6;
  if (mainMatches === 4 && worldMatches === 0) return 7;
  if (mainMatches === 2 && worldMatches === 2) return 8;
  if (mainMatches === 3 && worldMatches === 1) return 9;
  if (mainMatches === 3 && worldMatches === 0) return 10;
  if (mainMatches === 1 && worldMatches === 2) return 11;
  if (mainMatches === 2 && worldMatches === 1) return 12;

  return 0; // No win
};

const calculateWinningAmount = (
  winningClass: number,
  jackpotAmount: number,
): number => {
  const winningClassData = WINNING_CLASSES.find(
    (wc) => wc.class === winningClass,
  );

  if (winningClass === 1) {
    return jackpotAmount; // Full jackpot
  }

  return winningClassData?.minPrize || 0;
};

export const getAdminStats = () => {
  const allTickets = Array.from(tickets.values());
  const currentDrawing = getCurrentDrawing();

  // Stats for current drawing
  const currentDrawingTickets = currentDrawing
    ? allTickets.filter(ticket => ticket.drawingDate === currentDrawing.date)
    : [];

  const totalRevenue = allTickets.length * 2; // All time revenue
  const currentDrawingRevenue = currentDrawingTickets.length * 2;

  return {
    totalUsers: new Set(allTickets.map((t) => t.userId)).size,
    totalTickets: allTickets.length,
    totalRevenue,
    currentDrawingTickets: currentDrawingTickets.length,
    currentDrawingRevenue,
    currentJackpot: currentDrawing?.jackpotAmount || 0,
    realJackpot: currentDrawing?.realJackpot || 0,
    simulatedJackpot: currentDrawing?.simulatedJackpot || 0,
    pendingDrawing: currentDrawing
      ? currentDrawing.mainNumbers.length === 0
      : false,
  };
};

export const getAllTickets = (): LotteryTicket[] => {
  return Array.from(tickets.values());
};

export const getDrawingHistory = (): Drawing[] => {
  return Array.from(drawings.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export const updateDisplayOverrides = (overrides: DisplayOverrideRequest): boolean => {
  const currentDrawing = getCurrentDrawing();
  if (currentDrawing) {
    currentDrawing.displayOverrides = {
      manualTitle: overrides.title,
      manualDate: overrides.date,
      manualTime: overrides.time,
    };
    drawings.set(currentDrawing.id, currentDrawing);
    return true;
  }
  return false;
};
