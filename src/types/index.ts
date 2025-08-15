export interface User {
  id: string;
  username: string;
  pinHash: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  qrCode: string;
  lastUpdated: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  itemName: string;
  changeAmount: number;
  username: string;
  date: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, pin: string) => Promise<boolean>;
  register: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
}