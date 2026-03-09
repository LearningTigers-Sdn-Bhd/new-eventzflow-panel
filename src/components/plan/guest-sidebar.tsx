"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
	CalendarCheck,
	Check,
	ChevronRight,
	LayoutGrid,
	Mail,
	Phone,
	Plus,
	Search,
	ShieldCheck,
	Tag,
	Trash2,
	User,
	UserCircle,
	UserMinus,
	Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Plan, PlanObject } from "@/lib/api/plan/response";
import type { SeatingGroup } from "@/lib/api/seating-group";
import { getEventTickets } from "@/lib/api/ticket";
import { getVisitors } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";

export type GuestItem = {
	id: number | string;
	type: "ticket" | "visitor";
	name?: string;
	full_name?: string;
	email?: string;
	phone?: string;
	role?: string;
	ticketTypeName?: string;
	check_in_at?: string;
	custom_fields_data?: Record<string, unknown>;
};

interface GuestSidebarProps {
	eventId: string;
	plan: Plan;
	seatingGroups: SeatingGroup[];
	groupMembershipMap: Map<string, { groupId: number; memberId: number }>;
	onCreateGroup: (data: {
		name: string;
		notes?: string | null;
		scope: "plan_only" | "event_level";
	}) => void;
	onUpdateGroup: (groupId: number, data: Partial<SeatingGroup>) => void;
	onDeleteGroup: (groupId: number) => void;
	onSetGuestGroup: (data: {
		participantType: "ticket" | "visitor";
		participantId: number;
		targetGroupId: number | null;
		existingMemberId?: number;
		existingGroupId?: number;
	}) => void;
	onUnassign: (ids: { ticketId?: number; visitorId?: number }) => void;
}

