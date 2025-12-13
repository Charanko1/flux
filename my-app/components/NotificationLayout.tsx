import React from "react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type?: "task" | "info" | "warning";
  createdAt: string;
  read: boolean;
};

type NotificationLayoutProps = {
  title: string;
  notifications: Notification[];
  renderIcon?: (notification: Notification) => React.ReactNode;
  onToggleRead?: (id: string) => void;
};

export const NotificationLayout: React.FC<NotificationLayoutProps> = ({
  title,
  notifications,
  renderIcon,
  onToggleRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-gray-500">
            {unreadCount} notifikasi belum dibaca
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {notifications.length} total
        </span>
      </div>

      <ul className="divide-y">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors ${
              n.read ? "bg-white" : "bg-blue-50"
            }`}
          >
            <div className="mt-1">
              {renderIcon && (
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                    n.read ? "bg-gray-100 text-gray-500" : "bg-blue-600 text-white"
                  }`}
                >
                  {renderIcon(n)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm font-medium ${
                    n.read ? "text-gray-700" : "text-gray-900"
                  }`}
                >
                  {n.title}
                </p>
                <span className="text-xs text-gray-400">{n.createdAt}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{n.message}</p>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    n.read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {n.read ? "Sudah dibaca" : "Belum dibaca"}
                </span>

                {onToggleRead && (
                  <button
                    onClick={() => onToggleRead(n.id)}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    {n.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
