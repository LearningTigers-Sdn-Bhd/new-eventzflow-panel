"use client";

import { Button } from "@/components/ui/button";
import { PlanObject } from "@/lib/api/plan/response";
import { Square, Circle, Layout, DoorOpen } from "lucide-react";

interface AssetSidebarProps {
  onAddObject: (type: string) => void;
}

export function AssetSidebar({ onAddObject }: AssetSidebarProps) {
  const assets = [
    { type: "table_round", label: "Round Table", icon: Circle },
    { type: "table_rect", label: "Rect Table", icon: Square },
    { type: "stage", label: "Stage", icon: Layout },
    { type: "wall", label: "Wall", icon: Square },
    { type: "door", label: "Door", icon: DoorOpen },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {assets.map((asset) => (
          <Button
            key={asset.type}
            variant="outline"
            className="flex flex-col h-20 items-center justify-center gap-2"
            onClick={() => onAddObject(asset.type)}
          >
            <asset.icon className="h-6 w-6" />
            <span className="text-xs">{asset.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
