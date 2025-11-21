// components/SwitchToggle.tsx
"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

type Props = {
  label: string;
  description: string;
  defaultEnabled?: boolean;
};

export default function SwitchToggle({
  label,
  description,
  defaultEnabled = false,
}: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled ? "bg-gray-900" : "bg-gray-200" // Diubah ke bg-gray-900
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
}