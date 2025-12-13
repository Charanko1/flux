"use client";

import React, { useEffect, useState } from "react";
import {
  NotificationLayout,
  Notification,
} from "@/components/NotificationLayout";

export const TaskNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Icon per notifikasi task
  const renderTaskIcon = (notification: Notification) => {
    if (notification.type === "task") return "📝";
    if (notification.type === "warning") return "⚠️";
    return "🔔";
  };

  // Toggle read di UI + (opsional) kirim ke backend
  const handleToggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: !n.read,
            }
          : n
      )
    );

    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Gagal update status notifikasi:", error);
    }
  };

  // Ambil notifikasi asli dari backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?type=task", {
          cache: "no-store",
        });
        if (res.ok) {
          const data: Notification[] = await res.json();
          setNotifications(data);
        } else {
          console.error("Gagal fetch notifications:", res.status);
        }
      } catch (error) {
        console.error("Error fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-4">
      <NotificationLayout
        title="Task Notifications"
        notifications={notifications}
        renderIcon={renderTaskIcon}
        onToggleRead={handleToggleRead}
      />
    </div>
  );
};
