"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Download,
	Eraser,
	Loader2,
	Maximize2,
	MousePointer2,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	Redo,
	Save,
	Sparkles,
	Square as SquareIcon,
	Undo,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AssetSidebar } from "@/components/plan/asset-sidebar";
import { GuestSidebar } from "@/components/plan/guest-sidebar";
import { Inspector } from "@/components/plan/inspector";
import { PlanCanvas } from "@/components/plan/plan-canvas";
import { usePlanEditor } from "@/components/plan/use-plan-editor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	autoDistribute,
	batchCreatePlanObjects,
	batchDeletePlanObjects,
	batchUpdatePlanObjects,
	createAssignment,
	createPlanObject,
	deleteAssignment,
	deletePlanObject,
	exportPlanPdf,
	getPlan,
	updateAssignment,
} from "@/lib/api/plan";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import { restClient } from "@/utils/rest-api";
import { DraggableGuest } from "./guest-sidebar";

export function PlanEditorContent({
	initialPlan,
	eventId,
}: {
	initialPlan: any;
	eventId: string;
}) {
	const queryClient = useQueryClient();
	const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
	const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
	const [activeTool, setActiveTool] = useState<"select" | "floor" | "eraser">(
		"select",
	);
	const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

	const { data: unassignedTickets } = useQuery({
		queryKey: ["tickets", "unassigned", eventId],
		queryFn: () => getEventTickets(eventId, { unassigned: true }),
	});

	const { data: unassignedVisitors } = useQuery({
		queryKey: ["visitors", "unassigned", eventId],
		queryFn: () => getVisitors(eventId, { unassigned: true }),
	});

	const totalUnassigned =
		(unassignedTickets?.length || 0) + (unassignedVisitors?.length || 0);

	const {
		plan,
		selectedObjectIds,
		selectedObjects,
		selectedObject,
		setSelectedObjectIds,
		updateObjectPosition,
		updateObject,
		updateObjects,
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
		}),
	);

	const createAssignmentMutation = useMutation({
		mutationFn: (data: {
			ticket_id?: number;
			visitor_id?: number;
			plan_object_id: number;
		}) => createAssignment(plan.id.toString(), data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			queryClient.invalidateQueries({
				queryKey: ["tickets", "unassigned", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["visitors", "unassigned", eventId],
			});
			toast.success("Guest assigned");
		},
	});

	const deleteAssignmentMutation = useMutation({
		mutationFn: (data: { ticket_id?: number; visitor_id?: number }) => {
			if (data.ticket_id) return deleteAssignment(data.ticket_id.toString(), plan.id.toString());
			return deleteAssignment(data.visitor_id!.toString(), plan.id.toString(), data.visitor_id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			queryClient.invalidateQueries({
				queryKey: ["tickets", "unassigned", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["visitors", "unassigned", eventId],
			});
			toast.success("Guest unassigned");
		},
	});

	const autoDistributeMutation = useMutation({
		mutationFn: () => autoDistribute(plan.id.toString()),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			queryClient.invalidateQueries({
				queryKey: ["tickets", "unassigned", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["visitors", "unassigned", eventId],
			});
			toast.success("Auto-distribution complete");
		},
	});

	const handleDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === "guest") {
			setActiveDragItem(event.active.data.current.item);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveDragItem(null);
		const { active, over } = event;

		if (
			over &&
			active.data.current?.type === "guest" &&
			over.data.current?.type === "table"
		) {
			const participantType = active.data.current.participantType;
			const item = active.data.current.item;
			const tableId = over.data.current.object.id;

			const payload: any = {
				plan_object_id: tableId,
			};

			if (participantType === "ticket") {
				payload.ticket_id = Number(item.id);
			} else {
				payload.visitor_id = Number(item.id);
			}

			createAssignmentMutation.mutate(payload);
		}
	};

	const addObjectMutation = useMutation({
		mutationFn: ({ type, overrides }: { type: string; overrides?: any }) => {
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
				label: type === "floor" ? null : type.replace("_", " "),
				capacity: object_type === "table" ? 10 : null,
				rotation: 0,
				locked: false,
				z_index: type === "floor" ? -10 : 0,
				...overrides,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Object added");
		},
	});

	const deleteObjectsMutation = useMutation({
		mutationFn: (ids: number[]) => batchDeletePlanObjects(plan.id.toString(), ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			queryClient.invalidateQueries({
				queryKey: ["tickets", "unassigned", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["visitors", "unassigned", eventId],
			});
			setSelectedObjectIds([]);
			toast.success("Objects deleted");
		},
	});

	const duplicateObjectsMutation = useMutation({
		mutationFn: async (objects: PlanObject[]) => {
			await savePendingChanges();
			const duplicates = objects.map(obj => ({
				object_type: obj.object_type,
				layer: obj.layer,
				x: obj.x + 20,
				y: obj.y + 20,
				rotation: obj.rotation || 0,
				width: obj.width,
				height: obj.height,
				path: obj.path,
				label: obj.label ? `${obj.label} (Copy)` : undefined,
				capacity: obj.capacity,
				locked: false,
				z_index: obj.z_index || 0,
			}));
			return batchCreatePlanObjects(plan.id.toString(), duplicates);
		},
		onSuccess: (newObjects) => {
			// Select the newly created objects immediately
			if (newObjects && newObjects.length > 0) {
				addObjects(newObjects);
				setSelectedObjectIds(newObjects.map(obj => obj.id));
			} else {
				setSelectedObjectIds([]);
			}
			
			// Background refetch
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Objects duplicated");
		},
	});

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey) {
				if (e.key === "d" && selectedObjectIds.length > 0) {
					e.preventDefault();
					duplicateObjectsMutation.mutate(selectedObjects);
				}
			}
			if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectIds.length > 0) {
				// Only if not typing in an input
				if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
					e.preventDefault();
					deleteObjectsMutation.mutate(selectedObjectIds);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedObjectIds, selectedObjects, duplicateObjectsMutation, deleteObjectsMutation]);

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
			<div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border bg-background">
				{/* Header/Toolbar */}
				<div className="flex items-center justify-between border-b bg-card p-2 px-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<Link href={`/event/${eventId}/plans`}>
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<div className="flex flex-col">
							<h1 className="font-bold text-lg leading-tight">{plan.name}</h1>
							<div className="flex items-center gap-2">
								<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
									{plan.canvas_width} x {plan.canvas_height} px
								</span>
								<span className="text-[10px] text-muted-foreground">•</span>
								<div className="flex items-center gap-1 rounded border border-orange-100 bg-orange-50 px-1.5 font-semibold text-[10px] text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-400">
									<Users className="h-3 w-3" />
									{totalUnassigned} UNASSIGNED
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="mr-2 flex rounded-md border bg-muted/50 p-1">
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

						<div className="mr-2 flex rounded-md border bg-muted/50 p-1">
							<Button
								variant={activeTool === "select" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setActiveTool("select")}
								title="Selection Tool"
							>
								<MousePointer2 className="h-4 w-4" />
							</Button>
							<Button
								variant={activeTool === "floor" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setActiveTool("floor")}
								title="Build Floor (Drag to Draw)"
							>
								<SquareIcon className="h-4 w-4" />
							</Button>
							<Button
								variant={activeTool === "eraser" ? "secondary" : "ghost"}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setActiveTool("eraser")}
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
							{isLeftSidebarOpen ? (
								<PanelLeftClose className="h-4 w-4" />
							) : (
								<PanelLeftOpen className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
							title={
								isRightSidebarOpen ? "Collapse Inspector" : "Expand Inspector"
							}
						>
							{isRightSidebarOpen ? (
								<PanelRightClose className="h-4 w-4" />
							) : (
								<PanelRightOpen className="h-4 w-4" />
							)}
						</Button>

						<div className="mx-1 h-4 w-px bg-border" />

						<Button
							variant="outline"
							size="sm"
							className="gap-2 border-primary/20 font-bold text-primary hover:bg-primary/5"
							asChild
						>
							<Link
								href={`/event/${eventId}/plans/${plan.id}/editor`}
								target="_blank"
							>
								<Maximize2 className="h-4 w-4" />
								Workshop Mode
							</Link>
						</Button>

						<div className="mx-1 h-4 w-px bg-border" />

						{isSaving && (
							<span className="flex items-center gap-1 text-muted-foreground text-xs">
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
							{autoDistributeMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Sparkles className="mr-2 h-4 w-4" />
							)}
							Auto-Distribute
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportMutation.mutate()}
							disabled={exportMutation.isPending}
						>
							{exportMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Download className="mr-2 h-4 w-4" />
							)}
							Export PDF
						</Button>
					</div>
				</div>

				<div className="relative flex flex-1 overflow-hidden">
					{/* Sidebar (Guests & Assets) */}
					<div
						className={cn(
							"flex flex-col overflow-hidden border-r bg-muted/10 transition-all duration-300 ease-in-out",
							isLeftSidebarOpen
								? "w-80 opacity-100"
								: "w-0 border-r-0 opacity-0",
						)}
					>
						<div className="flex h-full min-w-[20rem] flex-col">
							<Tabs defaultValue="guests" className="flex flex-1 flex-col">
								<TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
									<TabsTrigger
										value="guests"
										className="rounded-none border-transparent border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
									>
										Guests
									</TabsTrigger>
									<TabsTrigger
										value="assets"
										className="rounded-none border-transparent border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
									>
										Assets
									</TabsTrigger>
								</TabsList>
								<TabsContent
									value="guests"
									className="m-0 flex-1 overflow-y-auto"
								>
									<GuestSidebar
										eventId={eventId}
										plan={plan}
										seatingGroups={[]}
										groupMembershipMap={new Map()}
										onCreateGroup={() => {}}
										onUpdateGroup={() => {}}
										onDeleteGroup={() => {}}
										onSetGuestGroup={() => {}}
										onUnassign={() => {}}
									/>
								</TabsContent>
								<TabsContent
									value="assets"
									className="m-0 flex-1 overflow-y-auto"
								>
									<AssetSidebar
										onAddObject={(type) => addObjectMutation.mutate({ type })}
									/>
								</TabsContent>
							</Tabs>
						</div>
					</div>

					{/* Canvas Area */}
					<div className="relative flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
						<PlanCanvas
							plan={plan}
							selectedObjectIds={selectedObjectIds}
							activeTool={activeTool}
							onSelectObject={(ids) => {
								if (activeTool === "eraser" && ids.length > 0) {
									deleteObjectsMutation.mutate(ids);
								} else {
									setSelectedObjectIds(ids);
								}
							}}
							onUpdateObjectPosition={updateObjectPosition}
							onUpdateMultiplePositions={(updates) => {
								batchUpdatePlanObjects(plan.id.toString(), updates);
								// Also update local state for immediate feedback
								updateObjects(updates.map(u => ({ id: u.id, updates: { x: u.x, y: u.y } })));
							}}
							onResizeObject={(id, width, height, x, y) => {
								updateObject(id, { width, height, x, y });
							}}
							onDuplicateObjects={(ids) => {
								const objectsToDuplicate = plan.plan_objects.filter(obj => ids.includes(obj.id));
								duplicateObjectsMutation.mutate(objectsToDuplicate);
							}}
							onBulkDelete={(ids) => deleteObjectsMutation.mutate(ids)}
							onCreateObject={(data) =>
								addObjectMutation.mutate({
									type: data.object_type,
									overrides: {
										x: data.x,
										y: data.y,
										width: data.width,
										height: data.height,
									},
								})
							}
						/>
					</div>

					{/* Inspector Panel (Right) */}
					<div
						className={cn(
							"flex flex-col overflow-hidden border-l bg-background transition-all duration-300 ease-in-out",
							isRightSidebarOpen
								? "w-64 opacity-100"
								: "w-0 border-l-0 opacity-0",
						)}
					>
						<div className="flex h-full min-w-[16rem] flex-col">
							<div className="flex items-center justify-between border-b p-4 font-medium">
								Properties
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => setIsRightSidebarOpen(false)}
								>
									<PanelRightClose className="h-3 w-3" />
								</Button>
							</div>
							<div className="flex-1 overflow-y-auto">
								<Inspector
									plan={plan}
									selectedObjects={selectedObjects}
									object={selectedObject}
									onUpdate={updateObject}
									onUpdatePlan={updatePlanSettings}
									onDelete={(id) => deleteObjectsMutation.mutate([id])}
									onBulkDelete={() => deleteObjectsMutation.mutate(selectedObjectIds)}
									onBulkDuplicate={() => duplicateObjectsMutation.mutate(selectedObjects)}
									onDeleteAssignment={(ids) =>
										deleteAssignmentMutation.mutate({
											ticket_id: ids.ticketId,
											visitor_id: ids.visitorId,
										})
									}
									onUpdateAssignmentStatus={(data) => {
										if (data.ticketId)
											updateAssignment(
												data.ticketId,
												{ arrived_at: data.arrivedAt },
												undefined,
												plan.id.toString(),
											).then(() =>
												queryClient.invalidateQueries({
													queryKey: ["plan", plan.id.toString()],
												}),
											);
										else if (data.visitorId)
											updateAssignment(
												data.visitorId,
												{ arrived_at: data.arrivedAt },
												data.visitorId,
												plan.id.toString(),
											).then(() =>
												queryClient.invalidateQueries({
													queryKey: ["plan", plan.id.toString()],
												}),
											);
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<DragOverlay>
				{activeDragItem ? (
					<DraggableGuest item={activeDragItem} isOverlay />
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
