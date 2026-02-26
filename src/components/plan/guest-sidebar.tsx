"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { Input } from "@/components/ui/input";
import { Search, User, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface GuestSidebarProps {
  eventId: string;
}

export function GuestSidebar({ eventId }: GuestSidebarProps) {
  const [search, setSearch] = useState("");

  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["tickets", "unassigned", eventId],
    queryFn: () => getEventTickets(eventId, { unassigned: true }),
  });

  const { data: visitors, isLoading: isLoadingVisitors } = useQuery({
    queryKey: ["visitors", "unassigned", eventId],
    queryFn: () => getVisitors(eventId, { unassigned: true }),
  });

  const isLoading = isLoadingTickets || isLoadingVisitors;

  const mergedList = [
    ...(tickets || []).map(t => ({ ...t, type: 'ticket' as const })),
    ...(visitors || []).map(v => ({ 
        ...v, 
        name: v.full_name, 
        ticketTypeName: 'Visitor',
        type: 'visitor' as const 
    })),
  ];

  const filteredList = mergedList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))
        ) : filteredList.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No unassigned guests found.
          </p>
        ) : (
          filteredList.map((item) => (
            <DraggableGuest key={`${item.type}-${item.id}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

export function DraggableGuest({ item, isOverlay }: { item: any; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${item.type}-${item.id}`,
    data: {
      type: "guest",
      participantType: item.type,
      item,
    },
  });

  const style = !isOverlay && transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isDragging && !isOverlay) {
    return <div ref={setNodeRef} className="h-12 w-full rounded-md bg-slate-100 border-dashed border" />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 bg-card border rounded-md shadow-sm flex items-center gap-3 transition-opacity",
        isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-50 border-primary bg-primary/5"
      )}
    >
      <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          item.type === 'ticket' ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
      )}>
        {item.type === 'ticket' ? <User className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.ticketTypeName}</p>
      </div>
    </div>
  );
}
