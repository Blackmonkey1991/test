import { RequestHandler } from "express";
import {
  ApiResponse,
  TicketPurchaseRequest,
  DrawingRequest,
  JackpotUpdateRequest,
} from "../../shared/types";
import {
  createTicket,
  getTicketsByUser,
  getCurrentDrawing,
  getLatestCompletedDrawing,
  performIntelligentDrawing,
  updateJackpotAmount,
  getAdminStats,
  getAllTickets,
  getDrawingHistory,
} from "../data/lottery";
import { updateUserBalance, getUserById } from "../data/users";
import { users } from "./simple-auth";

export const getCurrentDrawingRoute: RequestHandler = (req, res) => {
  try {
    const drawing = getCurrentDrawing();
    const response: ApiResponse = {
      success: true,
      data: drawing,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching current drawing:", error);
    res.json({ success: false, error: "Failed to fetch current drawing" });
  }
};

export const purchaseTickets: RequestHandler = (req, res) => {
  try {
    console.log("🎫 Purchase tickets called");
    console.log("🎫 User from request:", (req as any).user);
    console.log("🎫 Request body:", req.body);

    const user = (req as any).user;
    const { tickets: ticketData }: TicketPurchaseRequest = req.body;

    if (!ticketData || ticketData.length === 0) {
      return res.json({ success: false, error: "No tickets provided" });
    }

    if (ticketData.length > 10) {
      return res.json({
        success: false,
        error: "Maximum 10 tickets per drawing",
      });
    }

    // Validate ticket data
    for (const ticket of ticketData) {
      if (ticket.mainNumbers.length !== 5 || ticket.worldNumbers.length !== 2) {
        return res.json({ success: false, error: "Invalid ticket format" });
      }

      // Validate number ranges
      const invalidMain = ticket.mainNumbers.some((n) => n < 1 || n > 50);
      const invalidWorld = ticket.worldNumbers.some((n) => n < 1 || n > 12);

      if (invalidMain || invalidWorld) {
        return res.json({
          success: false,
          error: "Numbers out of valid range",
        });
      }

      // Check for duplicates within ticket
      const uniqueMain = new Set(ticket.mainNumbers);
      const uniqueWorld = new Set(ticket.worldNumbers);

      if (uniqueMain.size !== 5 || uniqueWorld.size !== 2) {
        return res.json({
          success: false,
          error: "Duplicate numbers in ticket",
        });
      }
    }

    const totalCost = ticketData.length * 2; // 2€ per ticket

    // Check user balance using simple auth system
    const userAccount = users.get(user.email);
    if (!userAccount || userAccount.balance < totalCost) {
      return res.json({ success: false, error: "Insufficient balance" });
    }

    // Create tickets
    const createdTickets = ticketData.map((ticket) =>
      createTicket(user.id, ticket.mainNumbers, ticket.worldNumbers),
    );

    // Deduct balance from simple auth system
    userAccount.balance -= totalCost;
    users.set(user.email, userAccount);

    const response: ApiResponse = {
      success: true,
      data: createdTickets,
    };

    res.json(response);
  } catch (error) {
    console.error("Error purchasing tickets:", error);
    res.json({ success: false, error: "Failed to purchase tickets" });
  }
};

export const getMyTickets: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const tickets = getTicketsByUser(user.id);

    const response: ApiResponse = {
      success: true,
      data: tickets,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.json({ success: false, error: "Failed to fetch tickets" });
  }
};

// Admin routes
export const performDrawing: RequestHandler = (req, res) => {
  try {
    const { manualNumbers }: DrawingRequest = req.body;

    const drawing = performIntelligentDrawing(manualNumbers);

    if (!drawing) {
      return res.json({ success: false, error: "No active drawing found" });
    }

    const response: ApiResponse = {
      success: true,
      data: drawing,
    };

    res.json(response);
  } catch (error) {
    console.error("Error performing drawing:", error);
    res.json({ success: false, error: "Failed to perform drawing" });
  }
};

export const updateJackpot: RequestHandler = (req, res) => {
  try {
    const { newAmount, isSimulated }: JackpotUpdateRequest = req.body;

    if (typeof newAmount !== "number" || newAmount < 0) {
      return res.json({ success: false, error: "Invalid jackpot amount" });
    }

    const success = updateJackpotAmount(newAmount, isSimulated);

    if (!success) {
      return res.json({ success: false, error: "Failed to update jackpot" });
    }

    const currentDrawing = getCurrentDrawing();

    const response: ApiResponse = {
      success: true,
      data: currentDrawing,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating jackpot:", error);
    res.json({ success: false, error: "Failed to update jackpot" });
  }
};

export const getAdminStatsRoute: RequestHandler = (req, res) => {
  try {
    const stats = getAdminStats();

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.json({ success: false, error: "Failed to fetch admin stats" });
  }
};

export const getAllTicketsRoute: RequestHandler = (req, res) => {
  try {
    const tickets = getAllTickets();

    const response: ApiResponse = {
      success: true,
      data: tickets,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.json({ success: false, error: "Failed to fetch tickets" });
  }
};

export const getDrawingHistoryRoute: RequestHandler = (req, res) => {
  try {
    const history = getDrawingHistory();

    const response: ApiResponse = {
      success: true,
      data: history,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching drawing history:", error);
    res.json({ success: false, error: "Failed to fetch drawing history" });
  }
};

export const getCurrentDrawingTickets: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const currentDrawing = getCurrentDrawing();
    const latestCompletedDrawing = getLatestCompletedDrawing();

    if (!currentDrawing) {
      return res.json({ success: false, error: "No active drawing found" });
    }

    const allTickets = getAllTickets();

    // Show tickets for current drawing AND the most recent completed drawing
    const relevantDrawingDates = [currentDrawing.date];
    if (latestCompletedDrawing) {
      relevantDrawingDates.push(latestCompletedDrawing.date);
    }

    const currentDrawingTickets = allTickets.filter(
      ticket => relevantDrawingDates.includes(ticket.drawingDate) && ticket.userId === user?.id
    );

    const response: ApiResponse = {
      success: true,
      data: currentDrawingTickets,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching current drawing tickets:", error);
    res.json({ success: false, error: "Failed to fetch current drawing tickets" });
  }
};

export const getLatestCompletedDrawingRoute: RequestHandler = (req, res) => {
  try {
    const latestDrawing = getLatestCompletedDrawing();

    const response: ApiResponse = {
      success: true,
      data: latestDrawing,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching latest completed drawing:", error);
    res.json({ success: false, error: "Failed to fetch latest completed drawing" });
  }
};
