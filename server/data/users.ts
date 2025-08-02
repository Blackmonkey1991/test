import { User } from "../../shared/types";

// In-memory user storage (in production, this would be a database)
const users: Map<string, User & { password: string }> = new Map();

// Pre-populate with admin and test accounts
const initializeUsers = () => {
  // Admin account
  const admin: User & { password: string } = {
    id: "admin-001",
    email: "Admin@world.com",
    password: "Admin25!",
    isAdmin: true,
    balance: 100000, // Admin gets 100k for testing
    createdAt: new Date().toISOString(),
  };
  users.set(admin.email, admin);

  // Lara account
  const lara: User & { password: string } = {
    id: "lara-001",
    email: "Lara@world.com",
    password: "Lara123",
    isAdmin: false,
    balance: 1000, // Lara gets 1000€ starting balance
    createdAt: new Date().toISOString(),
  };
  users.set(lara.email, lara);
  console.log(`✅ Lara account created: ${lara.email}`);

  // Test accounts Test1@world.com to Test10@world.com
  for (let i = 1; i <= 10; i++) {
    const testUser: User & { password: string } = {
      id: `test-${i.toString().padStart(3, "0")}`,
      email: `Test${i}@world.com`,
      password: "Test2025",
      isAdmin: false,
      balance: 1000, // Each test account gets 1000€
      createdAt: new Date().toISOString(),
    };
    users.set(testUser.email, testUser);
  }
};

// Initialize users on module load
initializeUsers();

export const getUserByEmail = (
  email: string,
): (User & { password: string }) | undefined => {
  return users.get(email);
};

export const getUserById = (
  id: string,
): (User & { password: string }) | undefined => {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
};

export const createUser = (email: string, password: string): User => {
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const user: User & { password: string } = {
    id,
    email,
    password,
    isAdmin: false,
    balance: 0, // New users start with 0 balance
    createdAt: new Date().toISOString(),
  };

  users.set(email, user);
  return user;
};

export const updateUserWallet = (
  userId: string,
  walletAddress: string,
): User | null => {
  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      user.walletAddress = walletAddress;
      users.set(email, user);
      return user;
    }
  }
  return null;
};

export const updateUserBalance = (
  userId: string,
  newBalance: number,
): User | null => {
  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      user.balance = newBalance;
      users.set(email, user);
      return user;
    }
  }
  return null;
};

export const getAllUsers = (): User[] => {
  return Array.from(users.values()).map((user) => ({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    walletAddress: user.walletAddress,
    balance: user.balance,
    createdAt: user.createdAt,
  }));
};

// Helper to get user without password for API responses
export const getUserSafe = (user: User & { password: string }): User => {
  const { password, ...safeUser } = user;
  return safeUser;
};
