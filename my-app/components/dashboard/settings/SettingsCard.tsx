// components/SettingsCard.tsx
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function SettingsCard({
  icon,
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-gray-500">{icon}</div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}