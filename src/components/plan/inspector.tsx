"use client";

import {
	ImageIcon,
	Info,
	Lock,
	Ruler,
	Scaling,
	Settings2,
	Trash2,
	UserMinus,
	Users,
} from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Plan, PlanObject } from "@/lib/api/plan/response";
import { DelayedInput } from "./delayed-input";
import { pxToUnit, type Unit, unitToPx } from "./unit-conversion";
import { cn } from "@/lib/utils";

interface InspectorProps {
	plan: Plan;
	object: PlanObject | null;
	onUpdate: (id: number, updates: Partial<PlanObject>) => void;
	onDelete: (id: number) => void;
	onDeleteAssignment?: (ids: { ticketId?: number; visitorId?: number }) => void;
	onUpdateAssignmentNote?: (data: {
		ticketId?: number;
		visitorId?: number;
		notes: string;
	}) => void;
	onUpdateAssignmentStatus?: (data: {
		ticketId?: number;
		visitorId?: number;
		arrivedAt: string | null;
	}) => void;
	onUpdatePlan: (updates: Record<string, unknown>) => void;
	onUploadBackground?: (file: File | null) => void;
	onUploadObjectImage?: (id: number, file: File | null) => void;
	onEnterCalibration?: () => void;
	unit: Unit;
}

