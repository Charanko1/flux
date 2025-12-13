// TaskNotifications.tsx
import React from "react";
import { NotificationLayout } from "@/components/NotificationLayout";

const taskNotifications = [
  { id: "1", title: "Task 1", message: "Selesaikan laporan", type: "task" },
  { id: "2", title: "Task 2", message: "Review PR", type: "task" },
];

const renderTaskIcon = (notification: { type?: "task" | "info" | "warning" }) => {
  if (notification.type === "task") {
    return <span>📝</span>;
  }
  return <span>🔔</span>;
};

export const TaskNotifications: React.FC = () => {
  return (
    <NotificationLayout
      title="Task Notifications"
      notifications={taskNotifications}
      renderIcon={renderTaskIcon}
    />
  );
};
