"use client";

import { Smartphone, Tablet, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DeviceSize = "mobile" | "tablet" | "desktop";

interface DeviceToggleProps {
  currentDevice: DeviceSize;
  onDeviceChange: (device: DeviceSize) => void;
}

export function DeviceToggle({ currentDevice, onDeviceChange }: DeviceToggleProps) {
  const devices: { id: DeviceSize; icon: React.ReactNode; label: string; width: string }[] = [
    { id: "mobile", icon: <Smartphone className="h-4 w-4" />, label: "Mobile", width: "375px" },
    { id: "tablet", icon: <Tablet className="h-4 w-4" />, label: "Tablet", width: "768px" },
    { id: "desktop", icon: <Monitor className="h-4 w-4" />, label: "Desktop", width: "100%" },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
      {devices.map((device) => (
        <Button
          key={device.id}
          variant={currentDevice === device.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onDeviceChange(device.id)}
          className="flex items-center gap-2"
        >
          {device.icon}
          <span className="hidden sm:inline">{device.label}</span>
          <span className="hidden md:inline text-xs text-gray-500">({device.width})</span>
        </Button>
      ))}
    </div>
  );
}
