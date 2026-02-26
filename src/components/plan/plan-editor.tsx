"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getPlan, createPlanObject, deletePlanObject, exportPlanPdf, autoDistribute, createAssignment, deleteAssignment } from "@/lib/api/plan";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Save, Loader2, Users, Sparkles, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, MousePointer2, Eraser, Square as SquareIcon, Undo, Redo } from "lucide-react";
import Link from "next/link";
import { PlanCanvas } from "@/components/plan/plan-canvas";
import { AssetSidebar } from "@/components/plan/asset-sidebar";
import { GuestSidebar } from "@/components/plan/guest-sidebar";
import { Inspector } from "@/components/plan/inspector";
import { usePlanEditor } from "@/components/plan/use-plan-editor";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { restClient } from "@/utils/rest-api";
import { DraggableGuest } from "./guest-sidebar";

export function PlanEditorContent({ initialPlan, eventId }: { initialPlan: any, eventId: string }) {
  const queryClient = useQueryClient();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'floor' | 'eraser'>('select');
  const [activeDragItem, setActiveDragItem] = useState<any | null>(null);
  
  const { data: unassignedTickets } = useQuery({
    queryKey: ["tickets", "unassigned", eventId],
    queryFn: () => getEventTickets(eventId, { unassigned: true }),
  });

  const { data: unassignedVisitors } = useQuery({
    queryKey: ["visitors", "unassigned", eventId],
    queryFn: () => getVisitors(eventId, { unassigned: true }),
  });

  const totalUnassigned = (unassignedTickets?.length || 0) + (unassignedVisitors?.length || 0);

  const {
    plan,
    selectedObjectId,
    selectedObject,
    setSelectedObjectId,
    updateObjectPosition,
    updateObject,
    updatePlanSettings,
    isSaving,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePlanEditor(initialPlan);

  const sensors = useSensors(
    useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    }),
    useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    })
  );

  const createAssignmentMutation = useMutation({
    mutationFn: (data: { ticket_id?: number; visitor_id?: number; plan_object_id: number }) => 
        createAssignment(plan.id.toString(), data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        queryClient.invalidateQueries({ queryKey: ["tickets", "unassigned", eventId] });
        queryClient.invalidateQueries({ queryKey: ["visitors", "unassigned", eventId] });
        toast.success("Guest assigned");
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (data: { ticket_id?: number; visitor_id?: number }) => {
        if (data.ticket_id) return deleteAssignment(data.ticket_id.toString());
        // Custom call for visitor assignment deletion using query parameter
        return restClient.delete(`v1/assignments/${data.visitor_id}?visitor_id=${data.visitor_id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        queryClient.invalidateQueries({ queryKey: ["tickets", "unassigned", eventId] });
        queryClient.invalidateQueries({ queryKey: ["visitors", "unassigned", eventId] });
        toast.success("Guest unassigned");
    }
  });

  const autoDistributeMutation = useMutation({
    mutationFn: () => autoDistribute(plan.id.toString()),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        queryClient.invalidateQueries({ queryKey: ["tickets", "unassigned", eventId] });
        queryClient.invalidateQueries({ queryKey: ["visitors", "unassigned", eventId] });
        toast.success("Auto-distribution complete");
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'guest') {
        setActiveDragItem(event.active.data.current.item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (over && active.data.current?.type === "guest" && over.data.current?.type === "table") {
      const participantType = active.data.current.participantType;
      const item = active.data.current.item;
      const tableId = over.data.current.object.id;

      const payload: any = {
        plan_object_id: tableId,
      };

      if (participantType === 'ticket') {
          payload.ticket_id = Number(item.id);
      } else {
          payload.visitor_id = Number(item.id);
      }

      createAssignmentMutation.mutate(payload);
    }
  };

  const addObjectMutation = useMutation({
    mutationFn: ({ type, overrides }: { type: string, overrides?: any }) => {
      let width = 100;
      let height = 100;
      let object_type = type;

      if (type === "table_round") {
        object_type = "table";
        width = 120;
        height = 120;
      } else if (type === "table_rect") {
        object_type = "table";
        width = 160;
        height = 100;
      } else if (type === "stage") {
        width = 300;
        height = 200;
      } else if (type === "wall") {
        width = 200;
        height = 20;
      } else if (type === "floor_diagonal") {
        object_type = "floor";
        width = 200;
        height = 200;
        overrides = { ...overrides, rotation: 45 };
      } else if (type === "wall_diagonal") {
        object_type = "wall";
        width = 200;
        height = 20;
        overrides = { ...overrides, rotation: 45 };
      }

      return createPlanObject(plan.id.toString(), {
        object_type,
        x: 100,
        y: 100,
        width,
        height,
        label: type === 'floor' ? null : type.replace("_", " "),
        capacity: object_type === "table" ? 10 : null,
        rotation: 0,
        locked: false,
        z_index: type === 'floor' ? -10 : 0,
        ...overrides
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
      toast.success("Object added");
    },
  });

  const deleteObjectMutation = useMutation({
    mutationFn: (id: number) => deletePlanObject(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["tickets", "unassigned", eventId] });
      queryClient.invalidateQueries({ queryKey: ["visitors", "unassigned", eventId] });
      setSelectedObjectId(null);
      toast.success("Object deleted");
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => exportPlanPdf(plan.id.toString()),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-${plan.name}.pdf`;
      a.click();
      toast.success("PDF exported");
    },
  });

  return (
    <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-8rem)] flex-col border rounded-lg overflow-hidden bg-background">
        {/* Header/Toolbar */}
        <div className="border-b p-2 px-4 flex justify-between items-center bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/event/${eventId}/plans`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight">{plan.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {plan.canvas_width} x {plan.canvas_height} px
                </span>
                <span className="text-muted-foreground text-[10px]">•</span>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 rounded border border-orange-100">
                  <Users className="h-3 w-3" />
                  {totalUnassigned} UNASSIGNED
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="flex bg-muted/50 p-1 rounded-md mr-2 border">
                <Button 
                    variant="ghost"
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost"
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex bg-muted/50 p-1 rounded-md mr-2 border">
                <Button 
                    variant={activeTool === 'select' ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setActiveTool('select')}
                    title="Selection Tool"
                >
                    <MousePointer2 className="h-4 w-4" />
                </Button>
                <Button 
                    variant={activeTool === 'floor' ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setActiveTool('floor')}
                    title="Build Floor (Drag to Draw)"
                >
                    <SquareIcon className="h-4 w-4" />
                </Button>
                <Button 
                    variant={activeTool === 'eraser' ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setActiveTool('eraser')}
                    title="Eraser Tool"
                >
                    <Eraser className="h-4 w-4" />
                </Button>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                title={isLeftSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                {isLeftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                title={isRightSidebarOpen ? "Collapse Inspector" : "Expand Inspector"}
            >
                {isRightSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
            <div className="h-4 w-px bg-border mx-1" />

            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => autoDistributeMutation.mutate()}
              disabled={autoDistributeMutation.isPending}
              className="text-primary hover:text-primary"
            >
              {autoDistributeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Auto-Distribute
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar (Guests & Assets) */}
          <div 
            className={cn(
                "border-r bg-muted/10 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
                isLeftSidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-r-0"
            )}
          >
            <div className="min-w-[20rem] h-full flex flex-col">
                <Tabs defaultValue="guests" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                    <TabsTrigger value="guests" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Guests</TabsTrigger>
                    <TabsTrigger value="assets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Assets</TabsTrigger>
                </TabsList>
                <TabsContent value="guests" className="flex-1 overflow-y-auto m-0">
                    <GuestSidebar eventId={eventId} />
                </TabsContent>
                <TabsContent value="assets" className="flex-1 overflow-y-auto m-0">
                    <AssetSidebar onAddObject={(type) => addObjectMutation.mutate({ type })} />
                </TabsContent>
                </Tabs>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-slate-50 relative overflow-hidden">
            <PlanCanvas
              plan={plan}
              selectedObjectId={selectedObjectId}
              activeTool={activeTool}
              onSelectObject={(id) => {
                  if (activeTool === 'eraser' && id) {
                      deleteObjectMutation.mutate(id);
                  } else {
                      setSelectedObjectId(id);
                  }
              }}
              onUpdateObjectPosition={updateObjectPosition}
              onResizeObject={(id, width, height, x, y) => {
                updateObject(id, { width, height, x, y });
              }}
              onCreateObject={(data) => addObjectMutation.mutate({ 
                  type: data.object_type, 
                  overrides: {
                    x: data.x, 
                    y: data.y, 
                    width: data.width, 
                    height: data.height 
                  }
              })}
            />
          </div>

          {/* Inspector Panel (Right) */}
          <div 
            className={cn(
                "border-l bg-background flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
                isRightSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-l-0"
            )}
          >
            <div className="min-w-[16rem] h-full flex flex-col">
                <div className="p-4 border-b font-medium flex justify-between items-center">
                    Properties
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsRightSidebarOpen(false)}>
                        <PanelRightClose className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                <Inspector
                    plan={plan}
                    object={selectedObject}
                    onUpdate={updateObject}
                    onUpdatePlan={updatePlanSettings}
                    onDelete={(id) => deleteObjectMutation.mutate(id)}
                    onDeleteAssignment={(ids) => deleteAssignmentMutation.mutate({ 
                        ticket_id: ids.ticketId, 
                        visitor_id: ids.visitorId 
                    })}
                />
                </div>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeDragItem ? <DraggableGuest item={activeDragItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}