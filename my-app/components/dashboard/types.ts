export interface Task {
  id: string | number;
  title: string;
  date: string; // Ini Deadline (dueDate)
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  createdAt?: string; // <--- WAJIB DITAMBAH (Tanggal Dibuat)
}

export interface Transaction {
  id: string | number;
  amount: number;
  date: string;
  type?: string;
}

export interface DashboardSummary {
  total: number;
  assigned: number;
  closed: number;
  highPriority: number;
}

export interface ChartData {
  name: string;
  Income: number;
  Expense: number;
  dateObj?: Date;
}