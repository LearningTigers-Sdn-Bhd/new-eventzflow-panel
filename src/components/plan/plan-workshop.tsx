"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getPlan, createPlanObject, deletePlanObject, exportPlanPdf, autoDistribute, createAssignment, deleteAssignment, updatePlan } from "@/lib/api/plan";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, Download, Loader2, Users, Sparkles, 
    MousePointer2, Eraser, Square as SquareIcon, 
    Undo, Redo, Plus, Settings2, Maximize2, Minimize2,
    Shapes, Trash2, Copy, Lock, Unlock, ChevronLeft,
    Layers, Search, Ruler, Upload, FileImage, PenTool, X, Check,
    Move, RotateCcw, Hash, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { PlanCanvas } from "@/components/plan/plan-canvas";
import { AssetSidebar } from "@/components/plan/asset-sidebar";
import { GuestSidebar, DraggableGuest } from "@/components/plan/guest-sidebar";
import { Inspector } from "@/components/plan/inspector";
import { usePlanEditor } from "@/components/plan/use-plan-editor";
import { toast } from "sonner";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { restClient } from "@/utils/rest-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanObject } from "@/lib/api/plan/response";
import { Unit, pxToUnit, unitToPx } from "./unit-conversion";
import { Card, CardContent } from "@/components/ui/card";
import { DelayedInput } from "./delayed-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PlanWorkshop({ initialPlan, eventId }: { initialPlan: any, eventId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'elements' | 'guests' | 'layers' | 'settings' | 'inspector' | null>('elements');
  const [activeTool, setActiveTool] = useState<'select' | 'floor' | 'eraser'>('select');
  const [unit, setUnit] = useState<Unit>('m');
  const [activeDragItem, setActiveDragItem] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  // Reassignment confirmation state
  const [reassignConfirm, setReassignConfirm] = useState<{
      guestName: string;
      oldTableName: string;
      newTableName: string;
      payload: any;
  } | null>(null);

  const { data: allTickets } = useQuery({
    queryKey: ["tickets", "all", eventId],
    queryFn: () => getEventTickets(eventId),
  });

  const { data: allVisitors } = useQuery({
    queryKey: ["visitors", "all", eventId],
    queryFn: () => getVisitors(eventId),
  });

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

  const assignmentsMap = useMemo(() => {
      const map = new Map<string, PlanObject>();
      plan.plan_objects?.forEach(obj => {
          obj.table_assignments?.forEach(a => {
              if (a.ticket_id) map.set(`ticket-${a.ticket_id}`, obj);
              if (a.visitor_id) map.set(`visitor-${a.visitor_id}`, obj);
          });
      });
      return map;
  }, [plan]);

  const unassignedCount = useMemo(() => {
      const totalCount = (allTickets?.length || 0) + (allVisitors?.length || 0);
      return Math.max(0, totalCount - assignmentsMap.size);
  }, [allTickets, allVisitors, assignmentsMap.size]);

  const isPlanEmpty = !plan.background_image_url && (!plan.plan_objects || plan.plan_objects.length === 0);
  const [showStartup, setShowStartup] = useState(isPlanEmpty);

  // --- Mutations ---

  const uploadBackgroundMutation = useMutation({
    mutationFn: (file: File | null) => updatePlan(plan.id.toString(), { background_image: file }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        toast.success("Plan uploaded successfully");
        setShowStartup(false);
        setIsCalibrating(true); 
    },
    onError: () => toast.error("Failed to upload image")
  });

  const uploadObjectImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number, file: File | null }) => {
        const formData = new FormData();
        if (file) formData.append('plan_object[image]', file);
        return restClient.putFormData<PlanObject>(`v1/plans/${plan.id}/plan_objects/${id}`, formData);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        toast.success("Object design updated");
    },
    onError: () => toast.error("Failed to upload design")
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: { ticket_id?: number; visitor_id?: number; plan_object_id: number }) => 
        createAssignment(plan.id.toString(), data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        toast.success("Guest moved successfully");
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (data: { ticketId?: number; visitorId?: number }) => {
        if (data.ticketId) return deleteAssignment(data.ticketId.toString());
        return restClient.delete(`v1/assignments/${data.visitorId}?visitor_id=${data.visitorId}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        toast.success("Guest unassigned");
    }
  });

  const deleteObjectMutation = useMutation({
    mutationFn: (id: number) => deletePlanObject(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
      setSelectedObjectId(null);
      toast.success("Object deleted");
    },
  });

  const autoDistributeMutation = useMutation({
    mutationFn: () => autoDistribute(plan.id.toString()),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
        toast.success("Auto-distribution complete");
    }
  });

  const addObjectMutation = useMutation({
    mutationFn: ({ type, overrides }: { type: string, overrides?: any }) => {
      let width = 100, height = 100, object_type = type;
      if (type === "table_round") { object_type = "table"; width = 75; height = 75; } 
      else if (type === "table_rect") { object_type = "table"; width = 100; height = 60; } 
      else if (type === "stage") { width = 250; height = 150; } 
      else if (type === "wall") { width = 150; height = 10; }
      return createPlanObject(plan.id.toString(), {
        object_type, x: 100, y: 100, width, height,
        label: (overrides?.label || (type === 'floor' ? null : type.replace("_", " "))),
        capacity: object_type === "table" ? 10 : null,
        rotation: 0, locked: false, z_index: type === 'floor' ? -10 : 0, ...overrides
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
      toast.success("Object added");
    },
  });

  // --- Stable handlers ---

  const handleUpdatePlan = useCallback((updates: any) => {
    updatePlanSettings(updates);
  }, [updatePlanSettings]);

  const handleUploadBackground = useCallback((file: File | null) => {
    uploadBackgroundMutation.mutate(file);
  }, [uploadBackgroundMutation]);

  const handleUploadObjectImage = useCallback((id: number, file: File | null) => {
    uploadObjectImageMutation.mutate({ id, file });
  }, [uploadObjectImageMutation]);

  const handleUpdateObject = useCallback((id: number, updates: Partial<PlanObject>) => {
    updateObject(id, updates);
  }, [updateObject]);

  const handleDeleteObject = useCallback((id: number) => {
    deleteObjectMutation.mutate(id);
  }, [deleteObjectMutation]);

  const handleDeleteAssignment = useCallback((ids: { ticketId?: number; visitorId?: number }) => {
    deleteAssignmentMutation.mutate(ids);
  }, [deleteAssignmentMutation]);

  const handleResetCalibration = useCallback(() => {
      if (plan.background_image_metadata) {
          updatePlanSettings({
              canvas_width: plan.background_image_metadata.width,
              canvas_height: plan.background_image_metadata.height,
              settings_json: { ...plan.settings_json, bgX: 0, bgY: 0, ghostX: 0, ghostY: 0 }
          });
          toast.info("Scale reset to original image size");
      }
  }, [plan.background_image_metadata, plan.settings_json, updatePlanSettings]);

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

          if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) redo(); else undo();
              return;
          }
          if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
              e.preventDefault();
              redo();
              return;
          }

          if (!selectedObject) return;

          if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
              e.preventDefault();
              addObjectMutation.mutate({
                  type: selectedObject.object_type,
                  overrides: {
                      ...selectedObject,
                      id: undefined,
                      x: selectedObject.x + 20,
                      y: selectedObject.y + 20,
                      table_assignments: []
                  }
              });
              return;
          }

          if (e.key === 'Backspace' || e.key === 'Delete') {
              e.preventDefault();
              handleDeleteObject(selectedObject.id);
              return;
          }

          if (!selectedObject.locked) {
              const step = e.shiftKey ? 10 : 1;
              let newX = selectedObject.x;
              let newY = selectedObject.y;

              switch (e.key) {
                  case "ArrowLeft": newX -= step; break;
                  case "ArrowRight": newX += step; break;
                  case "ArrowUp": newY -= step; break;
                  case "ArrowDown": newY += step; break;
                  default: return;
              }
              e.preventDefault();
              updateObjectPosition(selectedObject.id, newX, newY);
          }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObject, undo, redo, addObjectMutation, handleDeleteObject, updateObjectPosition]);

  // Auto-switch to inspector tab when an object is selected
  useEffect(() => {
    if (selectedObjectId) {
        setActiveTab('inspector');
    } else if (activeTab === 'inspector') {
        setActiveTab('elements');
    }
  }, [selectedObjectId]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'guest') {
        setActiveDragItem(event.active.data.current.item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (over && active.data.current?.type === "guest" && over.data.current?.type === "table") {
      const { participantType, item } = active.data.current;
      const targetTable = over.data.current.object;
      
      const payload: any = { plan_object_id: targetTable.id };
      if (participantType === 'ticket') payload.ticket_id = Number(item.id);
      else payload.visitor_id = Number(item.id);

      // Check if already assigned
      const existingTable = assignmentsMap.get(`${participantType}-${item.id}`);
      
      if (existingTable && existingTable.id !== targetTable.id) {
          // Trigger confirmation
          setReassignConfirm({
              guestName: item.name || item.attendee_name || item.full_name,
              oldTableName: existingTable.label || `Table ${existingTable.id}`,
              newTableName: targetTable.label || `Table ${targetTable.id}`,
              payload
          });
      } else {
          // Assign directly
          createAssignmentMutation.mutate(payload);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  const navItems = [
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'guests', label: 'Guests', icon: Users, badge: unassignedCount },
    { id: 'layers', label: 'Layers', icon: Layers },
    ...(selectedObject ? [{ id: 'inspector', label: 'Inspect', icon: Search }] : []),
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TooltipProvider>
      <div className="fixed inset-0 bg-white flex flex-col z-50 overflow-hidden font-sans selection:bg-primary/20">
        
        {/* Top Navigation */}
        <header className={cn(
            "h-14 border-b flex items-center justify-between px-4 bg-white z-50 shrink-0 shadow-sm transition-colors",
            isCalibrating && "bg-slate-900 border-slate-800"
        )}>
           <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className={cn("rounded-md h-8 w-8", isCalibrating ? "text-white hover:bg-white/10" : "hover:bg-slate-100")} asChild>
                    <Link href={`/event/${eventId}/plans`} title="Exit Workshop">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                
                <div className={cn("h-6 w-px mx-1", isCalibrating ? "bg-slate-700" : "bg-slate-200")} />
                
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className={cn("text-sm font-bold truncate max-w-[200px]", isCalibrating ? "text-white" : "text-slate-900")}>{plan.name}</h1>
                        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border", isCalibrating ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200")}>
                            {isSaving || uploadBackgroundMutation.isPending || uploadObjectImageMutation.isPending ? (
                                <>
                                    <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-600" />
                                    <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isCalibrating ? "text-slate-400" : "text-blue-700")}>Syncing</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                    <span className={cn("text-[10px] font-bold tracking-tighter uppercase", isCalibrating ? "text-emerald-400" : "text-emerald-700")}>Saved</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
           </div>

           {/* Center UI */}
           {isCalibrating ? (
               <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
                   <div className="flex items-center gap-2 text-white">
                       <Ruler className="h-4 w-4 text-[#00C4CC]" />
                       <span className="text-xs font-black uppercase tracking-widest text-nowrap">Calibration Mode</span>
                   </div>
                   <div className="h-4 w-px bg-slate-700" />
                   <p className="text-[10px] text-slate-400 font-medium max-w-[300px] leading-tight text-center">Drag image to move, handles to scale. Drag the table to align.</p>
               </div>
           ) : (
               <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-50 p-1 rounded-lg border">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={undo} disabled={!canUndo}><Undo className="h-4 w-4" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={redo} disabled={!canRedo}><Redo className="h-4 w-4" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                    </Tooltip>
               </div>
           )}

           {/* Right Actions */}
           <div className="flex items-center gap-3">
                {isCalibrating ? (
                    <>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-white hover:bg-white/10 font-bold text-xs h-9 px-4 rounded-full"
                            onClick={handleResetCalibration}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Scale
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-[#00C4CC] hover:bg-[#00B4BB] text-white font-black text-xs h-9 px-6 rounded-full shadow-lg shadow-[#00C4CC]/20"
                            onClick={() => setIsCalibrating(false)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Lock Scale
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg border mr-2">
                            <Button 
                                variant={unit === 'm' ? 'secondary' : 'ghost'} 
                                size="sm" className="h-7 px-2 text-[10px] font-bold"
                                onClick={() => setUnit('m')}
                            >Meters</Button>
                            <Button 
                                variant={unit === 'ft' ? 'secondary' : 'ghost'} 
                                size="sm" className="h-7 px-2 text-[10px] font-bold"
                                onClick={() => setUnit('ft')}
                            >Feet</Button>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md px-3 h-9 text-xs font-bold gap-2 text-slate-600 hover:bg-slate-100"
                            onClick={() => {
                                toast.promise(autoDistributeMutation.mutateAsync(), {
                                    loading: 'Auto-filling...',
                                    success: 'Done',
                                    error: 'Failed'
                                });
                            }}
                            disabled={autoDistributeMutation.isPending}
                        >
                            <Sparkles className="h-4 w-4 text-primary" />
                            Auto-Fill
                        </Button>

                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-md px-4 font-bold h-9 bg-[#00C4CC] hover:bg-[#00B4BB] text-white"
                            onClick={() => {
                                toast.promise(exportPlanPdf(plan.id.toString()), {
                                    loading: 'Exporting...',
                                    success: (blob) => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `plan-${plan.name}.pdf`;
                                        a.click();
                                        return 'PDF Ready';
                                    },
                                    error: 'Failed'
                                });
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-600" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </>
                )}
           </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Sidebar Nav */}
            <aside className="w-[72px] bg-[#0e1318] flex flex-col items-center py-4 gap-2 z-40 shrink-0 shadow-xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        disabled={isCalibrating}
                        onClick={() => setActiveTab(activeTab === item.id ? null : item.id as any)}
                        className={cn(
                            "group flex flex-col items-center justify-center w-full py-3 px-1 relative transition-colors duration-200",
                            activeTab === item.id ? "text-white bg-white/10" : "text-[#8b9094] hover:text-white hover:bg-white/5",
                            isCalibrating && "opacity-20 cursor-not-allowed"
                        )}
                    >
                        <item.icon className={cn("h-6 w-6 mb-1 transition-transform group-active:scale-90", activeTab === item.id && "text-[#00C4CC]")} />
                        <span className="text-[10px] font-medium tracking-tight leading-none text-center">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute top-2 right-2 h-4 min-w-[16px] px-1 bg-[#ff4d4d] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0e1318]">
                                {item.badge}
                            </span>
                        )}
                        {activeTab === item.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00C4CC]" />
                        )}
                    </button>
                ))}
            </aside>

            {/* Side Panels */}
            {!isCalibrating && (
                <div className={cn(
                    "h-full border-r bg-white flex flex-col shadow-2xl z-30 transition-all duration-300 ease-in-out",
                    activeTab ? "w-[360px] opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
                )}>
                    <div className="w-[360px] flex flex-col h-full shrink-0">
                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight capitalize">{activeTab}</h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400" onClick={() => setActiveTab(null)}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'elements' && <AssetSidebar onAddObject={(type) => addObjectMutation.mutate({ type })} />}
                            {activeTab === 'guests' && (
                                <GuestSidebar 
                                    eventId={eventId} 
                                    plan={plan} 
                                    onUnassign={handleDeleteAssignment} 
                                />
                            )}
                            {activeTab === 'inspector' && selectedObject && (
                                <Inspector
                                    plan={plan}
                                    object={selectedObject}
                                    onUpdate={handleUpdateObject}
                                    onDelete={handleDeleteObject}
                                    onUpdatePlan={handleUpdatePlan}
                                    onUploadObjectImage={handleUploadObjectImage}
                                    onDeleteAssignment={handleDeleteAssignment}
                                    unit={unit}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <Inspector 
                                    plan={plan} 
                                    object={null} 
                                    onUpdate={() => {}} 
                                    onDelete={() => {}} 
                                    onUpdatePlan={handleUpdatePlan}
                                    onUploadBackground={handleUploadBackground}
                                    unit={unit}
                                />
                            )}
                            {activeTab === 'layers' && (
                                <div className="p-4 space-y-2">
                                    {plan.plan_objects?.map((obj: PlanObject) => (
                                        <button
                                            key={obj.id}
                                            onClick={() => setSelectedObjectId(obj.id)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border text-sm flex items-center justify-between group transition-all",
                                                selectedObjectId === obj.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-slate-50 border-slate-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                                                    <Shapes className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">{obj.label || obj.object_type}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{obj.object_type}</p>
                                                </div>
                                            </div>
                                            {obj.locked && <Lock className="h-3 w-3 text-slate-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <main className="flex-1 flex flex-col relative bg-[#f0f2f5] overflow-hidden">
                
                {/* Startup Overlay */}
                {showStartup && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
                        <Button variant="ghost" size="icon" className="absolute top-6 right-6 rounded-full h-10 w-10 text-slate-400 hover:text-slate-600" onClick={() => setShowStartup(false)}>
                            <X className="h-6 w-6" />
                        </Button>

                        <div className="max-w-4xl w-full flex flex-col gap-12 items-center">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">How would you like to start?</h2>
                                <p className="text-slate-500 font-medium">Choose a workflow to begin designing your seating plan.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 w-full">
                                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-[#00C4CC] transition-all cursor-pointer shadow-xl hover:shadow-2xl active:scale-[0.98]" 
                                      onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.onchange = (e) => {
                                              const file = (e.target as HTMLInputElement).files?.[0];
                                              if (file) handleUploadBackground(file);
                                          };
                                          input.click();
                                      }}>
                                    <CardContent className="p-10 flex flex-col items-center text-center gap-6">
                                        <div className="h-24 w-24 rounded-3xl bg-[#00C4CC]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <FileImage className="h-12 w-12 text-[#00C4CC]" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-slate-900">Upload Your Plan</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                Already have a blueprint or a design? Upload it and place tables directly on top.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#00C4CC] font-bold text-sm uppercase tracking-widest pt-2">
                                            <Upload className="h-4 w-4" />
                                            <span>Upload Image</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-[#00C4CC] transition-all cursor-pointer shadow-xl hover:shadow-2xl active:scale-[0.98]"
                                      onClick={() => setShowStartup(false)}>
                                    <CardContent className="p-10 flex flex-col items-center text-center gap-6">
                                        <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <PenTool className="h-12 w-12 text-slate-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-slate-900">Design from Scratch</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                Start with a blank canvas and use our drawing tools to create your own floor layout.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm uppercase tracking-widest pt-2">
                                            <span>Start Drawing</span>
                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Button variant="ghost" className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest" onClick={() => setShowStartup(false)}>
                                I'll decide later
                            </Button>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className={cn(
                    "h-12 border-b bg-white flex items-center px-4 gap-2 shrink-0 z-20 transition-all duration-300",
                    (selectedObject && !isCalibrating) ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none absolute w-full"
                )}>
                    {selectedObject && (
                        <>
                            <div className="flex items-center gap-2 pr-4 border-r mr-2">
                                <Shapes className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {selectedObject.label || selectedObject.object_type}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border text-[10px] font-bold text-slate-500">
                                <Hash className="h-3 w-3" />
                                <span>{selectedObject.id}</span>
                            </div>

                            <div className="flex-1" />

                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 rounded-md"
                                            onClick={() => handleUpdateObject(selectedObject.id, { locked: !selectedObject.locked })}
                                        >
                                            {selectedObject.locked ? <Lock className="h-4 w-4 text-orange-500" /> : <Unlock className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{selectedObject.locked ? 'Unlock' : 'Lock'}</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 rounded-md"
                                            onClick={() => addObjectMutation.mutate({ 
                                                type: selectedObject.object_type,
                                                overrides: { 
                                                    ...selectedObject, 
                                                    id: undefined, 
                                                    x: selectedObject.x + 20, 
                                                    y: selectedObject.y + 20,
                                                    table_assignments: [] 
                                                }
                                            })}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400 hover:text-destructive hover:bg-destructive/5"
                                            onClick={() => handleDeleteObject(selectedObject.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                            </div>
                        </>
                    )}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                    <div className={cn(
                        "absolute inset-0 shadow-inner pointer-events-none z-10 border-[16px] border-transparent transition-colors",
                        isCalibrating && "bg-black/40"
                    )} />
                    
                    <PlanCanvas
                        plan={plan}
                        selectedObjectId={selectedObjectId}
                        activeTool={activeTool}
                        isCalibrating={isCalibrating}
                        onSelectObject={(id) => {
                            if (activeTool === 'eraser' && id) handleDeleteObject(id);
                            else setSelectedObjectId(id);
                        }}
                        onUpdateObjectPosition={updateObjectPosition}
                        onResizeObject={(id, width, height, x, y) => handleUpdateObject(id, { width, height, x, y })}
                        onUpdatePlan={(updates) => handleUpdatePlan(updates)}
                        onUpdateObject={handleUpdateObject}
                        onDeleteObject={handleDeleteObject}
                        onCreateObject={(data) => addObjectMutation.mutate({ 
                            type: data.object_type, 
                            overrides: { ...data }
                        })}
                    />

                    {/* Quick Tools */}
                    {!isCalibrating && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white border rounded-lg shadow-2xl z-20 animate-in slide-in-from-bottom-4">
                            <Button 
                                variant={activeTool === 'select' ? "secondary" : "ghost"} 
                                size="sm" className="h-9 px-3 gap-2" 
                                onClick={() => setActiveTool('select')}
                            >
                                <MousePointer2 className="h-4 w-4" />
                                <span className="text-xs font-bold">Select</span>
                            </Button>
                            <Button 
                                variant={activeTool === 'floor' ? "secondary" : "ghost"} 
                                size="sm" className="h-9 px-3 gap-2" 
                                onClick={() => setActiveTool('floor')}
                            >
                                <SquareIcon className="h-4 w-4" />
                                <span className="text-xs font-bold">Draw</span>
                            </Button>
                            <Button 
                                variant={activeTool === 'eraser' ? "secondary" : "ghost"} 
                                size="sm" className="h-9 px-3 gap-2 text-slate-500 hover:text-destructive" 
                                onClick={() => setActiveTool('eraser')}
                            >
                                <Eraser className="h-4 w-4" />
                                <span className="text-xs font-bold">Erase</span>
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* Reassignment Confirmation Dialog */}
        <AlertDialog open={!!reassignConfirm} onOpenChange={(open) => !open && setReassignConfirm(null)}>
            <AlertDialogContent className="max-w-md rounded-2xl">
                <AlertDialogHeader>
                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <AlertDialogTitle className="text-xl font-black tracking-tight">Move Guest?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 font-medium leading-relaxed">
                        Are you sure you want to move <span className="font-bold text-slate-900">{reassignConfirm?.guestName}</span> from <span className="font-bold text-slate-900">{reassignConfirm?.oldTableName}</span> to <span className="font-bold text-slate-900">{reassignConfirm?.newTableName}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="rounded-full font-bold border-slate-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        className="rounded-full font-bold bg-[#00C4CC] hover:bg-[#00B4BB] text-white"
                        onClick={() => {
                            if (reassignConfirm) {
                                createAssignmentMutation.mutate(reassignConfirm.payload);
                                setReassignConfirm(null);
                            }
                        }}
                    >
                        Confirm Move
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
      
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
            <div className="z-[100] cursor-grabbing scale-105 transition-transform">
                <DraggableGuest item={activeDragItem} isOverlay />
            </div>
        ) : null}
      </DragOverlay>
      </TooltipProvider>
    </DndContext>
  );
}
