
export interface LiveEntry {
  id: string;
  type: 'photocopy' | 'color_print' | 'photo_print' | 'online_apply' | 'others' | 'due_collection';
  amount: number;
  timestamp: number;
  date: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface DueEntry {
  id: string;
  customerName: string;
  phone?: string;
  amount: number;
  date: string;
  note?: string;
  timestamp: number;
  customerPhoto?: string; // Base64 string of the image
  isPaid?: boolean;
  paidDate?: string;
}

export type NightCategory = 
  | 'bkash_agent' 
  | 'nagad_agent' 
  | 'bkash_p1' 
  | 'bkash_p2' 
  | 'nagad_p1' 
  | 'nagad_p2' 
  | 'rocket' 
  | 'gp_load' 
  | 'robi_load'
  | 'minute_card'
  | 'others';

export interface NightEntry {
  id: string;
  type: NightCategory;
  amount: number;
  date: string;
}

export interface CashEntry {
  id: string;
  amount: number;
  type: 'in' | 'out';
  note: string;
  date: string;
  timestamp: number;
}

export interface AppSettings {
  password: string;
  openingCash: number;
  googleClientId?: string;
  autoSyncPrompt?: boolean;
  autoSync: boolean;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface AppState {
  uploadedDates: string[];
}
