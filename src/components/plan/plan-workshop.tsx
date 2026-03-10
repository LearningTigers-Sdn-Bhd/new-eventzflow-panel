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
	AlertTriangle,
	ArrowLeft,
	Check,
	ChevronLeft,
	Copy,
	Download,
	Eraser,
	FileImage,
	Hash,
	Layers,
	LayoutGrid,
	Loader2,
	Lock,
	Maximize2,
	Minimize2,
	MousePointer2,
	Move,
	PenTool,
	Plus,
	Redo,
	RotateCcw,
	Ruler,
	Search,
	Settings2,
	Shapes,
	Sparkles,
	Square as SquareIcon,
	Trash2,
	Undo,
	Unlock,
	Upload,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AssetSidebar } from "@/components/plan/asset-sidebar";
import {
	DraggableGroup,
	DraggableGuest,
	GuestSidebar,
	type GuestItem,
} from "@/components/plan/guest-sidebar";
import { Inspector } from "@/components/plan/inspector";
import { PlanCanvas } from "@/components/plan/plan-canvas";
import { usePlanEditor } from "@/components/plan/use-plan-editor";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
	updatePlan,
} from "@/lib/api/plan";
import type { PlanObject } from "@/lib/api/plan/response";
import type { SeatingGroup } from "@/lib/api/seating-group";
import {
	addSeatingGroupMember,
	assignSeatingGroupToTable,
	createSeatingGroup,
	deleteSeatingGroup,
	getSeatingGroups,
	removeSeatingGroupMember,
	updateSeatingGroup,
} from "@/lib/api/seating-group";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import { restClient } from "@/utils/rest-api";
import { DelayedInput } from "./delayed-input";
import { pxToUnit, type Unit, unitToPx } from "./unit-conversion";

