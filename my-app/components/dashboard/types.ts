// types.ts
export interface Task {
  id: string | number;
  title: string;
  date: string; // dueDate
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  startDate?: string; // Opsional kalau ada
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
  dateObj?: Date; // Helper untuk sorting
}