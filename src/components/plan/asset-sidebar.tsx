"use client";

import { Button } from "@/components/ui/button";
import { 
    Square, Circle, Layout, DoorOpen, 
    Type, Grid3X3, Minus, MousePointer2 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssetSidebarProps {
  onAddObject: (type: string) => void;
}

export function AssetSidebar({ onAddObject }: AssetSidebarProps) {
  const categories = [
    {
      name: "Tables",
      items: [
        { type: "table_round", label: "Round Table", icon: Circle },
        { type: "table_rect", label: "Rect Table", icon: Square },
      ]
    },
    {
      name: "Furniture",
      items: [
        { type: "stage", label: "Stage", icon: Layout },
      ]
    },
    {
      name: "Venue",
      items: [
        { type: "wall", label: "Wall", icon: Minus },
        { type: "wall_diagonal", label: "Diag Wall", icon: Minus, rotate: 45 },
        { type: "door", label: "Door", icon: DoorOpen },
      ]
    },
    {
        name: "Drawing",
        items: [
          { type: "floor", label: "Floor Area", icon: Grid3X3 },
          { type: "floor_diagonal", label: "Diag Floor", icon: Grid3X3, rotate: 45 },
        ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 space-y-8">
        {categories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                {category.name}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {category.items.map((item) => (
                <button
                  key={item.type}
                  className="group flex flex-col items-center justify-center gap-2 p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                  onClick={() => onAddObject(item.type)}
                >
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-colors">
                    <item.icon 
                        className="h-6 w-6 text-slate-600" 
                        style={item.rotate ? { transform: `rotate(${item.rotate}deg)` } : undefined} 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
