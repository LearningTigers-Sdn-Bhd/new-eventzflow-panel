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
	Inbox,
	Search,
	ShieldCheck,
	Trash2,
	User,
	UserMinus,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
	custom_fields_data?: Record<string, string> | null;
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

	const mergedList: GuestItem[] = useMemo(() => {
		const list: GuestItem[] = [
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
					<TabsList className="grid w-full grid-cols-2 rounded-none border bg-transparent p-0 dark:border-slate-800">
						<TabsTrigger
							value="guests"
							className="rounded-none font-medium text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
						>
							Guests
						</TabsTrigger>
						<TabsTrigger
							value="groups"
							className="rounded-none font-medium text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
						>
							Groups
						</TabsTrigger>
					</TabsList>

					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<Input
							placeholder={
								activeTab === "guests" ? "Search guests..." : "Search groups..."
							}
							className="h-10 rounded-none border-slate-200 bg-slate-50 pl-9 font-medium text-sm transition-all hover:border-slate-300 focus:border-primary dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<TabsContent value="guests" className="m-0 flex-1 overflow-hidden">
					<div className="custom-scrollbar h-full space-y-3 overflow-y-auto p-4">
						{isLoading ? (
							Array.from({ length: 8 }).map((_, i) => (
								<Skeleton
									key={i}
									className="h-20 w-full rounded-none dark:bg-slate-800"
								/>
							))
						) : filteredList.length === 0 ? (
							<div className="space-y-2 px-4 py-12 text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-primary/20 bg-primary/5">
									<User className="h-6 w-6 text-primary" />
								</div>
								<p className="font-medium text-slate-400 text-sm dark:text-slate-500">
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
												? { ticketId: Number(item.id) }
												: { visitorId: Number(item.id) },
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
								<p className="font-semibold text-[10px] text-slate-500 uppercase dark:text-slate-400">
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
										className="h-7 gap-1 rounded-none px-3 text-xs"
									>
										<Plus className="h-3 w-3" />
										New Group
									</Button>
								</GroupModal>
							</div>

							{seatingGroups.length === 0 ? (
								<div className="rounded-none border border-slate-200 border-dashed p-12 text-center dark:border-slate-800">
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
												<div className="ml-4 space-y-1 border-slate-200 border-l-2 pb-2 pl-4 dark:border-slate-800">
													{group.members.length === 0 ? (
														<p className="py-2 text-[10px] text-slate-400 italic dark:text-slate-500">
															No members in this group.
														</p>
													) : (
														group.members.map((member) => {
															const guest = mergedList.find(
																(g) =>
																	String(g.id) ===
																		String(member.participant_id) &&
																	g.type ===
																		member.participant_type.toLowerCase(),
															);
															return (
																<div
																	key={member.id}
																	className="flex items-center gap-2 rounded-none bg-white p-2 text-xs shadow-sm dark:bg-slate-900"
																>
																	<div className="h-1.5 w-1.5 rounded-full bg-primary/40 dark:bg-primary/60" />
																	<span className="truncate font-bold text-slate-700 dark:text-slate-300">
																		{guest?.name ||
																			guest?.full_name ||
																			member.participant_name ||
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

	useEffect(() => {
		if (open) {
			setName(group?.name || "");
			setNotes(group?.notes || "");
			setScope(group?.scope || "plan_only");
			setSearch("");
		}
	}, [open, group]);

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
			<DialogContent
				className={cn(
					"flex max-h-[90vh] flex-col overflow-hidden rounded-none p-0 md:max-w-2xl dark:bg-slate-900",
					!isNew && "h-[85vh]",
				)}
			>
				<DialogHeader className="shrink-0 p-6 pb-0">
					<DialogTitle className="font-semibold text-2xl dark:text-slate-100">
						{isNew ? "Create Seating Group" : `Manage ${group.name}`}
					</DialogTitle>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-6">
					<div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label className="font-semibold text-[10px] text-slate-400 uppercase dark:text-slate-500">
								Group Name
							</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Family A, VIP Tables..."
								className="h-11 rounded-none border-slate-200 font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-semibold text-[10px] text-slate-400 uppercase dark:text-slate-500">
								Scope
							</Label>
							<div className="flex h-11 items-center gap-1 rounded-none bg-slate-100 p-1 dark:bg-slate-800">
								<button
									className={cn(
										"flex-1 rounded-none py-1 font-bold text-xs transition-all",
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
										"flex-1 rounded-none py-1 font-bold text-xs transition-all",
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
							<Label className="font-semibold text-[10px] text-slate-400 uppercase dark:text-slate-500">
								Notes
							</Label>
							<Input
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Optional notes for this group..."
								className="h-11 rounded-none border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
							/>
						</div>
					</div>

					<Button onClick={handleSave} className="h-11 shrink-0 rounded-none">
						{isNew ? "Create Group" : "Save Details"}
					</Button>

					{!isNew && (
						<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden border-t pt-4 dark:border-slate-800">
							<div className="flex shrink-0 items-center justify-between">
								<h4 className="font-semibold text-[10px] text-slate-400 uppercase dark:text-slate-500">
									Select Members ({group.members.length})
								</h4>
								<div className="relative w-48">
									<Search className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-slate-400 dark:text-slate-600" />
									<Input
										placeholder="Find guest..."
										className="h-8 rounded-none bg-slate-50 pl-7 text-[10px] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
							</div>

							<ScrollArea className="h-full min-h-0 flex-1 rounded-none border bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50">
								{filteredGuests.length === 0 ? (
									<div className="flex h-32 flex-col items-center justify-center p-4 text-center">
										<p className="font-bold text-slate-400 text-xs dark:text-slate-500">
											{search
												? "No matching guests found."
												: "No guests available to assign."}
										</p>
									</div>
								) : (
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
													type="button"
													className={cn(
														"flex items-center justify-between gap-3 rounded-none border p-3 text-left transition-all",
														isInThisGroup
															? "border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10 dark:ring-primary/40"
															: "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
													)}
													onClick={() => handleToggleMember(guest)}
												>
													<div className="min-w-0 flex-1">
														<p className="truncate font-semibold text-slate-900 text-xs dark:text-slate-200">
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
								)}
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
				className="h-14 rounded-none border-2 border-slate-200 border-dashed bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
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
				"group relative cursor-grab overflow-hidden rounded-none border bg-white p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary/40",
				isSelected &&
					"border-primary ring-1 ring-primary/20 dark:border-primary dark:ring-primary/40",
				isOverlay && "ring-2 ring-primary",
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary/10 font-semibold text-primary text-xs dark:bg-primary/20">
					{item.members.length}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate font-semibold text-slate-900 text-xs tracking-tight dark:text-slate-200">
						{item.name}
					</p>
					<div className="mt-1 flex items-center gap-2">
						<Badge
							variant="outline"
							className="h-4 rounded-md border-slate-100 px-1 font-bold text-[8px] text-slate-400 uppercase dark:border-slate-800 dark:text-slate-500"
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
				className="h-16 w-full rounded-none border-2 border-slate-200 border-dashed bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
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
						"group relative flex flex-col overflow-hidden rounded-none border bg-white shadow-sm transition-all dark:bg-slate-900",
						assignedTo
							? "border-slate-100 opacity-90 dark:border-slate-800"
							: "hover:border-primary/50 hover:shadow-md dark:border-slate-800 dark:hover:border-primary/40",
						isOverlay
							? "cursor-grabbing ring-2 ring-primary"
							: "cursor-grab active:cursor-grabbing",
						isDragging && !isOverlay && "opacity-0",
						isPinned &&
							"border-primary bg-primary/5 ring-1 ring-primary/20 dark:border-primary dark:bg-primary/10 dark:ring-primary/40",
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
							<p className="truncate font-semibold text-slate-900 text-xs leading-tight dark:text-slate-200">
								{item.name || item.full_name || "Unknown Guest"}
							</p>
							<div className="mt-1 flex flex-wrap items-center gap-2">
								<p className="font-bold text-[9px] text-slate-400 uppercase dark:text-slate-500">
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
								className="z-10 h-8 w-8 shrink-0 rounded-none text-slate-400 transition-colors hover:bg-destructive/5 hover:text-destructive dark:text-slate-600 dark:hover:bg-destructive/10"
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
							<div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-[10px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
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
				className="pointer-events-auto z-50 w-80 overflow-hidden rounded-none border-slate-200 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
	const customFields = Object.entries(item.custom_fields_data || {});

	return (
		<div className="flex flex-col">
			<div className="border-b p-5 dark:border-slate-800">
				<div className="mb-3 flex items-start justify-between">
					<div className="flex h-12 w-12 items-center justify-center rounded-none border border-primary/20 bg-primary/5">
						{item.type === "ticket" ? (
							<User className="h-5 w-5 text-primary" />
						) : (
							<ShieldCheck className="h-5 w-5 text-primary" />
						)}
					</div>
					<Badge variant="outline" className="rounded-none">
						{item.type === "ticket" ? "Ticket" : "Visitor"}
					</Badge>
				</div>
				<h3 className="font-semibold text-base leading-tight tracking-tight">
					{item.name || "Guest Details"}
				</h3>
				{roleLabel && (
					<p className="mt-0.5 text-muted-foreground text-xs">{roleLabel}</p>
				)}
			</div>

			<div className="space-y-5 p-5">
				<div className="space-y-1.5">
					<span className="block font-semibold text-[11px] text-slate-500 uppercase dark:text-slate-400">
						Seating Group
					</span>
					<select
						className="w-full rounded-none border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-700 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
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

				{(item.email || item.phone || item.check_in_at) && (
					<div className="space-y-2 border-t pt-4 dark:border-slate-800">
						<span className="block font-semibold text-[11px] text-slate-500 uppercase dark:text-slate-400">
							Contact
						</span>
						{item.email && (
							<div className="flex items-center gap-2 text-xs">
								<Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								<span className="truncate text-slate-700 dark:text-slate-300">
									{item.email}
								</span>
							</div>
						)}
						{item.phone && (
							<div className="flex items-center gap-2 text-xs">
								<Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								<span className="text-slate-700 dark:text-slate-300">
									{item.phone}
								</span>
							</div>
						)}
						{item.check_in_at && (
							<div className="flex items-center gap-2 text-xs">
								<CalendarCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
								<span className="text-emerald-600 dark:text-emerald-400">
									Checked in {new Date(item.check_in_at).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				)}

				<div className="space-y-2 border-t pt-4 dark:border-slate-800">
					<span className="block font-semibold text-[11px] text-slate-500 uppercase dark:text-slate-400">
						Table Assignment
					</span>
					<div className="flex items-center justify-between gap-3">
						{assignedTo ? (
							<>
								<div className="flex min-w-0 items-center gap-2 text-xs">
									<div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
									<span className="truncate text-slate-700 dark:text-slate-300">
										Seated at{" "}
										<span className="font-medium">
											{assignedTo.label || assignedTo.object_type}
										</span>
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 shrink-0 rounded-none text-[10px] text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10"
									onClick={(e) => {
										e.preventDefault();
										onUnassign?.();
									}}
								>
									Unassign
								</Button>
							</>
						) : (
							<span className="text-muted-foreground text-xs">
								Not assigned to a table yet.
							</span>
						)}
					</div>
				</div>

				<div className="space-y-2 border-t pt-4 dark:border-slate-800">
					<span className="block font-semibold text-[11px] text-slate-500 uppercase dark:text-slate-400">
						Registration Details
					</span>
					{customFields.length > 0 ? (
						<div className="grid grid-cols-2 gap-x-4 gap-y-3">
							{customFields.map(([key, value]) => {
								const isBlank = value == null || String(value).trim() === "";
								return (
									<div key={key} className="min-w-0 space-y-0.5">
										<p className="truncate font-medium text-[10px] text-muted-foreground uppercase">
											{key.replace(/_/g, " ")}
										</p>
										<p
											className={cn(
												"truncate text-xs",
												isBlank
													? "text-muted-foreground italic"
													: "font-medium text-slate-700 dark:text-slate-300",
											)}
										>
											{isBlank ? "No data" : String(value)}
										</p>
									</div>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center gap-1.5 rounded-none border border-dashed bg-slate-50/50 py-6 text-center dark:border-slate-800 dark:bg-slate-950/50">
							<Inbox className="h-4 w-4 text-muted-foreground" />
							<p className="text-muted-foreground text-xs">
								No registration details submitted yet.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
