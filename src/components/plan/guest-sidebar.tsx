"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { Input } from "@/components/ui/input";
import { Search, User, ShieldCheck, UserMinus, MoveRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GuestSidebarProps {
  eventId: string;
  plan: Plan;
  onUnassign: (ids: { ticketId?: number; visitorId?: number }) => void;
}

export function GuestSidebar({ eventId, plan, onUnassign }: GuestSidebarProps) {
  const [search, setSearch] = useState("");

  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["tickets", "all", eventId],
    queryFn: () => getEventTickets(eventId), // Fetch all tickets
  });

  const { data: visitors, isLoading: isLoadingVisitors } = useQuery({
    queryKey: ["visitors", "all", eventId],
    queryFn: () => getVisitors(eventId), // Fetch all visitors
  });

  const isLoading = isLoadingTickets || isLoadingVisitors;

  // Map of guest ID to PlanObject for quick lookup
  const assignments = useMemo(() => {
      const map = new Map<string, PlanObject>();
      plan.plan_objects?.forEach(obj => {
          obj.table_assignments?.forEach(asgn => {
              if (asgn.ticket_id) map.set(`ticket-${asgn.ticket_id}`, obj);
              if (asgn.visitor_id) map.set(`visitor-${asgn.visitor_id}`, obj);
          });
      });
      return map;
  }, [plan]);

  const mergedList = useMemo(() => {
    const list = [
        ...(tickets || []).map(t => ({ ...t, type: 'ticket' as const })),
        ...(visitors || []).map(v => ({ 
            ...v, 
            name: v.full_name, 
            ticketTypeName: 'Visitor',
            type: 'visitor' as const 
        })),
    ];
    return list;
  }, [tickets, visitors]);

  const filteredList = mergedList.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
      // Show unassigned first
      const aAssigned = assignments.has(`${a.type}-${a.id}`);
      const bAssigned = assignments.has(`${b.type}-${b.id}`);
      if (aAssigned === bAssigned) return 0;
      return aAssigned ? 1 : -1;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search guests (name, email)..."
            className="pl-9 h-10 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">No guests found.</p>
          </div>
        ) : (
          filteredList.map((item) => (
            <DraggableGuest 
                key={`${item.type}-${item.id}`} 
                item={item} 
                assignedTo={assignments.get(`${item.type}-${item.id}`)}
                onUnassign={() => onUnassign(item.type === 'ticket' ? { ticketId: item.id } : { visitorId: item.id })}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface DraggableGuestProps {
    item: any;
    assignedTo?: PlanObject;
    onUnassign?: () => void;
    isOverlay?: boolean;
}

export function DraggableGuest({ item, assignedTo, onUnassign, isOverlay }: DraggableGuestProps) {
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
    return <div ref={setNodeRef} className="h-16 w-full rounded-xl bg-slate-100 border-2 border-dashed border-slate-200" />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group p-3 bg-white border rounded-xl shadow-sm flex flex-col gap-2 transition-all relative",
        assignedTo ? "border-slate-100 opacity-80 hover:opacity-100" : "hover:border-primary/50 hover:shadow-md",
        isOverlay ? "cursor-grabbing ring-2 ring-primary" : "cursor-grab active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-0"
      )}
    >
      <div className="flex items-center gap-3">
          <div {...listeners} {...attributes} className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-inner",
              item.type === 'ticket' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
          )}>
            {item.type === 'ticket' ? <User className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          
          <div {...listeners} {...attributes} className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{item.name || "Unknown Guest"}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.ticketTypeName}</p>
          </div>

          {!isOverlay && assignedTo && (
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onUnassign?.(); }}
                      >
                          <UserMinus className="h-4 w-4" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unassign Guest</TooltipContent>
              </Tooltip>
          )}
      </div>

      {assignedTo && (
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Assigned to {assignedTo.label || assignedTo.object_type}</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  <MoveRight className="h-3 w-3" />
                  <span>Drag to Move</span>
              </div>
          </div>
      )}
    </div>
  );
}
