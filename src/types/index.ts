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
  cafeId?: string;
}

export interface HistoryEntry {
  id: string;
  itemName: string;
  changeAmount: number;
  username: string;
  date: string;
  cafeId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, pin: string) => Promise<boolean>;
  register: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

export interface Profile {
  id: string;
  userId: string;
  cafeId: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseAuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}