export function Inspector({
	plan,
	object,
	onUpdate,
	onDelete,
	onDeleteAssignment,
	onUpdateAssignmentNote,
	onUpdateAssignmentStatus,
	onUpdatePlan,
	onUploadBackground,
	onUploadObjectImage,
	onEnterCalibration,
	unit,
}: InspectorProps) {
	if (!object) {
		return (
			<div className="fade-in slide-in-from-right-4 animate-in space-y-8 p-6 duration-300">
				<div className="space-y-1">
					<h3 className="flex items-center gap-2 font-black text-slate-400 text-sm uppercase tracking-widest dark:text-slate-500">
						<Settings2 className="h-3 w-3" />
						Plan Settings
					</h3>
					<p className="text-xs text-slate-400 dark:text-slate-500">
						Configure your venue dimensions and units.
					</p>
				</div>

				<div className="space-y-2">
					<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">Plan Name</Label>
					<DelayedInput
						value={plan.name}
						onSubmit={(val) => onUpdatePlan({ name: val })}
						className="h-9 border-transparent bg-slate-50 font-medium transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
					/>
				</div>

				<div className="space-y-3">
					<Label className="flex items-center gap-2 font-bold text-slate-600 text-xs dark:text-slate-400">
						<ImageIcon className="h-3 w-3" />
						Venue Floor Plan (Background)
					</Label>
					<ImageUpload
						value={plan.background_image_url || undefined}
						onChange={(file) => {
							if (file instanceof File || file === null) {
								onUploadBackground?.(file);
							}
						}}
						className="bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
					/>
					{plan.background_image_url && (
						<Button
							variant="outline"
							size="sm"
							className="h-9 w-full gap-2 rounded-none border-primary/30 border-dashed font-bold text-primary text-xs transition-all hover:bg-primary/5 dark:border-primary/20 dark:hover:bg-primary/10"
							onClick={onEnterCalibration}
						>
							<Scaling className="h-4 w-4" />
							Re-calibrate Plan Scale
						</Button>
					)}
					<p className="text-xs text-slate-400 italic dark:text-slate-500">
						Upload a PNG/JPG of your overall venue. It will be displayed behind
						everything.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
							Venue Width ({unit})
						</Label>
						<DelayedInput
							type="number"
							value={pxToUnit(plan.canvas_width, unit).toFixed(2)}
							onSubmit={(val) =>
								onUpdatePlan({ canvas_width: unitToPx(Number(val), unit) })
							}
							className="h-9 border-transparent bg-slate-50 px-2 font-mono text-xs transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
						/>
					</div>
					<div className="space-y-2">
						<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
							Venue Height ({unit})
						</Label>
						<DelayedInput
							type="number"
							value={pxToUnit(plan.canvas_height, unit).toFixed(2)}
							onSubmit={(val) =>
								onUpdatePlan({ canvas_height: unitToPx(Number(val), unit) })
							}
							className="h-9 border-transparent bg-slate-50 px-2 font-mono text-xs transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
						/>
					</div>
				</div>

				<div className="flex gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
					<div className="space-y-1">
						<p className="font-bold text-[11px] text-primary uppercase tracking-tight">
							Pro Tip
						</p>
						<p className="text-xs text-slate-600 leading-relaxed dark:text-slate-400">
							Set your venue size to match the real-world dimensions. This
							ensures tables and paths are scaled correctly for the final print.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const isDesignerType = ["floor", "stage"].includes(object.object_type);

	const handlePropertyChange = (updateFn: () => void) => {
		if (object?.locked) {
			toast.error("Object is locked", {
				description: "Unlock this element to modify its properties.",
			});
			return;
		}
		updateFn();
	};

	return (
		<div className="fade-in slide-in-from-right-4 animate-in space-y-8 p-6 duration-300">
			<div className="space-y-1">
				<h3 className="flex items-center gap-2 font-black text-slate-400 text-sm uppercase tracking-widest dark:text-slate-500">
					<Ruler className="h-3 w-3" />
					Object Properties
				</h3>
				<div className="flex items-center justify-between">
					<p className="text-xs text-slate-400 dark:text-slate-500">
						Modify the selected {object.object_type}.
					</p>
					{object.locked && (
						<Badge variant="outline" className="h-5 gap-1 border-orange-200 bg-orange-50 font-bold text-orange-600 text-[9px] dark:border-orange-900/30 dark:bg-orange-950/20">
							<Lock className="h-2.5 w-2.5" />
							LOCKED
						</Badge>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">Label</Label>
				<DelayedInput
					value={object.label || ""}
					onSubmit={(val) => handlePropertyChange(() => onUpdate(object.id, { label: val }))}
					disabled={object.locked}
					className="h-9 border-transparent bg-slate-50 font-medium transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
				/>
			</div>

			{isDesignerType && (
				<div className="space-y-3">
					<Label className="flex items-center gap-2 font-bold text-slate-600 text-xs dark:text-slate-400">
						<ImageIcon className="h-3 w-3" />
						Custom Design (Image)
					</Label>
					<div onClick={() => object.locked && handlePropertyChange(() => {})}>
						<ImageUpload
							value={object.image_url || undefined}
							disabled={object.locked}
							onChange={(file) => {
								if (file instanceof File || file === null) {
									onUploadObjectImage?.(object.id, file);
								}
							}}
							className="bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
						/>
					</div>
					<p className="text-center text-xs text-slate-400 italic dark:text-slate-500">
						Use this to show a specific floor section or stage design.
					</p>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
						Width ({unit})
					</Label>
					<DelayedInput
						type="number"
						value={pxToUnit(object.width, unit).toFixed(2)}
						onSubmit={(val) =>
							handlePropertyChange(() => onUpdate(object.id, { width: unitToPx(Number(val), unit) }))
						}
						disabled={object.locked}
						className="h-9 border-transparent bg-slate-50 px-2 font-mono text-xs transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
					/>
				</div>
				<div className="space-y-2">
					<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
						Height ({unit})
					</Label>
					<DelayedInput
						type="number"
						value={pxToUnit(object.height, unit).toFixed(2)}
						onSubmit={(val) =>
							handlePropertyChange(() => onUpdate(object.id, { height: unitToPx(Number(val), unit) }))
						}
						disabled={object.locked}
						className="h-9 border-transparent bg-slate-50 px-2 font-mono text-xs transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
					/>
				</div>
			</div>

			{object.object_type === "table" && (
				<div className="space-y-2">
					<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
						Seating Capacity
					</Label>
					<DelayedInput
						type="number"
						value={object.capacity || 0}
						onSubmit={(val) => handlePropertyChange(() => onUpdate(object.id, { capacity: Number(val) }))}
						disabled={object.locked}
						className="h-9 border-transparent bg-slate-50 text-center font-medium transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
					/>
				</div>
			)}

			<div className="space-y-2">
				<Label className="font-bold text-slate-600 text-xs dark:text-slate-400">
					Rotation (degrees)
				</Label>
				<DelayedInput
					type="number"
					value={object.rotation}
					onSubmit={(val) => handlePropertyChange(() => onUpdate(object.id, { rotation: Number(val) }))}
					disabled={object.locked}
					className="h-9 border-transparent bg-slate-50 px-2 font-mono text-xs transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-800"
				/>
			</div>

			<div className="flex items-center justify-between rounded-xl border border-transparent bg-slate-50 p-3 transition-all hover:border-slate-200 dark:bg-slate-900 dark:hover:border-slate-800">
				<Label
					className="cursor-pointer font-bold text-slate-600 text-xs dark:text-slate-400"
					htmlFor="locked"
				>
					Lock Object
				</Label>
				<Switch
					id="locked"
					checked={object.locked}
					onCheckedChange={(checked) =>
						onUpdate(object.id, { locked: checked })
					}
				/>
			</div>

			{object.object_type === "table" && (
				<div className="space-y-4 border-t pt-4 dark:border-slate-800">
					<div className="flex items-center justify-between px-1">
						<h3 className="flex items-center gap-2 font-bold text-[11px] text-slate-400 uppercase tracking-tighter dark:text-slate-500">
							<Users className="h-3 w-3" />
							Assigned Guests
						</h3>
						<span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
							{object.table_assignments?.length || 0} / {object.capacity}
						</span>
					</div>

					<div className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-1">
						{object.table_assignments?.length === 0 ? (
							<div className="rounded-xl border border-slate-200 border-dashed p-8 text-center dark:border-slate-800">
								<p className="font-medium text-xs text-slate-400 italic dark:text-slate-500">
									No guests assigned.
									<br />
									Drag a guest here to seat them.
								</p>
							</div>
						) : (
							object.table_assignments?.map((assignment) => (
								<div
									key={assignment.id}
									className="group flex flex-col gap-2 rounded-xl border border-transparent bg-slate-50 p-3 text-xs transition-all hover:border-slate-200 dark:bg-slate-900 dark:hover:border-slate-800"
								>
									<div className="flex items-center justify-between">
										<div className="flex flex-1 items-center gap-3 truncate">
											<div className={cn(
												"flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[10px]",
												assignment.arrived_at 
													? "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
													: "bg-primary/10 text-primary dark:bg-primary/20"
											)}>
												{assignment.ticket?.attendee_name?.[0] ||
													assignment.visitor?.full_name?.[0] ||
													"?"}
											</div>
											<div className="min-w-0 flex-1">
												<span className={cn(
													"block truncate font-bold text-slate-700 dark:text-slate-300",
													assignment.arrived_at && "text-emerald-600 dark:text-emerald-400"
												)}>
													{assignment.ticket?.attendee_name ||
														assignment.visitor?.full_name ||
														"Guest"}
												</span>
											</div>
										</div>
										
										<div className="flex items-center gap-1">
											<button
												className={cn(
													"px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-tighter transition-all group/btn",
													assignment.arrived_at 
														? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400" 
														: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
												)}
												onClick={() => onUpdateAssignmentStatus?.({
													ticketId: assignment.ticket_id || undefined,
													visitorId: assignment.visitor_id || undefined,
													arrivedAt: assignment.arrived_at ? null : new Date().toISOString()
												})}
												disabled={object.locked}
											>
												{assignment.arrived_at ? (
													<>
														<span className="group-hover/btn:hidden">Arrived</span>
														<span className="hidden group-hover/btn:inline">Remove Arrival</span>
													</>
												) : "Mark Arrival"}
											</button>

											<Button
												variant="ghost"
												size="icon"
												className={cn(
													"h-7 w-7 text-slate-400 transition-opacity hover:bg-destructive/5 hover:text-destructive group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-destructive/10",
													object.locked ? "hidden" : "opacity-0"
												)}
												onClick={() =>
													onDeleteAssignment?.({
														ticketId: assignment.ticket_id,
														visitorId: assignment.visitor_id,
													})
												}
											>
												<UserMinus className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>

									<div className="pl-9">
										<DelayedInput
											value={assignment.notes || ""}
											onSubmit={(val) =>
												handlePropertyChange(() => onUpdateAssignmentNote?.({
													ticketId: assignment.ticket_id || undefined,
													visitorId: assignment.visitor_id || undefined,
													notes: val,
												}))
											}
											disabled={object.locked}
											placeholder="Assignment note"
											className="h-7 text-[10px] dark:bg-slate-950 dark:text-slate-400"
										/>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}

			<div className="border-t pt-4 dark:border-slate-800">
				<Button
					variant="ghost"
					className="h-10 w-full font-bold text-slate-400 text-xs hover:bg-destructive/5 hover:text-destructive dark:text-slate-500 dark:hover:bg-destructive/10"
					onClick={() => handlePropertyChange(() => onDelete(object.id))}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Object
				</Button>
			</div>
		</div>
	);
}
