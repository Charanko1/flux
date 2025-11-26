export interface Transaction {
  id: number | string;
  type: string; // 'income' | 'expense'
  title: string;
  category: string;
  amount: number;
  date: string;
}

export interface TransactionHistoryPageProps {
  onBack: () => void;
  transactions: Transaction[];
}