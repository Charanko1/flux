"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  CSSProperties,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  History,
  Plus,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { parseDateIDN } from "@/lib/utils";

export interface TransactionData {
  id: number | string;
  type: "income" | "expense";
  title: string;
  category: string;
  amount: number;
  date: string;
}

const PIE_COLORS = [
  "#facc15",
  "#374151",
  "#4f46e5",
  "#60a5fa",
  "#16a34a",
  "#dc2626",
  "#9333ea",
];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={textAnchor}
      dominantBaseline="central"
      className="text-[10px] sm:text-xs md:text-sm font-medium"
    >
      {`${name} ${percent.toFixed(0)}%`}
    </text>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.3 },
  },
};

interface DashboardStatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  icon: React.ReactNode;
  amountClassName?: string;
}

const DashboardStatCard = React.memo(
  ({
    title,
    amount,
    subtitle,
    icon,
    amountClassName = "",
  }: DashboardStatCardProps) => (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <span className="text-xs md:text-sm font-medium text-gray-600">
          {title}
        </span>
        <div className="scale-90 md:scale-100 origin-top-right">{icon}</div>
      </div>
      <div
        className={`text-lg md:text-2xl font-bold truncate ${
          amountClassName || "text-gray-900"
        }`}
      >
        {amount}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
        {subtitle}
      </div>
    </div>
  )
);

interface DashboardTransactionItemProps {
  type: string;
  title: string;
  category: string;
  amount: number;
  date: string;
}

const DashboardTransactionItem = React.memo(
  ({ type, title, category, amount, date }: DashboardTransactionItemProps) => {
    const isIncome = type === "income";
    const amountString = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", isIncome ? "+Rp" : "-Rp");

    return (
      <div className="flex justify-between items-center py-2 md:py-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`p-1.5 md:p-2 rounded-full ${
              isIncome ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isIncome ? (
              <ArrowUpCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-800 truncate max-w-[120px] sm:max-w-none">
              {title}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 truncate">
              {category}
            </div>
          </div>
        </div>
        <div className="text-right pl-2">
          <div
            className={`font-semibold text-sm ${
              isIncome ? "text-green-600" : "text-red-600"
            }`}
          >
            {amountString}
          </div>
          <div className="text-[10px] text-gray-500">{date}</div>
        </div>
      </div>
    );
  }
);

interface BarChartData {
  name: string;
  Income: number;
  Expense: number;
  [key: string]: any;
}

interface PieChartData {
  name: string;
  value: number;
  percent: number;
  [key: string]: any;
}

const MemoBarChart = React.memo(function MemoBarChart({
  data,
}: {
  data: BarChartData[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          fontSize={10}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          fontSize={10}
          tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000}k`)}
        />
        <Tooltip
          contentStyle={{
            fontSize: "12px",
            borderRadius: "8px",
            padding: "8px",
          }}
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            })
              .format(value)
              .replace("IDR", "Rp"),
            name,
          ]}
          labelFormatter={(label) => `Date: ${label}`}
          cursor={{ fill: "transparent" }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        <Bar
          dataKey="Income"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          barSize={10}
          isAnimationActive={false}
        />
        <Bar
          dataKey="Expense"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          barSize={10}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

const MemoPieChart = React.memo(function MemoPieChart({
  data,
}: {
  data: PieChartData[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("en-US", { style: "currency", currency: "IDR" })
              .format(value)
              .replace("IDR", "Rp")
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

interface DashboardContentProps {
  onAddTransaction: () => void;
  onShowHistory: () => void;
  transactions: TransactionData[];
}

export default function DashboardContent({
  onAddTransaction,
  onShowHistory,
  transactions,
}: DashboardContentProps) {
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("IDR", "Rp");

  const formatBalance = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("IDR", "Rp");

  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
    };
  }, [transactions]);

  const formattedBalance = useMemo(
    () => formatBalance(totalBalance),
    [totalBalance]
  );
  const formattedIncome = useMemo(
    () => formatCurrency(totalIncome),
    [totalIncome]
  );
  const formattedExpense = useMemo(
    () => formatCurrency(totalExpense),
    [totalExpense]
  );

  // Opsi A: semua kategori (income + expense)
  const dynamicPieChartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      const key = tx.category || "Others";
      if (!map[key]) map[key] = 0;
      map[key] += tx.amount;
    }
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [transactions]);

  const dynamicBarChartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    });

    interface TempChartData {
      name: string;
      dateObj: Date;
      Income: number;
      Expense: number;
      [key: string]: any;
    }

    const chartData: TempChartData[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      chartData.push({
        name: dayFormatter.format(d),
        dateObj: d,
        Income: 0,
        Expense: 0,
      });
    }

    for (const tx of transactions) {
      const txDate = parseDateIDN(tx.date);
      if (!txDate) continue;

      const match = chartData.find(
        (c) => c.dateObj.toDateString() === txDate.toDateString()
      );

      if (match) {
        if (tx.type === "income") match.Income += tx.amount;
        else match.Expense += tx.amount;
      }
    }

    return chartData.map(({ dateObj, ...rest }) => rest);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = parseDateIDN(a.date);
        const dateB = parseDateIDN(b.date);
        return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
      })
      .slice(0, 5);
  }, [transactions]);

  const chartWrapperStyle: CSSProperties = {
    contain: "strict",
    willChange: "transform",
  };

  return (
    <motion.main
      className="p-3 md:p-5 pb-20 min-h-[calc(100vh-64px)]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between md:items-center mb-3 gap-3"
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Finance Dashboard
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">
            Manage your personal finances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <History className="h-3.5 w-3.5" /> History
          </button>
          <button
            onClick={onAddTransaction}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-yellow-500 text:white rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium hover:bg-yellow-600 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add New
          </button>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-3"
      >
        <DashboardStatCard
          title="Income (This Month)"
          amount={formattedIncome}
          subtitle="Total incoming"
          icon={
            <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
          }
        />
        <DashboardStatCard
          title="Expense (This Month)"
          amount={formattedExpense}
          subtitle="Total outgoing"
          icon={
            <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
          }
        />
        <DashboardStatCard
          title="Total Balance"
          amount={formattedBalance}
          subtitle="Current balance"
          icon={
            <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          }
        />
      </motion.div>

      {/* CHART GRID */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3"
      >
        {/* BAR CHART */}
        <div className="lg:col-span-3 bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3">
            Activity (7 Days)
          </h3>
          <div className="h-[220px] md:h-[250px] w-full" style={chartWrapperStyle}>
            {isChartReady ? (
              <MemoBarChart data={dynamicBarChartData} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded animate-pulse">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* PIE CHART */}
        <div className="lg:col-span-2 bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3">
            All Categories
          </h3>
          <div className="h-[220px] md:h-[250px] w-full" style={chartWrapperStyle}>
            {isChartReady ? (
              dynamicPieChartData.length > 0 &&
              dynamicPieChartData.some((d) => d.value > 0) ? (
                <MemoPieChart data={dynamicPieChartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-xs md:text-sm text-gray-500">
                  No data available
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded animate-pulse">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* LIST */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100"
      >
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
          Latest Transactions
        </h3>
        <div className="divide-y divide-gray-200">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <DashboardTransactionItem key={tx.id} {...tx} />
            ))
          ) : (
            <div className="text-center py-6 text-xs md:text-sm text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </motion.div>
    </motion.main>
  );
}