export function GuestSidebar({
	eventId,
	plan,
	seatingGroups,
	groupMembershipMap,
	onCreateGroup,
	onUpdateGroup,
	onDeleteGroup,
	onSetGuestGroup,
	onUnassign,
}: GuestSidebarProps) {
	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState("guests");
	const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

	const { data: tickets, isLoading: isLoadingTickets } = useQuery({
		queryKey: ["tickets", "all", eventId],
		queryFn: () => getEventTickets(eventId),
	});

	const { data: visitors, isLoading: isLoadingVisitors } = useQuery({
		queryKey: ["visitors", "all", eventId],
		queryFn: () => getVisitors(eventId),
	});

	const isLoading = isLoadingTickets || isLoadingVisitors;

	const assignments = useMemo(() => {
		const map = new Map<string, PlanObject>();
		plan.plan_objects?.forEach((obj) => {
			obj.table_assignments?.forEach((asgn) => {
				if (asgn.ticket_id) map.set(`ticket-${asgn.ticket_id}`, obj);
				if (asgn.visitor_id) map.set(`visitor-${asgn.visitor_id}`, obj);
			});
		});
		return map;
	}, [plan]);

	const mergedList = useMemo(() => {
		const list = [
			...(tickets || []).map((t) => ({ ...t, type: "ticket" as const })),
			...(visitors || []).map((v) => ({
				...v,
				name: v.full_name,
				ticketTypeName: v.role || "Visitor",
				type: "visitor" as const,
			})),
		];
		return list;
	}, [tickets, visitors]);

	const filteredList = mergedList
		.filter((item) => {
			const s = search.toLowerCase();
			const key = `${item.type}-${item.id}`;

			// 1. Basic Info (Name, Email, Phone)
			if (item.name?.toLowerCase().includes(s)) return true;
			if (item.email?.toLowerCase().includes(s)) return true;
			if (item.phone?.toLowerCase().includes(s)) return true;

			// 2. Ticket Type / Role
			if (item.ticketTypeName?.toLowerCase().includes(s)) return true;

			// 3. Seating Group Name
			const membership = groupMembershipMap.get(key);
			if (membership) {
				const group = seatingGroups.find((g) => g.id === membership.groupId);
				if (group?.name.toLowerCase().includes(s)) return true;
			}

			// 4. Assigned Table Name/ID
			const assignedTable = assignments.get(key);
			if (assignedTable) {
				if (assignedTable.label?.toLowerCase().includes(s)) return true;
				if (`table ${assignedTable.id}`.toLowerCase().includes(s)) return true;
			}

			// 5. Custom Fields (Company, Dietary, Organization, etc.)
			if (item.custom_fields_data) {
				const hasMatch = Object.values(item.custom_fields_data).some((val) =>
					String(val).toLowerCase().includes(s),
				);
				if (hasMatch) return true;
			}

			return false;
		})
		.sort((a, b) => {
			const aAssigned = assignments.has(`${a.type}-${a.id}`);
			const bAssigned = assignments.has(`${b.type}-${b.id}`);
			if (aAssigned === bAssigned)
				return (a.name || "").localeCompare(b.name || "");
			return aAssigned ? 1 : -1;
		});

	const selectedGroup = useMemo(
		() => seatingGroups.find((g) => g.id === selectedGroupId),
		[seatingGroups, selectedGroupId],
	);

	return (
		<div className="flex h-full flex-col bg-slate-50/50 dark:bg-slate-950/50">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-1 flex-col"
			>
				<div className="sticky top-0 z-10 space-y-4 border-b bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<TabsList className="grid w-full grid-cols-2 dark:bg-slate-800">
						<TabsTrigger value="guests" className="font-bold text-xs">
							Guests
						</TabsTrigger>
						<TabsTrigger value="groups" className="font-bold text-xs">
							Groups
						</TabsTrigger>
					</TabsList>

					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<Input
							placeholder={
								activeTab === "guests" ? "Search guests..." : "Search groups..."
							}
							className="h-10 rounded-lg border-transparent bg-slate-50 pl-9 font-medium text-sm transition-all hover:border-slate-200 focus:border-primary dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<TabsContent value="guests" className="m-0 flex-1 overflow-hidden">
					<div className="custom-scrollbar h-full space-y-3 overflow-y-auto p-4">
						{isLoading ? (
							Array.from({ length: 8 }).map((_, i) => (
								<Skeleton key={i} className="h-20 w-full rounded-xl dark:bg-slate-800" />
							))
						) : filteredList.length === 0 ? (
							<div className="space-y-2 px-4 py-12 text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
									<User className="h-6 w-6 text-slate-300 dark:text-slate-600" />
								</div>
								<p className="font-bold text-slate-400 text-sm dark:text-slate-500">
									No guests found.
								</p>
							</div>
						) : (
							filteredList.map((item) => (
								<DraggableGuest
									key={`${item.type}-${item.id}`}
									item={item}
									assignedTo={assignments.get(`${item.type}-${item.id}`)}
									seatingGroups={seatingGroups}
									membership={groupMembershipMap.get(`${item.type}-${item.id}`)}
									onSetGroup={(targetGroupId) => {
										const existing = groupMembershipMap.get(
											`${item.type}-${item.id}`,
										);
										onSetGuestGroup({
											participantType: item.type,
											participantId: Number(item.id),
											targetGroupId,
											existingGroupId: existing?.groupId,
											existingMemberId: existing?.memberId,
										});
									}}
									onUnassign={() =>
										onUnassign(
											item.type === "ticket"
												? { ticketId: item.id }
												: { visitorId: item.id },
										)
									}
								/>
							))
						)}
					</div>
				</TabsContent>

				<TabsContent value="groups" className="m-0 flex-1 overflow-hidden">
					<div className="flex h-full flex-col">
						<div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-4">
							<div className="flex items-center justify-between pb-2">
								<p className="font-black text-[10px] text-slate-500 uppercase tracking-widest dark:text-slate-400">
									Seating Groups ({seatingGroups.length})
								</p>
								<GroupModal
									seatingGroups={seatingGroups}
									mergedList={mergedList}
									groupMembershipMap={groupMembershipMap}
									onCreateGroup={onCreateGroup}
									onUpdateGroup={onUpdateGroup}
									onSetGuestGroup={onSetGuestGroup}
								>
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1 rounded-full border-primary/20 bg-primary/5 px-3 font-bold text-[10px] text-primary transition-all hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10"
									>
										<Plus className="h-3 w-3" />
										NEW GROUP
									</Button>
								</GroupModal>
							</div>

							{seatingGroups.length === 0 ? (
								<div className="rounded-xl border border-slate-200 border-dashed p-12 text-center dark:border-slate-800">
									<Users className="mx-auto h-8 w-8 text-slate-200 dark:text-slate-800" />
									<p className="mt-2 font-bold text-slate-400 text-sm dark:text-slate-500">
										No groups created yet.
									</p>
								</div>
							) : (
								seatingGroups
									.filter((g) =>
										g.name.toLowerCase().includes(search.toLowerCase()),
									)
									.map((group) => (
										<div key={group.id} className="space-y-1">
											<DraggableGroup
												item={group}
												isSelected={selectedGroupId === group.id}
												onClick={() =>
													setSelectedGroupId(
														selectedGroupId === group.id ? null : group.id,
													)
												}
												onDelete={() => onDeleteGroup(group.id)}
												onEdit={(e) => {
													e.stopPropagation();
												}}
												triggerEdit={
													<GroupModal
														group={group}
														seatingGroups={seatingGroups}
														mergedList={mergedList}
														groupMembershipMap={groupMembershipMap}
														onCreateGroup={onCreateGroup}
														onUpdateGroup={onUpdateGroup}
														onSetGuestGroup={onSetGuestGroup}
													>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-slate-400 hover:text-primary dark:text-slate-500"
															onClick={(e) => e.stopPropagation()}
														>
															<LayoutGrid className="h-3 w-3" />
														</Button>
													</GroupModal>
												}
											/>
											{selectedGroupId === group.id && (
												<div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4 pb-2 dark:border-slate-800">
													{group.members.length === 0 ? (
														<p className="py-2 text-[10px] text-slate-400 italic dark:text-slate-500">
															No members in this group.
														</p>
													) : (
														group.members.map((member) => {
															const guest = mergedList.find(
																(g) =>
																	g.id === member.participant_id &&
																	g.type ===
																		member.participant_type.toLowerCase(),
															);
															return (
																<div
																	key={member.id}
																	className="flex items-center gap-2 rounded-lg bg-white p-2 text-xs shadow-sm dark:bg-slate-900"
																>
																	<div className="h-1.5 w-1.5 rounded-full bg-primary/40 dark:bg-primary/60" />
																	<span className="truncate font-bold text-slate-700 dark:text-slate-300">
																		{guest?.name ||
																			guest?.full_name ||
																			"Unknown Guest"}
																	</span>
																</div>
															);
														})
													)}
												</div>
											)}
										</div>
									))
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function GroupModal({
	group,
	seatingGroups,
	mergedList,
	groupMembershipMap,
	onCreateGroup,
	onUpdateGroup,
	onSetGuestGroup,
	children,
}: {
	group?: SeatingGroup;
	seatingGroups: SeatingGroup[];
	mergedList: any[];
	groupMembershipMap: Map<string, { groupId: number; memberId: number }>;
	onCreateGroup: (data: any) => void;
	onUpdateGroup: (id: number, data: any) => void;
	onSetGuestGroup: (data: any) => void;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(group?.name || "");
	const [notes, setNotes] = useState(group?.notes || "");
	const [scope, setScope] = useState<"plan_only" | "event_level">(
		group?.scope || "plan_only",
	);
	const [search, setSearch] = useState("");

	const isNew = !group;

	const handleSave = () => {
		if (!name.trim()) return;
		if (isNew) {
			onCreateGroup({ name: name.trim(), notes: notes.trim() || null, scope });
		} else {
			onUpdateGroup(group.id, {
				name: name.trim(),
				notes: notes.trim() || null,
				scope,
			});
		}
		setOpen(false);
	};

	const filteredGuests = useMemo(() => {
		return mergedList.filter((g) => {
			const s = search.toLowerCase();
			const key = `${g.type}-${g.id}`;

			if (g.name?.toLowerCase().includes(s)) return true;
			if (g.email?.toLowerCase().includes(s)) return true;
			if (g.phone?.toLowerCase().includes(s)) return true;
			if (g.ticketTypeName?.toLowerCase().includes(s)) return true;

			const membership = groupMembershipMap.get(key);
			if (membership) {
				const grp = seatingGroups.find((sg) => sg.id === membership.groupId);
				if (grp?.name.toLowerCase().includes(s)) return true;
			}

			if (g.custom_fields_data) {
				return Object.values(g.custom_fields_data).some((val) =>
					String(val).toLowerCase().includes(s),
				);
			}
			return false;
		});
	}, [mergedList, search, groupMembershipMap, seatingGroups]);

	const handleToggleMember = (guest: any) => {
		if (isNew) {
			toast.error("Please create the group first before adding members.");
			return;
		}

		const key = `${guest.type}-${guest.id}`;
		const existing = groupMembershipMap.get(key);

		if (existing?.groupId === group.id) {
			// Remove
			onSetGuestGroup({
				participantType: guest.type,
				participantId: Number(guest.id),
				targetGroupId: null,
				existingGroupId: existing.groupId,
				existingMemberId: existing.memberId,
			});
		} else {
			// Add or Move
			if (existing) {
				const oldGroupName =
					seatingGroups.find((g) => g.id === existing.groupId)?.name || "Other";
				if (
					confirm(
						`Are you sure to move ${
							guest.name || guest.full_name
						} from group "${oldGroupName}" to "${group.name}"?`,
					)
				) {
					onSetGuestGroup({
						participantType: guest.type,
						participantId: Number(guest.id),
						targetGroupId: group.id,
						existingGroupId: existing.groupId,
						existingMemberId: existing.memberId,
					});
				}
			} else {
				onSetGuestGroup({
					participantType: guest.type,
					participantId: Number(guest.id),
					targetGroupId: group.id,
				});
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="flex max-h-[90vh] flex-col rounded-3xl p-0 dark:bg-slate-900 md:max-w-2xl">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="font-black text-2xl tracking-tighter dark:text-slate-100">
						{isNew ? "Create Seating Group" : `Manage ${group.name}`}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-1 flex-col gap-6 overflow-hidden p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
								Group Name
							</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Family A, VIP Tables..."
								className="h-11 rounded-xl border-slate-200 font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
								Scope
							</Label>
							<div className="flex h-11 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
								<button
									className={cn(
										"flex-1 rounded-lg py-1 font-bold text-xs transition-all",
										scope === "plan_only"
											? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-primary"
											: "text-slate-500 dark:text-slate-400",
									)}
									onClick={() => setScope("plan_only")}
								>
									PLAN
								</button>
								<button
									className={cn(
										"flex-1 rounded-lg py-1 font-bold text-xs transition-all",
										scope === "event_level"
											? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-primary"
											: "text-slate-500 dark:text-slate-400",
									)}
									onClick={() => setScope("event_level")}
								>
									EVENT
								</button>
							</div>
						</div>
						<div className="md:col-span-2">
							<Label className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
								Notes
							</Label>
							<Input
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Optional notes for this group..."
								className="h-11 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
							/>
						</div>
					</div>

					<Button
						onClick={handleSave}
						className="h-11 rounded-xl bg-primary font-black uppercase tracking-widest text-white hover:bg-primary/90 dark:text-slate-950"
					>
						{isNew ? "CREATE GROUP" : "SAVE DETAILS"}
					</Button>

					{!isNew && (
						<div className="flex flex-1 flex-col gap-3 overflow-hidden border-t pt-4 dark:border-slate-800">
							<div className="flex items-center justify-between">
								<h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
									Select Members ({group.members.length})
								</h4>
								<div className="relative w-48">
									<Search className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-slate-400 dark:text-slate-600" />
									<Input
										placeholder="Find guest..."
										className="h-8 rounded-lg bg-slate-50 pl-7 text-[10px] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
							</div>

							<ScrollArea className="flex-1 rounded-2xl border bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50">
								<div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
									{filteredGuests.map((guest) => {
										const key = `${guest.type}-${guest.id}`;
										const existing = groupMembershipMap.get(key);
										const isInThisGroup = existing?.groupId === group.id;
										const otherGroup =
											!isInThisGroup && existing
												? seatingGroups.find((g) => g.id === existing.groupId)
												: null;

										return (
											<button
												key={key}
												className={cn(
													"flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all",
													isInThisGroup
														? "border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10 dark:ring-primary/40"
														: "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
												)}
												onClick={() => handleToggleMember(guest)}
											>
												<div className="min-w-0 flex-1">
													<p className="truncate font-black text-slate-900 text-xs dark:text-slate-200">
														{guest.name || guest.full_name}
													</p>
													{otherGroup ? (
														<p className="font-bold text-[9px] text-orange-600 uppercase dark:text-orange-400">
															Already in {otherGroup.name}
														</p>
													) : (
														<p className="font-bold text-[9px] text-slate-400 uppercase dark:text-slate-500">
															{guest.type}
														</p>
													)}
												</div>
												<div
													className={cn(
														"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
														isInThisGroup
															? "border-primary bg-primary text-white dark:bg-primary dark:text-slate-950"
															: "border-slate-200 dark:border-slate-700",
													)}
												>
													{isInThisGroup && <Check className="h-3 w-3" />}
												</div>
											</button>
										);
									})}
								</div>
							</ScrollArea>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function DraggableGroup({
	item,
	isSelected,
	onClick,
	onDelete,
	isOverlay,
	triggerEdit,
}: {
	item: SeatingGroup & { __dragType?: string };
	isSelected?: boolean;
	onClick?: () => void;
	onDelete?: () => void;
	onEdit?: (e: React.MouseEvent) => void;
	isOverlay?: boolean;
	triggerEdit?: React.ReactNode;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `seating-group-${item.id}`,
			data: { type: "group", item },
		});

	const style =
		!isOverlay && transform
			? {
					transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				}
			: undefined;

	if (isDragging && !isOverlay) {
		return (
			<div
				ref={setNodeRef}
				className="h-14 rounded-xl border-2 border-slate-200 border-dashed bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
			/>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			onClick={onClick}
			className={cn(
				"group relative cursor-grab overflow-hidden rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary/40",
				isSelected && "border-primary ring-1 ring-primary/20 dark:border-primary dark:ring-primary/40",
				isOverlay && "ring-2 ring-primary",
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-xs dark:bg-primary/20">
					{item.members.length}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate font-black text-slate-900 text-xs tracking-tight dark:text-slate-200">
						{item.name}
					</p>
					<div className="mt-1 flex items-center gap-2">
						<Badge
							variant="outline"
							className="h-4 rounded-md border-slate-100 px-1 font-bold text-[8px] text-slate-400 uppercase tracking-widest dark:border-slate-800 dark:text-slate-500"
						>
							{item.scope === "event_level" ? "Event" : "Plan"}
						</Badge>
						{item.notes && (
							<p className="truncate font-medium text-[10px] text-slate-400 italic dark:text-slate-500">
								{item.notes}
							</p>
						)}
					</div>
				</div>

				{!isOverlay && (
					<div className="flex shrink-0 items-center gap-0.5">
						{triggerEdit}
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-slate-300 transition-colors hover:bg-destructive/5 hover:text-destructive dark:text-slate-600 dark:hover:bg-destructive/10"
							onClick={(e) => {
								e.stopPropagation();
								if (confirm(`Delete group "${item.name}"?`)) {
									onDelete?.();
								}
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
						<ChevronRight
							className={cn(
								"h-4 w-4 text-slate-300 transition-transform duration-300 dark:text-slate-600",
								isSelected && "rotate-90",
							)}
						/>
					</div>
				)}
			</div>

			{/* Drop Zone Visual Indicator */}
			<div className="absolute top-0 right-0 h-1 w-full bg-primary/0 transition-all group-hover:bg-primary/10 dark:group-hover:bg-primary/20" />
		</div>
	);
}

interface DraggableGuestProps {
	item: GuestItem;
	assignedTo?: PlanObject;
	seatingGroups?: SeatingGroup[];
	membership?: { groupId: number; memberId: number };
	onSetGroup?: (groupId: number | null) => void;
	onUnassign?: () => void;
	isOverlay?: boolean;
}

export function DraggableGuest({
	item,
	assignedTo,
	seatingGroups = [],
	membership,
	onSetGroup,
	onUnassign,
	isOverlay,
}: DraggableGuestProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isPinned, setIsPinned] = useState(false);

	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `guest-${item.type}-${item.id}`,
			data: {
				type: "guest",
				participantType: item.type,
				item,
			},
		});

	const style =
		!isOverlay && transform
			? {
					transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				}
			: undefined;

	// Popover should open if hovered OR pinned (clicked)
	const isPopoverOpen = (isHovered || isPinned) && !isDragging;

	if (isDragging && !isOverlay) {
		return (
			<div
				ref={setNodeRef}
				className="h-16 w-full rounded-xl border-2 border-slate-200 border-dashed bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
			/>
		);
	}

	const roleLabel =
		item.type === "ticket" ? item.ticketTypeName : item.role || "Visitor";

	const groupName = membership
		? seatingGroups.find((g) => g.id === membership.groupId)?.name
		: null;

	return (
		<Popover
			open={isPopoverOpen}
			onOpenChange={(open) => {
				if (!open) {
					// If we are hovering, don't close it because we might be pinning it
					if (isHovered) return;
					setIsPinned(false);
				}
			}}
		>
			<PopoverTrigger asChild>
				<div
					ref={setNodeRef}
					style={style}
					{...listeners}
					{...attributes}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={(e) => {
						// Toggle pinned state. Stop propagation to prevent accidental drag triggers
						e.stopPropagation();
						setIsPinned(!isPinned);
					}}
					className={cn(
						"group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all dark:bg-slate-900",
						assignedTo
							? "border-slate-100 opacity-90 dark:border-slate-800"
							: "hover:border-primary/50 hover:shadow-md dark:border-slate-800 dark:hover:border-primary/40",
						isOverlay
							? "cursor-grabbing ring-2 ring-primary"
							: "cursor-grab active:cursor-grabbing",
						isDragging && !isOverlay && "opacity-0",
						isPinned && "border-primary bg-primary/5 ring-1 ring-primary/20 dark:border-primary dark:bg-primary/10 dark:ring-primary/40",
					)}
				>
					<div className="flex items-center gap-3 p-3">
						<div
							className={cn(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-inner",
								item.type === "ticket"
									? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
									: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
							)}
						>
							{item.type === "ticket" ? (
								<User className="h-5 w-5" />
							) : (
								<ShieldCheck className="h-5 w-5" />
							)}
						</div>

						<div className="min-w-0 flex-1">
							<p className="truncate font-black text-slate-900 text-xs leading-tight dark:text-slate-200">
								{item.name || item.full_name || "Unknown Guest"}
							</p>
							<div className="mt-1 flex flex-wrap items-center gap-2">
								<p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
									{roleLabel}
								</p>
								{groupName && (
									<div className="flex items-center gap-1 rounded bg-orange-50 px-1 py-0.5 font-bold text-[8px] text-orange-600 uppercase dark:bg-orange-950/50 dark:text-orange-400">
										<Users className="h-2 w-2" />
										{groupName}
									</div>
								)}
							</div>
						</div>

						{!isOverlay && assignedTo && (
							<Button
								variant="ghost"
								size="icon"
								className="z-10 h-8 w-8 shrink-0 rounded-lg text-slate-400 transition-colors hover:bg-destructive/5 hover:text-destructive dark:text-slate-600 dark:hover:bg-destructive/10"
								onClick={(e) => {
									e.stopPropagation();
									onUnassign?.();
								}}
							>
								<UserMinus className="h-4 w-4" />
							</Button>
						)}
					</div>

					{assignedTo && (
						<div className="flex items-center gap-2 px-3 pb-3">
							<div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-black text-[10px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
								<div className="h-1 w-1 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
								<span>{assignedTo.label || assignedTo.object_type}</span>
							</div>
						</div>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				align="start"
				sideOffset={10}
				className="pointer-events-auto z-50 w-80 overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<GuestDetailsPanel
					item={item}
					assignedTo={assignedTo}
					seatingGroups={seatingGroups}
					currentGroupId={membership?.groupId || null}
					onSetGroup={onSetGroup}
					onUnassign={onUnassign}
				/>
			</PopoverContent>
		</Popover>
	);
}

function GuestDetailsPanel({
	item,
	assignedTo,
	seatingGroups,
	currentGroupId,
	onSetGroup,
	onUnassign,
}: {
	item: GuestItem;
	assignedTo?: PlanObject;
	seatingGroups: SeatingGroup[];
	currentGroupId: number | null;
	onSetGroup?: (groupId: number | null) => void;
	onUnassign?: () => void;
}) {
	const roleLabel =
		item.type === "ticket" ? item.ticketTypeName : item.role || "Visitor";

	return (
		<div className="flex flex-col">
			<div
				className={cn(
					"p-6 text-white dark:text-slate-100",
					item.type === "ticket"
						? "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900"
						: "bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-800",
				)}
			>
				<div className="mb-4 flex items-start justify-between">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
						{item.type === "ticket" ? (
							<User className="h-8 w-8" />
						) : (
							<ShieldCheck className="h-8 w-8" />
						)}
					</div>
					<Badge
						variant="outline"
						className="border-white/40 font-black text-white tracking-tighter dark:border-white/20 dark:text-white"
					>
						{item.type.toUpperCase()}
					</Badge>
				</div>
				{/* ROLE REMOVED from below the name in this details panel as requested */}
				<h3 className="mb-1 font-black text-xl leading-tight tracking-tight">
					{item.name || "Guest Details"}
				</h3>
			</div>

			<div className="space-y-6 bg-white p-6 dark:bg-slate-900">
				<div className="space-y-4">
					<DetailItem icon={Mail} label="Email" value={item.email} />
					<DetailItem icon={Phone} label="Phone" value={item.phone} />
					<DetailItem icon={Tag} label="Ticket/Role" value={roleLabel} />
					{item.check_in_at && (
						<DetailItem
							icon={CalendarCheck}
							label="Checked In"
							value={new Date(item.check_in_at).toLocaleString()}
							color="text-emerald-600 dark:text-emerald-400"
						/>
					)}
				</div>

				<Separator className="dark:bg-slate-800" />

				<div className="space-y-2">
					<h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
						Seating Group
					</h4>
					<select
						className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
						value={currentGroupId ?? ""}
						onChange={(e) => {
							const value = e.target.value;
							onSetGroup?.(value ? Number(value) : null);
						}}
					>
						<option value="">No group</option>
						{seatingGroups.map((group) => (
							<option key={group.id} value={group.id}>
								{group.name} ({group.scope === "event_level" ? "Event" : "Plan"}
								)
							</option>
						))}
					</select>
				</div>

				<Separator className="dark:bg-slate-800" />

				<div className="space-y-3">
					<h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
						Current Assignment
					</h4>
					{assignedTo ? (
						<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 font-black text-emerald-600 text-xs dark:bg-emerald-950/50 dark:text-emerald-400">
									{assignedTo.label?.charAt(0) || "T"}
								</div>
								<div>
									<p className="font-black text-slate-900 text-xs dark:text-slate-200">
										{assignedTo.label || assignedTo.object_type}
									</p>
									<p className="font-bold text-[10px] text-slate-400 uppercase dark:text-slate-500">
										ID: {assignedTo.id}
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 font-bold text-[10px] text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10"
								onClick={(e) => {
									e.preventDefault();
									onUnassign?.();
								}}
							>
								UNASSIGN
							</Button>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/50">
							<UserCircle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
							<p className="font-bold text-[10px] text-slate-400 leading-tight dark:text-slate-500">
								Currently Unassigned.
								<br />
								Drag this guest to a table.
							</p>
						</div>
					)}
				</div>

				{/* Custom Fields Placeholder - Input all details first */}
				{item.custom_fields_data &&
					Object.keys(item.custom_fields_data).length > 0 && (
						<>
							<Separator className="dark:bg-slate-800" />
							<div className="space-y-3">
								<h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500">
									Registration Details
								</h4>
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(item.custom_fields_data).map(
										([key, value]: [string, unknown]) => (
											<div key={key} className="flex flex-col gap-0.5">
												<span className="font-bold text-[10px] text-slate-400 capitalize dark:text-slate-500">
													{key.replace(/_/g, " ")}
												</span>
												<span className="font-bold text-slate-700 text-xs dark:text-slate-300">
													{String(value)}
												</span>
											</div>
										),
									)}
								</div>
							</div>
						</>
					)}
			</div>
		</div>
	);
}

function DetailItem({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: ComponentType<{ className?: string }>;
	label: string;
	value?: string | number | null;
	color?: string;
}) {
	if (!value) return null;
	return (
		<div className="group flex items-start gap-3">
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:text-primary dark:bg-slate-800 dark:text-slate-500 dark:group-hover:text-primary">
				<Icon className="h-4 w-4" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="mb-1 font-bold text-[10px] text-slate-400 uppercase leading-none tracking-tighter dark:text-slate-500">
					{label}
				</p>
				<p
					className={cn(
						"truncate font-black text-xs",
						color || "text-slate-700 dark:text-slate-300",
					)}
				>
					{value}
				</p>
			</div>
		</div>
	);
}