export function PlanWorkshop({
	initialPlan,
	eventId,
}: {
	initialPlan: Record<string, unknown>;
	eventId: string;
}) {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<
		"elements" | "guests" | "layers" | "settings" | "inspector" | null
	>("elements");
	const [activeTool, setActiveTool] = useState<"select" | "floor" | "eraser">(
		"select",
	);
	const [unit, setUnit] = useState<Unit>("m");
	const [activeDragItem, setActiveDragItem] = useState<Record<
		string,
		unknown
	> | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isCalibrating, setIsCalibrating] = useState(false);

	// Reassignment confirmation state
	const [reassignConfirm, setReassignConfirm] = useState<{
		guestName: string;
		oldTableName: string;
		newTableName: string;
		payload: {
			ticket_id?: number;
			visitor_id?: number;
			plan_object_id: number;
		};
	} | null>(null);

	// Calibration discard confirmation
	const [showDiscardCalib, setShowDiscardCalib] = useState(false);

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
		selectedObjectIds,
		selectedObjects,
		selectedObject,
		setSelectedObjectIds,
		updateObjectPosition,
		updateObject,
		updateObjects,
		addObjects,
		updatePlanSettings,
		savePendingChanges,
		isSaving,
		undo,
		redo,
		canUndo,
		canRedo,
	} = usePlanEditor(initialPlan);

	const { data: seatingGroups = [] } = useQuery({
		queryKey: ["seating-groups", plan.id],
		queryFn: () => getSeatingGroups(plan.id),
		enabled: !!plan?.id,
	});

	const assignmentsMap = useMemo(() => {
		const map = new Map<string, PlanObject>();
		plan.plan_objects?.forEach((obj) => {
			obj.table_assignments?.forEach((a) => {
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

	const groupMembershipMap = useMemo(() => {
		const map = new Map<string, { groupId: number; memberId: number }>();
		seatingGroups.forEach((group) => {
			group.members.forEach((member) => {
				const key = `${member.participant_type.toLowerCase()}-${member.participant_id}`;
				map.set(key, { groupId: group.id, memberId: member.id });
			});
		});
		return map;
	}, [seatingGroups]);

	const isPlanEmpty =
		!plan.background_image_url &&
		(!plan.plan_objects || plan.plan_objects.length === 0);
	const [showStartup, setShowStartup] = useState(isPlanEmpty);

	// --- Mutations ---

	const uploadBackgroundMutation = useMutation({
		mutationFn: (file: File | null) =>
			updatePlan(plan.id.toString(), { background_image: file }),
		onSuccess: (_data, file) => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			if (file) {
				toast.success("Plan uploaded successfully");
				setIsCalibrating(true);
			} else {
				toast.success("Floor plan removed");
				setIsCalibrating(false);
			}
			setShowStartup(false);
		},
		onError: () => toast.error("Failed to upload image"),
	});

	const uploadObjectImageMutation = useMutation({
		mutationFn: ({ id, file }: { id: number; file: File | null }) => {
			const formData = new FormData();
			if (file) formData.append("plan_object[image]", file);
			return restClient.putFormData<PlanObject>(
				`v1/plans/${plan.id}/plan_objects/${id}`,
				formData,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Object design updated");
		},
		onError: () => toast.error("Failed to upload design"),
	});

	const createAssignmentMutation = useMutation({
		mutationFn: (data: {
			ticket_id?: number;
			visitor_id?: number;
			plan_object_id: number;
		}) => createAssignment(plan.id.toString(), data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Guest moved successfully");
		},
		onError: (error: unknown) => {
			const body = (
				error as { response?: { data?: { error?: string; message?: string } } }
			)?.response?.data;
			if (body?.error === "insufficient_space") {
				toast.error(body.message || "Insufficient table space");
				return;
			}
			toast.error("Failed to move guest");
		},
	});

	const deleteAssignmentMutation = useMutation({
		mutationFn: (data: { ticketId?: number; visitorId?: number }) => {
			if (data.ticketId) return deleteAssignment(data.ticketId.toString(), plan.id.toString());
			return deleteAssignment(data.visitorId!.toString(), plan.id.toString(), data.visitorId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Guest unassigned");
		},
	});

	const deleteObjectsMutation = useMutation({
		mutationFn: (ids: number[]) => batchDeletePlanObjects(plan.id.toString(), ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
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
			console.log("[PlanWorkshop] Duplicating objects:", duplicates);
			return batchCreatePlanObjects(plan.id.toString(), duplicates);
		},
		onSuccess: (newObjects) => {
			console.log("[PlanWorkshop] Duplication success:", newObjects);
			
			// Select the newly created objects
			if (newObjects && newObjects.length > 0) {
				addObjects(newObjects); // Inject into local state immediately
				setSelectedObjectIds(newObjects.map(obj => obj.id));
			} else {
				setSelectedObjectIds([]);
			}
			
			// Background refetch to ensure everything is perfect
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Objects duplicated");
		},
		onError: (error: any) => {
			console.error("[PlanWorkshop] Duplication failed:", error.response?.data || error.message);
			toast.error("Duplication failed: " + (error.response?.data?.message || error.message));
		}
	});

	const autoDistributeMutation = useMutation({
		mutationFn: () => autoDistribute(plan.id.toString()),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			if (result.skipped_groups?.length) {
				const first = result.skipped_groups[0];
				toast.warning(
					`Auto-distribution complete with ${result.skipped_groups.length} skipped group(s). First: ${first.name}, clear ${first.needed_to_fit} seat(s).`,
				);
			} else {
				toast.success("Auto-distribution complete");
			}
		},
	});

	const createSeatingGroupMutation = useMutation({
		mutationFn: (data: {
			name: string;
			notes?: string | null;
			scope: "plan_only" | "event_level";
		}) => createSeatingGroup(plan.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["seating-groups", plan.id] });
			toast.success("Group created");
		},
	});

	const updateSeatingGroupMutation = useMutation({
		mutationFn: ({
			groupId,
			data,
		}: {
			groupId: number;
			data: Partial<SeatingGroup>;
		}) =>
			updateSeatingGroup(plan.id, groupId, {
				name: data.name,
				notes: data.notes,
				scope: data.scope,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["seating-groups", plan.id] });
			toast.success("Group updated");
		},
	});

	const deleteSeatingGroupMutation = useMutation({
		mutationFn: (groupId: number) => deleteSeatingGroup(plan.id, groupId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["seating-groups", plan.id] });
			toast.success("Group deleted");
		},
	});

	const setGroupMemberMutation = useMutation({
		mutationFn: (data: {
			participantType: "ticket" | "visitor";
			participantId: number;
			targetGroupId: number | null;
			existingMemberId?: number;
			existingGroupId?: number;
		}) => {
			if (
				!data.targetGroupId &&
				data.existingGroupId &&
				data.existingMemberId
			) {
				return removeSeatingGroupMember(
					plan.id,
					data.existingGroupId,
					data.existingMemberId,
				);
			}

			if (!data.targetGroupId) return Promise.resolve();

			return addSeatingGroupMember(plan.id, data.targetGroupId, {
				participant_type:
					data.participantType === "ticket" ? "Ticket" : "Visitor",
				participant_id: data.participantId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["seating-groups", plan.id] });
		},
	});

	const assignGroupToTableMutation = useMutation({
		mutationFn: ({ groupId, tableId }: { groupId: number; tableId: number }) =>
			assignSeatingGroupToTable(plan.id, groupId, { plan_object_id: tableId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Group seated successfully");
		},
		onError: (error: unknown) => {
			const body = (
				error as { response?: { data?: { error?: string; message?: string } } }
			)?.response?.data;
			if (body?.error === "insufficient_space") {
				toast.error(body.message || "Insufficient space for the group");
				return;
			}
			toast.error("Failed to seat group");
		},
	});

	const updateAssignmentNoteMutation = useMutation({
		mutationFn: (data: {
			ticketId?: number;
			visitorId?: number;
			notes: string;
		}) => {
			if (data.ticketId)
				return updateAssignment(data.ticketId, {
					notes: data.notes,
				}, undefined, plan.id.toString());
			if (data.visitorId)
				return updateAssignment(
					data.visitorId,
					{ notes: data.notes },
					data.visitorId,
					plan.id.toString(),
				);
			return Promise.reject(new Error("Missing assignment target"));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Assignment note updated");
		},
	});

	const updateAssignmentStatusMutation = useMutation({
		mutationFn: (data: {
			ticketId?: number;
			visitorId?: number;
			arrivedAt: string | null;
		}) => {
			if (data.ticketId)
				return updateAssignment(
					data.ticketId,
					{ arrived_at: data.arrivedAt },
					undefined,
					plan.id.toString(),
				);
			if (data.visitorId)
				return updateAssignment(
					data.visitorId,
					{ arrived_at: data.arrivedAt },
					data.visitorId,
					plan.id.toString(),
				);
			return Promise.reject(new Error("Missing assignment target"));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Arrival status updated");
		},
	});

	const addObjectMutation = useMutation({
		mutationFn: async ({
			type,
			overrides,
		}: {
			type: string;
			overrides?: Record<string, unknown>;
		}) => {
			// CRITICAL: Save any moved tables before creating a new one to prevent position reset bug
			await savePendingChanges();

			let width = 90,
				height = 90,
				object_type = type; // 1.8m = 90px (50px/m)
			if (type === "table_round") {
				object_type = "table";
				width = 90;
				height = 90;
			} else if (type === "table_rect") {
				object_type = "table";
				width = 100;
				height = 60;
			} else if (type === "stage") {
				width = 250;
				height = 150;
			} else if (type === "wall") {
				width = 150;
				height = 10;
			}

			return createPlanObject(plan.id.toString(), {
				object_type,
				x: 100,
				y: 100,
				width,
				height,
				label:
					overrides?.label ||
					(type === "floor" ? null : type.replace("_", " ")),
				capacity: object_type === "table" ? 10 : null,
				rotation: 0,
				locked: false,
				z_index: type === "floor" ? -10 : 0,
				...overrides,
			});
		},
		onSuccess: (newObj: any) => {
			queryClient.invalidateQueries({ queryKey: ["plan", plan.id.toString()] });
			toast.success("Object added");
			if (newObj?.id) setSelectedObjectIds([newObj.id]);
		},
	});

	// --- Stable handlers ---

	const handleUpdatePlan = useCallback(
		(updates: any) => {
			updatePlanSettings(updates);
		},
		[updatePlanSettings],
	);

	const handleUploadBackground = useCallback(
		(file: File | null) => {
			uploadBackgroundMutation.mutate(file);
		},
		[uploadBackgroundMutation],
	);

	const handleUploadObjectImage = useCallback(
		(id: number, file: File | null) => {
			uploadObjectImageMutation.mutate({ id, file });
		},
		[uploadObjectImageMutation],
	);

	const handleUpdateObject = useCallback(
		(id: number, updates: Partial<PlanObject>) => {
			updateObject(id, updates);
		},
		[updateObject],
	);

	const handleDeleteObject = useCallback(
		(id: number) => {
			deleteObjectsMutation.mutate([id]);
		},
		[deleteObjectsMutation],
	);

	const handleDeleteObjects = useCallback(
		() => {
			if (selectedObjectIds.length > 0) {
				deleteObjectsMutation.mutate(selectedObjectIds);
			}
		},
		[deleteObjectsMutation, selectedObjectIds],
	);

	const handleDuplicateObjects = useCallback(
		() => {
			if (selectedObjects.length > 0) {
				duplicateObjectsMutation.mutate(selectedObjects);
			}
		},
		[duplicateObjectsMutation, selectedObjects],
	);

	const handleDeleteAssignment = useCallback(
		(ids: { ticketId?: number; visitorId?: number }) => {
			// Find the table this guest is assigned to
			const key = ids.ticketId ? `ticket-${ids.ticketId}` : `visitor-${ids.visitorId}`;
			const table = assignmentsMap.get(key);

			if (table?.locked) {
				toast.error("This table is locked. Unlock it to make changes.", {
					description: `Guest removal from ${table.label || "this table"} is disabled.`,
				});
				return;
			}

			deleteAssignmentMutation.mutate(ids);
		},
		[deleteAssignmentMutation, assignmentsMap],
	);

	const handleResetCalibration = useCallback(() => {
		if (plan.background_image_metadata) {
			updatePlanSettings({
				canvas_width: plan.background_image_metadata.width,
				canvas_height: plan.background_image_metadata.height,
				settings_json: {
					...plan.settings_json,
					bgX: 0,
					bgY: 0,
					ghostX: 0,
					ghostY: 0,
				},
			});
			toast.info("Scale reset to original image size");
		}
	}, [plan.background_image_metadata, plan.settings_json, updatePlanSettings]);

	const handleDiscardCalibration = () => {
		uploadBackgroundMutation.mutate(null);
		setShowDiscardCalib(false);
	};

	const handleExport = async (type: "map" | "ops" | "public") => {
		toast.promise(exportPlanPdf(plan.id.toString(), type), {
			loading: `Generating ${type.toUpperCase()} PDF...`,
			success: (blob) => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `plan-${plan.name}-${type}.pdf`;
				a.click();
				window.URL.revokeObjectURL(url);
				return "PDF Ready";
			},
			error: "Failed to generate PDF",
		});
	};

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA"
			)
				return;

			if ((e.metaKey || e.ctrlKey) && e.key === "z") {
				e.preventDefault();
				if (e.shiftKey) redo();
				else undo();
				return;
			}
			if ((e.metaKey || e.ctrlKey) && e.key === "y") {
				e.preventDefault();
				redo();
				return;
			}

			if (selectedObjectIds.length === 0) return;

			if ((e.metaKey || e.ctrlKey) && e.key === "d") {
				e.preventDefault();
				handleDuplicateObjects();
				return;
			}

			if (e.key === "Backspace" || e.key === "Delete") {
				e.preventDefault();
				handleDeleteObjects();
				return;
			}

			if (selectedObject && !selectedObject.locked) {
				const step = e.shiftKey ? 10 : 1;
				let newX = selectedObject.x;
				let newY = selectedObject.y;

				switch (e.key) {
					case "ArrowLeft":
						newX -= step;
						break;
					case "ArrowRight":
						newX += step;
						break;
					case "ArrowUp":
						newY -= step;
						break;
					case "ArrowDown":
						newY += step;
						break;
					default:
						return;
				}
				e.preventDefault();
				updateObjectPosition(selectedObject.id, newX, newY);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		selectedObjectIds,
		selectedObject,
		selectedObjects,
		undo,
		redo,
		handleDeleteObjects,
		handleDuplicateObjects,
		updateObjectPosition,
	]);

	// Auto-switch to inspector tab when an object is selected
	useEffect(() => {
		if (selectedObjectIds.length > 0) {
			setActiveTab("inspector");
		} else if (activeTab === "inspector") {
			setActiveTab("elements");
		}
	}, [selectedObjectIds, activeTab]);

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		if (
			event.active.data.current?.type === "guest" ||
			event.active.data.current?.type === "group"
		) {
			setActiveDragItem({
				...event.active.data.current.item,
				__dragType: event.active.data.current.type,
			});
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveDragItem(null);
		const { active, over } = event;
		if (
			over &&
			active.data.current?.type === "group" &&
			over.data.current?.type === "table"
		) {
			const groupId = Number(active.data.current.item.id);
			const targetTable = over.data.current.object;
			assignGroupToTableMutation.mutate({ groupId, tableId: targetTable.id });
			return;
		}

		if (
			over &&
			active.data.current?.type === "guest" &&
			over.data.current?.type === "table"
		) {
			const { participantType, item } = active.data.current;
			const targetTable = over.data.current.object;

			// ENFORCE LOCK
			if (targetTable.locked) {
				toast.error("This table is locked. Unlock it to make changes.", {
					description: `Guest assignment to ${targetTable.label || "this table"} is disabled.`,
				});
				return;
			}

			const payload: {
				plan_object_id: number;
				ticket_id?: number;
				visitor_id?: number;
			} = { plan_object_id: targetTable.id };
			if (participantType === "ticket") payload.ticket_id = Number(item.id);
			else payload.visitor_id = Number(item.id);

			// Check if already assigned
			const existingTable = assignmentsMap.get(`${participantType}-${item.id}`);

			if (existingTable && existingTable.id !== targetTable.id) {
				// Trigger confirmation
				setReassignConfirm({
					guestName: item.name || item.attendee_name || item.full_name,
					oldTableName: existingTable.label || `Table ${existingTable.id}`,
					newTableName: targetTable.label || `Table ${targetTable.id}`,
					payload,
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
		{ id: "elements", label: "Elements", icon: Shapes },
		{ id: "guests", label: "Guests", icon: Users, badge: unassignedCount },
		{ id: "layers", label: "Layers", icon: Layers },
		...(selectedObject
			? [{ id: "inspector", label: "Inspect", icon: Search }]
			: []),
		{ id: "settings", label: "Settings", icon: Settings2 },
	];

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<TooltipProvider>
				<div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white font-sans selection:bg-primary/20 dark:bg-slate-950">
					{/* Top Navigation */}
					<header
						className={cn(
							"z-50 flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900",
							isCalibrating && "border-slate-800 bg-slate-900",
						)}
					>
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
								asChild
							>
								<Link href={`/event/${eventId}/plans`} title="Exit Workshop">
									<ArrowLeft className="h-4 w-4" />
								</Link>
							</Button>

							<div
								className={cn(
									"mx-1 h-6 w-px",
									isCalibrating ? "bg-slate-700" : "bg-slate-200 dark:bg-slate-800",
								)}
							/>

							<div className="flex min-w-0 flex-col">
								<div className="flex items-center gap-2">
									<h1
										className={cn(
											"max-w-[200px] truncate font-bold text-sm",
											isCalibrating ? "text-white" : "text-slate-900 dark:text-slate-100",
										)}
									>
										{plan.name}
									</h1>
									<div
										className={cn(
											"flex items-center gap-1.5 rounded-full border px-2 py-0.5",
											isCalibrating
												? "border-slate-700 bg-slate-800"
												: "border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950",
										)}
									>
										{isSaving ||
										uploadBackgroundMutation.isPending ||
										uploadObjectImageMutation.isPending ? (
											<>
												<Loader2 className="h-2.5 w-2.5 animate-spin text-blue-600 dark:text-blue-400" />
												<span
													className={cn(
														"font-bold text-[10px] uppercase tracking-tighter",
														isCalibrating ? "text-slate-400" : "text-blue-700 dark:text-blue-400",
													)}
												>
													Syncing
												</span>
											</>
										) : (
											<>
												<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
												<span
													className={cn(
														"font-bold text-[10px] uppercase tracking-tighter",
														isCalibrating
															? "text-emerald-400"
															: "text-emerald-700 dark:text-emerald-400",
													)}
												>
													Saved
												</span>
											</>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Center UI */}
						{isCalibrating ? (
							<div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4">
								<div className="flex items-center gap-2 text-white">
									<Ruler className="h-4 w-4 text-[#00C4CC]" />
									<span className="text-nowrap font-black text-xs uppercase tracking-widest">
										Calibration Mode
									</span>
								</div>
								<div className="h-4 w-px bg-slate-700" />
								<p className="max-w-[300px] text-center font-medium text-[10px] text-slate-400 leading-tight">
									Drag image to move, handles to scale. Drag the table to align.
								</p>
							</div>
						) : (
							<div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-md dark:text-slate-400 dark:hover:bg-slate-800"
											onClick={undo}
											disabled={!canUndo}
										>
											<Undo className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Undo (Ctrl+Z)</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-md dark:text-slate-400 dark:hover:bg-slate-800"
											onClick={redo}
											disabled={!canRedo}
										>
											<Redo className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Redo (Ctrl+Y)</TooltipContent>
								</Tooltip>
							</div>
						)}

						{/* Right Actions */}
						<div className="flex items-center gap-3">
							{!isCalibrating && (
								<div className="mr-2 flex items-center rounded-full border bg-slate-100 p-1 shadow-inner dark:border-slate-800 dark:bg-slate-950">
									<Button
										variant="ghost"
										size="sm"
										className={cn(
											"h-7 rounded-full px-4 font-black text-[10px] transition-all duration-200",
											unit === "m"
												? "bg-white text-primary shadow-sm dark:bg-slate-800"
												: "text-slate-500 hover:text-slate-700 dark:text-slate-400",
										)}
										onClick={() => setUnit("m")}
									>
										METERS
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className={cn(
											"h-7 rounded-full px-4 font-black text-[10px] transition-all duration-200",
											unit === "ft"
												? "bg-white text-primary shadow-sm dark:bg-slate-800"
												: "text-slate-500 hover:text-slate-700 dark:text-slate-400",
										)}
										onClick={() => setUnit("ft")}
									>
										FEET
									</Button>
								</div>
							)}

							{isCalibrating ? (
								<>
									<Button
										variant="ghost"
										size="sm"
										className="h-9 rounded-full px-4 font-bold text-slate-400 text-xs hover:bg-white/10 hover:text-white"
										onClick={handleResetCalibration}
									>
										<RotateCcw className="mr-2 h-4 w-4" />
										Reset
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-9 rounded-full px-4 font-bold text-red-400 text-xs hover:bg-red-500/20 hover:text-white"
										onClick={() => setShowDiscardCalib(true)}
									>
										<X className="mr-2 h-4 w-4" />
										Cancel
									</Button>
									<Button
										size="sm"
										className="h-9 rounded-full bg-[#00C4CC] px-6 font-black text-white text-xs shadow-[#00C4CC]/20 shadow-lg hover:bg-[#00B4BB]"
										onClick={() => setIsCalibrating(false)}
									>
										<Check className="mr-2 h-4 w-4" />
										Finish
									</Button>
								</>
							) : (
								<>
									<Button
										variant="ghost"
										size="sm"
										className="h-9 gap-2 rounded-md px-3 font-bold text-slate-600 text-xs hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
										onClick={() => {
											toast.promise(autoDistributeMutation.mutateAsync(), {
												loading: "Auto-filling...",
												success: "Done",
												error: "Failed",
											});
										}}
										disabled={autoDistributeMutation.isPending}
									>
										<Sparkles className="h-4 w-4 text-primary" />
										Auto-Fill
									</Button>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="default"
												size="sm"
												className="h-9 rounded-md bg-[#00C4CC] px-4 font-bold text-white hover:bg-[#00B4BB]"
											>
												<Download className="mr-2 h-4 w-4" />
												Export
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56 rounded-xl dark:border-slate-800 dark:bg-slate-900">
											<DropdownMenuLabel className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
												Reporting & Printing
											</DropdownMenuLabel>
											<DropdownMenuSeparator className="dark:bg-slate-800" />
											<DropdownMenuItem
												className="cursor-pointer gap-2 py-3 font-bold text-xs dark:focus:bg-slate-800"
												onClick={() => handleExport("map")}
											>
												<FileImage className="h-4 w-4 text-[#00C4CC]" />
												Floor Plan Layout (Map)
											</DropdownMenuItem>
											<DropdownMenuItem
												className="cursor-pointer gap-2 py-3 font-bold text-xs dark:focus:bg-slate-800"
												onClick={() => handleExport("ops")}
											>
												<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
												Internal Manifest (Ops + Notes)
											</DropdownMenuItem>
											<DropdownMenuItem
												className="cursor-pointer gap-2 py-3 font-bold text-xs dark:focus:bg-slate-800"
												onClick={() => handleExport("public")}
											>
												<LayoutGrid className="h-4 w-4 text-orange-500 dark:text-orange-400" />
												Public Guest List
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>

									<div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-800" />

									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-md text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
										onClick={toggleFullscreen}
									>
										{isFullscreen ? (
											<Minimize2 className="h-4 w-4" />
										) : (
											<Maximize2 className="h-4 w-4" />
										)}
									</Button>
								</>
							)}
						</div>
					</header>

					<div className="relative flex flex-1 overflow-hidden">
						{/* Sidebar Nav */}
						<aside className="z-40 flex w-[72px] shrink-0 flex-col items-center gap-2 bg-[#0e1318] py-4 shadow-xl dark:bg-black">
							{navItems.map((item) => (
								<button
									key={item.id}
									disabled={isCalibrating}
									onClick={() =>
										setActiveTab(
											activeTab === item.id ? null : (item.id as any),
										)
									}
									className={cn(
										"group relative flex w-full flex-col items-center justify-center px-1 py-3 transition-colors duration-200",
										activeTab === item.id
											? "bg-white/10 text-white"
											: "text-[#8b9094] hover:bg-white/5 hover:text-white",
										isCalibrating && "cursor-not-allowed opacity-20",
									)}
								>
									<item.icon
										className={cn(
											"mb-1 h-6 w-6 transition-transform group-active:scale-90",
											activeTab === item.id && "text-[#00C4CC]",
										)}
									/>
									<span className="text-center font-medium text-[10px] leading-none tracking-tight">
										{item.label}
									</span>
									{item.badge !== undefined && item.badge > 0 && (
										<span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-[#0e1318] bg-[#ff4d4d] px-1 font-black text-[9px] text-white dark:border-black">
											{item.badge}
										</span>
									)}
									{activeTab === item.id && (
										<div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#00C4CC]" />
									)}
								</button>
							))}
						</aside>

						{/* Side Panels */}
						{!isCalibrating && (
							<div
								className={cn(
									"z-30 flex h-full flex-col border-r bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
									activeTab
										? "w-[360px] opacity-100"
										: "w-0 overflow-hidden border-r-0 opacity-0",
								)}
							>
								<div className="flex h-full w-[360px] shrink-0 flex-col">
									<div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
										<h2 className="font-black text-lg text-slate-900 capitalize tracking-tight dark:text-slate-100">
											{activeTab}
										</h2>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-md text-slate-400 dark:hover:bg-slate-800"
											onClick={() => setActiveTab(null)}
										>
											<ChevronLeft className="h-5 w-5" />
										</Button>
									</div>

									<div className="custom-scrollbar flex-1 overflow-y-auto">
										{activeTab === "elements" && (
											<AssetSidebar
												onAddObject={(type) =>
													addObjectMutation.mutate({ type })
												}
											/>
										)}
										{activeTab === "guests" && (
											<GuestSidebar
												eventId={eventId}
												plan={plan}
												seatingGroups={seatingGroups}
												groupMembershipMap={groupMembershipMap}
												onCreateGroup={(data) =>
													createSeatingGroupMutation.mutate(data)
												}
												onUpdateGroup={(groupId, data) =>
													updateSeatingGroupMutation.mutate({ groupId, data })
												}
												onDeleteGroup={(groupId) =>
													deleteSeatingGroupMutation.mutate(groupId)
												}
												onSetGuestGroup={(data) =>
													setGroupMemberMutation.mutate(data)
												}
												onUnassign={handleDeleteAssignment}
											/>
										)}
										{activeTab === "inspector" && (selectedObject || selectedObjects.length > 1) && (
											<Inspector
												plan={plan}
												selectedObjects={selectedObjects}
												object={selectedObject}
												onUpdate={handleUpdateObject}
												onDelete={handleDeleteObject}
												onBulkDelete={handleDeleteObjects}
												onBulkDuplicate={handleDuplicateObjects}
												onUpdatePlan={handleUpdatePlan}
												onUploadObjectImage={handleUploadObjectImage}
												onDeleteAssignment={handleDeleteAssignment}
												onUpdateAssignmentNote={(data) =>
													updateAssignmentNoteMutation.mutate(data)
												}
												onUpdateAssignmentStatus={(data) =>
													updateAssignmentStatusMutation.mutate(data)
												}
												onEnterCalibration={() => setIsCalibrating(true)}
												unit={unit}
											/>
										)}
										{activeTab === "settings" && (
											<Inspector
												plan={plan}
												object={null}
												onUpdate={() => {}}
												onDelete={() => {}}
												onUpdatePlan={handleUpdatePlan}
												onUploadBackground={handleUploadBackground}
												onEnterCalibration={() => setIsCalibrating(true)}
												unit={unit}
											/>
										)}
										{activeTab === "layers" && (
											<div className="space-y-2 p-4">
												{plan.plan_objects?.map((obj: PlanObject) => (
													<button
														key={obj.id}
														onClick={() => setSelectedObjectIds([obj.id])}
														className={cn(
															"group flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all",
															selectedObjectIds.includes(obj.id)
																? "border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10 dark:ring-primary/40"
																: "border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50",
														)}
													>
														<div className="flex items-center gap-3">
															<div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
																<Shapes className="h-4 w-4 text-slate-500 dark:text-slate-400" />
															</div>
															<div>
																<p className="font-bold text-slate-700 dark:text-slate-300">
																	{obj.label || obj.object_type}
																</p>
																<p className="text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
																	{obj.object_type}
																</p>
															</div>
														</div>
														{obj.locked && (
															<Lock className="h-3 w-3 text-slate-400 dark:text-slate-600" />
														)}
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Main Area */}
						<main className="relative flex flex-1 flex-col overflow-hidden bg-[#f0f2f5] dark:bg-slate-950">
							{/* Startup Overlay */}
							{showStartup && (
								<div className="fade-in absolute inset-0 z-50 flex animate-in items-center justify-center bg-white/80 p-6 backdrop-blur-md duration-500 dark:bg-slate-900/80">
									<Button
										variant="ghost"
										size="icon"
										className="absolute top-6 right-6 h-10 w-10 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
										onClick={() => setShowStartup(false)}
									>
										<X className="h-6 w-6" />
									</Button>

									<div className="flex w-full max-w-4xl flex-col items-center gap-12">
										<div className="space-y-4 text-center">
											<h2 className="font-black text-4xl text-slate-900 tracking-tighter dark:text-slate-100">
												How would you like to start?
											</h2>
											<p className="font-medium text-slate-500 dark:text-slate-400">
												Choose a workflow to begin designing your seating plan.
											</p>
										</div>

										<div className="grid w-full gap-8 md:grid-cols-2">
											<Card
												className="group relative cursor-pointer overflow-hidden border-2 border-transparent shadow-xl transition-all hover:border-[#00C4CC] hover:shadow-2xl active:scale-[0.98] dark:bg-slate-900 dark:hover:border-[#00C4CC]/50"
												onClick={() => {
													const input = document.createElement("input");
													input.type = "file";
													input.accept = "image/*";
													input.onchange = (e) => {
														const file = (e.target as HTMLInputElement)
															.files?.[0];
														if (file) handleUploadBackground(file);
													};
													input.click();
												}}
											>
												<CardContent className="flex flex-col items-center gap-6 p-10 text-center">
													<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#00C4CC]/10 transition-transform duration-500 group-hover:scale-110 dark:bg-[#00C4CC]/20">
														<FileImage className="h-12 w-12 text-[#00C4CC]" />
													</div>
													<div className="space-y-2">
														<h3 className="font-bold text-slate-900 text-xl dark:text-slate-100">
															Upload Your Plan
														</h3>
														<p className="text-slate-500 text-sm leading-relaxed dark:text-slate-400">
															Already have a blueprint or a design? Upload it
															and place tables directly on top.
														</p>
													</div>
													<div className="flex items-center gap-2 pt-2 font-bold text-[#00C4CC] text-sm uppercase tracking-widest">
														<Upload className="h-4 w-4" />
														<span>Upload Image</span>
													</div>
												</CardContent>
											</Card>

											<Card
												className="group relative cursor-pointer overflow-hidden border-2 border-transparent shadow-xl transition-all hover:border-[#00C4CC] hover:shadow-2xl active:scale-[0.98] dark:bg-slate-900 dark:hover:border-[#00C4CC]/50"
												onClick={() => setShowStartup(false)}
											>
												<CardContent className="flex flex-col items-center gap-6 p-10 text-center">
													<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 transition-transform duration-500 group-hover:scale-110 dark:bg-slate-800">
														<PenTool className="h-12 w-12 text-slate-600 dark:text-slate-400" />
													</div>
													<div className="space-y-2">
														<h3 className="font-bold text-slate-900 text-xl dark:text-slate-100">
															Design from Scratch
														</h3>
														<p className="text-slate-500 text-sm leading-relaxed dark:text-slate-400">
															Start with a blank canvas and use our drawing
															tools to create your own floor layout.
														</p>
													</div>
													<div className="flex items-center gap-2 pt-2 font-bold text-slate-600 text-sm uppercase tracking-widest dark:text-slate-400">
														<span>Start Drawing</span>
														<ArrowLeft className="h-4 w-4 rotate-180" />
													</div>
												</CardContent>
											</Card>
										</div>

										<Button
											variant="ghost"
											className="font-bold text-slate-400 text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300"
											onClick={() => setShowStartup(false)}
										>
											I'll decide later
										</Button>
									</div>
								</div>
							)}

							{/* Toolbar */}
							<div
								className={cn(
									"z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900",
									(selectedObject || selectedObjectIds.length > 1) && !isCalibrating
										? "translate-y-0 opacity-100"
										: "pointer-events-none absolute w-full -translate-y-full opacity-0",
								)}
							>
								{selectedObjectIds.length > 0 && (
									<>
										<div className="mr-2 flex items-center gap-2 border-r pr-4 dark:border-slate-800">
											<Shapes className="h-4 w-4 text-slate-400 dark:text-slate-500" />
											<span className="font-black text-[10px] text-slate-500 uppercase tracking-widest dark:text-slate-400">
												{selectedObjectIds.length > 1 
													? `${selectedObjectIds.length} Objects Selected` 
													: (selectedObject?.label || selectedObject?.object_type)}
											</span>
										</div>

										{selectedObjectIds.length === 1 && selectedObject && (
											<div className="flex items-center gap-1.5 rounded-md border bg-slate-50 px-2 py-1 font-bold text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
												<Hash className="h-3 w-3" />
												<span>{selectedObject.id}</span>
											</div>
										)}

										<div className="flex-1" />

										<div className="flex items-center gap-1">
											{selectedObjectIds.length === 1 && selectedObject && (
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 rounded-md dark:text-slate-400 dark:hover:bg-slate-800"
															onClick={() =>
																handleUpdateObject(selectedObject.id, {
																	locked: !selectedObject.locked,
																})
															}
														>
															{selectedObject.locked ? (
																<Lock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
															) : (
																<Unlock className="h-4 w-4" />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														{selectedObject.locked ? "Unlock" : "Lock"}
													</TooltipContent>
												</Tooltip>
											)}

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-md dark:text-slate-400 dark:hover:bg-slate-800"
														onClick={handleDuplicateObjects}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Duplicate</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-md text-slate-400 hover:bg-destructive/5 hover:text-destructive dark:text-slate-500 dark:hover:bg-destructive/10"
														onClick={handleDeleteObjects}
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
							<div className="relative flex flex-1 items-center justify-center overflow-hidden">
								<div
									className={cn(
										"pointer-events-none absolute inset-0 z-10 border-[16px] border-transparent shadow-inner transition-colors",
										isCalibrating && "bg-black/40",
									)}
								/>

								<PlanCanvas
									plan={plan}
									selectedObjectIds={selectedObjectIds}
									activeTool={activeTool}
									isCalibrating={isCalibrating}
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
									onResizeObject={(id, width, height, x, y) =>
										handleUpdateObject(id, { width, height, x, y })
									}
									onDuplicateObjects={(ids) => {
										const objectsToDuplicate = plan.plan_objects.filter(obj => ids.includes(obj.id));
										duplicateObjectsMutation.mutate(objectsToDuplicate);
									}}
									onBulkDelete={(ids) => deleteObjectsMutation.mutate(ids)}
									onUpdatePlan={(updates) => handleUpdatePlan(updates)}
									onUpdateObject={handleUpdateObject}
									onDeleteObject={handleDeleteObject}
									onCreateObject={(data) =>
										addObjectMutation.mutate({
											type: data.object_type,
											overrides: { ...data },
										})
									}
								/>

								{/* Quick Tools */}
								{!isCalibrating && (
									<div className="slide-in-from-bottom-4 absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 animate-in items-center gap-1 rounded-lg border bg-white p-1 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
										<Button
											variant={activeTool === "select" ? "secondary" : "ghost"}
											size="sm"
											className="h-9 gap-2 px-3 dark:text-slate-300 dark:hover:bg-slate-800"
											onClick={() => setActiveTool("select")}
										>
											<MousePointer2 className="h-4 w-4" />
											<span className="font-bold text-xs">Select</span>
										</Button>
										<Button
											variant={activeTool === "floor" ? "secondary" : "ghost"}
											size="sm"
											className="h-9 gap-2 px-3 dark:text-slate-300 dark:hover:bg-slate-800"
											onClick={() => setActiveTool("floor")}
										>
											<SquareIcon className="h-4 w-4" />
											<span className="font-bold text-xs">Draw</span>
										</Button>
										<Button
											variant={activeTool === "eraser" ? "secondary" : "ghost"}
											size="sm"
											className="h-9 gap-2 px-3 text-slate-500 hover:text-destructive dark:text-slate-400 dark:hover:bg-destructive/10"
											onClick={() => setActiveTool("eraser")}
										>
											<Eraser className="h-4 w-4" />
											<span className="font-bold text-xs">Erase</span>
										</Button>
									</div>
								)}
							</div>
						</main>
					</div>

					{/* Reassignment Confirmation Dialog */}
					<AlertDialog
						open={!!reassignConfirm}
						onOpenChange={(open) => !open && setReassignConfirm(null)}
					>
						<AlertDialogContent className="max-w-md rounded-2xl dark:border-slate-800 dark:bg-slate-900">
							<AlertDialogHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
									<AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
								</div>
								<AlertDialogTitle className="font-black text-xl tracking-tight dark:text-slate-100">
									Move Guest?
								</AlertDialogTitle>
								<AlertDialogDescription className="font-medium text-slate-600 leading-relaxed dark:text-slate-400">
									Are you sure you want to move{" "}
									<span className="font-bold text-slate-900 dark:text-slate-200">
										{reassignConfirm?.guestName}
									</span>{" "}
									from{" "}
									<span className="font-bold text-slate-900 dark:text-slate-200">
										{reassignConfirm?.oldTableName}
									</span>{" "}
									to{" "}
									<span className="font-bold text-slate-900 dark:text-slate-200">
										{reassignConfirm?.newTableName}
									</span>
									?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="mt-6">
								<AlertDialogCancel className="rounded-full border-slate-200 font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									className="rounded-full bg-[#00C4CC] font-bold text-white hover:bg-[#00B4BB] dark:text-slate-950"
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

					{/* Discard Calibration Confirmation */}
					<AlertDialog
						open={showDiscardCalib}
						onOpenChange={setShowDiscardCalib}
					>
						<AlertDialogContent className="max-w-md rounded-2xl dark:border-slate-800 dark:bg-slate-900">
							<AlertDialogHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
									<Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
								</div>
								<AlertDialogTitle className="font-black text-red-600 text-xl tracking-tight dark:text-red-400">
									Cancel Calibration?
								</AlertDialogTitle>
								<AlertDialogDescription className="font-medium text-slate-600 leading-relaxed dark:text-slate-400">
									Cancelling will **completely remove** the floor plan image you
									just uploaded. You will have to upload it again to use it.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="mt-6">
								<AlertDialogCancel className="rounded-full border-slate-200 font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800">
									Go Back
								</AlertDialogCancel>
								<AlertDialogAction
									className="rounded-full bg-red-600 font-bold text-white hover:bg-red-700 dark:bg-red-700 dark:text-slate-100"
									onClick={handleDiscardCalibration}
								>
									Yes, Remove Plan
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>

				<DragOverlay dropAnimation={null}>
					{activeDragItem?.__dragType === "group" ? (
						<div className="z-[100] scale-105 cursor-grabbing transition-transform">
							<DraggableGroup
								item={activeDragItem as SeatingGroup & { __dragType?: string }}
								isOverlay
							/>
						</div>
					) : activeDragItem ? (
						<div className="z-[100] scale-105 cursor-grabbing transition-transform">
							<DraggableGuest item={activeDragItem as GuestItem} isOverlay />
						</div>
					) : null}
				</DragOverlay>
			</TooltipProvider>
		</DndContext>
	);
}
