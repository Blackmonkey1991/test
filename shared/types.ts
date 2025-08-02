// User and Authentication Types
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  walletAddress?: string;
  balance: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  sessionToken?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Lottery Ticket Types
export interface LotteryTicket {
  id: string;
  userId: string;
  mainNumbers: number[]; // 5 numbers from 1-50
  worldNumbers: number[]; // 2 numbers from 1-12
  cost: number; // Always 2€
  drawingDate: string;
  isWinner: boolean;
  winningClass?: number; // 1-12 (1 = Jackpot)
  winningAmount?: number;
  createdAt: string;
}

export interface TicketPurchaseRequest {
  tickets: Array<{
    mainNumbers: number[];
    worldNumbers: number[];
  }>;
}

// Drawing Types
export interface Drawing {
  id: string;
  date: string;
  mainNumbers: number[];
  worldNumbers: number[];
  jackpotAmount: number;
  realJackpot: number; // Based on 40% of ticket sales
  simulatedJackpot: number; // Fake jackpot that admin can control
  isActive: boolean;
  winnersByClass: Record<number, number>; // Class -> Number of winners
  displayOverrides?: DisplayOverrides; // Manual title and date/time overrides
}

export interface DrawingRequest {
  manualNumbers?: {
    mainNumbers: number[];
    worldNumbers: number[];
  };
  intelligentDrawing?: boolean;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  currentDrawingTickets: number;
  currentDrawingRevenue: number;
  currentJackpot: number;
  realJackpot: number;
  simulatedJackpot: number;
  pendingDrawing: boolean;
}

export interface JackpotUpdateRequest {
  newAmount: number;
  isSimulated: boolean;
}

// Manual Display Overrides
export interface DisplayOverrides {
  manualTitle?: string;
  manualDate?: string;
  manualTime?: string;
}

export interface DisplayOverrideRequest {
  title?: string;
  date?: string;
  time?: string;
}

// Winning Classes (like Eurojackpot)
export interface WinningClass {
  class: number;
  requirement: string;
  odds: string;
  minPrize: number;
}

export const WINNING_CLASSES: WinningClass[] = [
  {
    class: 1,
    requirement: "5 + 2",
    odds: "1 : 139,838,160",
    minPrize: 10000000,
  },
  { class: 2, requirement: "5 + 1", odds: "1 : 6,991,908", minPrize: 1000000 },
  { class: 3, requirement: "5 + 0", odds: "1 : 3,107,515", minPrize: 100000 },
  { class: 4, requirement: "4 + 2", odds: "1 : 621,503", minPrize: 5000 },
  { class: 5, requirement: "4 + 1", odds: "1 : 31,075", minPrize: 300 },
  { class: 6, requirement: "3 + 2", odds: "1 : 14,125", minPrize: 100 },
  { class: 7, requirement: "4 + 0", odds: "1 : 13,811", minPrize: 80 },
  { class: 8, requirement: "2 + 2", odds: "1 : 985", minPrize: 25 },
  { class: 9, requirement: "3 + 1", odds: "1 : 706", minPrize: 20 },
  { class: 10, requirement: "3 + 0", odds: "1 : 314", minPrize: 15 },
  { class: 11, requirement: "1 + 2", odds: "1 : 188", minPrize: 10 },
  { class: 12, requirement: "2 + 1", odds: "1 : 49", minPrize: 8 },
];

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
