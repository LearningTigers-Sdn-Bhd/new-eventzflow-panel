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
	Eye,
	LayoutGrid,
	List,
	Plus,
	Shuffle,
	Trash2,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { getEventById, updateEvent } from "@/lib/api/event";
import {
	assignTicketGroups,
	deleteTicketGroup,
	getTicketGroups,
	moveTicketsToGroup,
	previewTicketGroups,
	setupTicketGroups,
	type TicketGroup,
	type TicketGroupMode,
	type TicketGroupPreview,
	updateTicketGroup,
} from "@/lib/api/ticket-group";
import { getEventTicketTypes } from "@/lib/api/ticket-type/endpoints";
import { cn } from "@/lib/utils";
import {
	GroupTicketColumn,
	type MoveTarget,
	MoveToItems,
} from "./group-ticket-column";

const BUTTON = "w-auto rounded-none px-6 py-6 md:py-4";
const FILL_OPTIONS = [
	{ value: "mixed", label: "Mixed evenly across the picked types" },
	{ value: "ordered", label: "In order, first picked type first" },
];
const MODE_OPTIONS = [
	{ value: "new", label: "Assign unassigned only" },
	{ value: "all", label: "Re-sort everyone" },
];
const errorMessage = (e: unknown) =>
	e instanceof Error ? e.message : "Something went wrong";

function GroupTile({
	eventId,
	group,
	typeOptions,
	fillMode,
	onSaved,
}: {
	eventId: string;
	group: TicketGroup;
	typeOptions: Array<{ value: string; label: string }>;
	fillMode: "mixed" | "ordered";
	onSaved: () => void;
}) {
	const nameId = useId();
	const priorityId = useId();
	const { openConfirm } = useConfirmDialog();
	const [name, setName] = useState(group.name);
	const save = useMutation({
		mutationFn: (data: Parameters<typeof updateTicketGroup>[2]) =>
			updateTicketGroup(eventId, group.id, data),
		onSuccess: onSaved,
		onError: (e) => toast.error(errorMessage(e)),
	});
	const remove = useMutation({
		mutationFn: () => deleteTicketGroup(eventId, group.id),
		onSuccess: onSaved,
		onError: (e) => toast.error(errorMessage(e)),
	});
	const confirmRemove = () =>
		openConfirm({
			title: `Delete ${group.name}`,
			message:
				group.ticket_count > 0
					? `${group.ticket_count} ticket(s) in this group will become unassigned. Continue?`
					: "Delete this empty group?",
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => remove.mutate(),
		});

	return (
		<div className="flex flex-col gap-4 border p-3">
			<div className="flex items-baseline justify-between gap-2">
				<span className="font-semibold text-3xl tabular-nums">
					{group.ticket_count}
				</span>
				<span className="flex items-center gap-2 text-muted-foreground text-sm">
					tickets
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8 rounded-none"
						aria-label={`Delete ${group.name}`}
						disabled={remove.isPending}
						onClick={confirmRemove}
					>
						<Trash2 className="size-4" />
					</Button>
				</span>
			</div>
			<InputLabel
				label="Group name"
				htmlFor={nameId}
				value={name}
				onChange={setName}
				onBlur={() => {
					const next = name.trim();
					if (next && next !== group.name) save.mutate({ name: next });
					else setName(group.name);
				}}
			/>
			<div className="flex flex-col gap-2">
				<FieldLabel htmlFor={priorityId}>Priority ticket types</FieldLabel>
				<MultiSelectLegacy
					options={typeOptions}
					selected={group.priority_ticket_type_ids.map(String)}
					onChange={(ids) =>
						save.mutate({ priority_ticket_type_ids: ids.map(Number) })
					}
					placeholder="None (filler)"
					className="w-full rounded-none py-6 md:py-2"
				/>
				<FieldDescription>
					{fillMode === "ordered"
						? "Filled into this group first, in the order picked."
						: "Filled into this group first, mixed evenly across the picked types."}{" "}
					Others fill the space left.
				</FieldDescription>
			</div>
		</div>
	);
}

function TicketGroupsView({ eventId }: { eventId: string }) {
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();
	const countId = useId();
	const modeId = useId();
	const fillId = useId();
	const excludedId = useId();
	const [mode, setMode] = useState<TicketGroupMode>("new");
	const [preview, setPreview] = useState<TicketGroupPreview | null>(null);
	const [addCount, setAddCount] = useState("");
	const [showTickets, setShowTickets] = useState(false);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [dragging, setDragging] = useState<{
		name: string;
		typeName: string;
		count: number;
	} | null>(null);
	// Mouse drags after a few pixels (clicks still work); touch needs a short press so scrolling stays free.
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 8 },
		}),
	);

	const { data, isLoading } = useQuery({
		queryKey: ["ticket-groups", eventId],
		queryFn: () => getTicketGroups(eventId),
	});
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["ticket-types", eventId],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});
	const fillMode = eventData?.ticket_group_fill_mode ?? "mixed";
	const excludedIds = eventData?.ticket_group_excluded_type_ids ?? [];
	const setFillMode = useMutation({
		mutationFn: (value: "mixed" | "ordered") =>
			updateEvent(eventId, { ticket_group_fill_mode: value }),
		onSuccess: () => {
			setPreview(null);
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const setExcluded = useMutation({
		mutationFn: (ids: number[]) =>
			updateEvent(eventId, { ticket_group_excluded_type_ids: ids }),
		onSuccess: () => {
			setPreview(null);
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			queryClient.invalidateQueries({ queryKey: ["ticket-groups", eventId] });
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const autoAssign = useMutation({
		mutationFn: (on: boolean) =>
			updateEvent(eventId, { auto_assign_ticket_groups: on }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
		onError: (e) => toast.error(errorMessage(e)),
	});

	const refresh = () => {
		setPreview(null);
		queryClient.invalidateQueries({ queryKey: ["ticket-groups", eventId] });
		queryClient.invalidateQueries({ queryKey: ["event", eventId, "tickets"] });
	};

	const setup = useMutation({
		mutationFn: (count: number) => setupTicketGroups(eventId, count),
		onSuccess: () => {
			setAddCount("");
			refresh();
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const move = useMutation({
		mutationFn: ({ ids, key }: { ids: string[]; key: string }) =>
			moveTicketsToGroup(eventId, ids, key === "none" ? null : Number(key)),
		onSuccess: (r) => {
			toast.success(`${r.moved} ticket(s) moved`);
			setSelected(new Set());
			refresh();
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const previewMut = useMutation({
		mutationFn: () => previewTicketGroups(eventId, mode),
		onSuccess: setPreview,
		onError: (e) => toast.error(errorMessage(e)),
	});
	const assign = useMutation({
		mutationFn: () => assignTicketGroups(eventId, mode),
		onSuccess: (r) => {
			toast.success(`${r.assigned} ticket(s) assigned`);
			refresh();
		},
		onError: (e) => toast.error(errorMessage(e)),
	});

	if (isLoading || !data) return <LoadingState title="Loading groups..." />;

	const count = Number(addCount);
	const validCount = Number.isInteger(count) && count >= 1 && count <= 20;
	const hasGroups = data.groups.length > 0;
	const assignedCount = data.groups.reduce((n, g) => n + g.ticket_count, 0);
	const typeOptions = ticketTypes.map((t) => ({
		value: String(t.id),
		label: t.name.trim(),
	}));
	const typeNames = Object.fromEntries(
		ticketTypes.map((t) => [String(t.id), t.name.trim()]),
	);
	const typeName = (id: string) =>
		ticketTypes.find((t) => String(t.id) === id)?.name.trim() ?? `#${id}`;

	const targets: MoveTarget[] = [
		...data.groups.map((g) => ({ key: String(g.id), name: g.name })),
		{ key: "none", name: "Not in a group" },
	];
	const toggle = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (!next.delete(id)) next.add(id);
			return next;
		});
	const moveTo = (ids: string[], key: string) => move.mutate({ ids, key });
	const onDragStart = ({ active }: DragStartEvent) => {
		const d = active.data.current as
			| { name: string; typeName: string }
			| undefined;
		const count = selected.has(String(active.id)) ? selected.size : 1;
		setDragging(d ? { ...d, count } : null);
	};
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		setDragging(null);
		const from = (active.data.current as { groupKey: string } | undefined)
			?.groupKey;
		if (!over || String(over.id) === from) return;
		const id = String(active.id);
		moveTo(selected.has(id) ? [...selected] : [id], String(over.id));
	};

	const addGroups = (
		<div className="flex items-end gap-2">
			<InputLabel
				label="Number of groups"
				htmlFor={countId}
				inputType="number"
				min={1}
				max={20}
				value={addCount}
				onChange={setAddCount}
				placeholder="e.g. 4"
				fieldClassName="w-36"
			/>
			<Button
				type="button"
				variant="outline"
				className={BUTTON}
				disabled={!validCount || setup.isPending}
				onClick={() => setup.mutate(count)}
			>
				<Plus className="mr-2 size-4" />
				Create groups
			</Button>
		</div>
	);

	const addOneGroup = (
		<Button
			type="button"
			variant="outline"
			className={BUTTON}
			disabled={setup.isPending}
			onClick={() => setup.mutate(1)}
		>
			<Plus className="mr-2 size-4" />
			Add group
		</Button>
	);

	const confirmAssign = () =>
		mode === "all"
			? openConfirm({
					title: "Re-sort everyone",
					message:
						"This moves every paid ticket again, including ones you moved by hand. Attendees already told their room may change. Continue?",
					confirmLabel: "Re-sort all",
					cancelLabel: "Cancel",
					type: "destructive",
					onConfirm: () => assign.mutate(),
				})
			: assign.mutate();

	return (
		<div className="flex flex-col gap-8 px-4 pb-8 md:px-6">
			<FormGroupContainer
				title={{
					icon: Users,
					label: "Groups",
					description: hasGroups
						? "Name each group and choose the ticket type it should fill first."
						: "How many groups do you need? For example, one per room.",
				}}
				actions={hasGroups ? addOneGroup : addGroups}
			>
				{hasGroups ? (
					<>
						<div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
							<span>
								<strong className="tabular-nums">
									{assignedCount + data.unassigned_count + data.excluded_count}
								</strong>{" "}
								paid tickets
							</span>
							<span>
								<strong className="tabular-nums">{assignedCount}</strong> in
								groups
							</span>
							{data.excluded_count > 0 && (
								<span className="text-muted-foreground">
									<strong className="tabular-nums">
										{data.excluded_count}
									</strong>{" "}
									excluded
								</span>
							)}
							<span
								className={
									data.unassigned_count > 0
										? "font-medium text-amber-700 dark:text-amber-400"
										: "text-muted-foreground"
								}
							>
								<strong className="tabular-nums">
									{data.unassigned_count}
								</strong>{" "}
								not in a group
							</span>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
							{data.groups.map((g) => (
								<GroupTile
									fillMode={fillMode}
									key={g.id}
									eventId={eventId}
									group={g}
									typeOptions={typeOptions}
									onSaved={refresh}
								/>
							))}
						</div>
					</>
				) : (
					<p className="text-muted-foreground text-sm">
						No groups yet. Enter a number above to create them.
					</p>
				)}
			</FormGroupContainer>

			{hasGroups && (
				<FormGroupContainer
					title={{
						icon: Shuffle,
						label: "Assign tickets",
						description: `${data.unassigned_count} paid ticket(s) are not in a group. Balance comes first; the priority type is filled in first, the rest fill the space left.`,
					}}
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<SelectLabel
							label="Which tickets"
							htmlFor={modeId}
							value={mode}
							onChange={(v) => {
								setMode(v as TicketGroupMode);
								setPreview(null);
							}}
							options={MODE_OPTIONS}
						/>
						<SelectLabel
							label="Priority fill"
							htmlFor={fillId}
							description="How a group with several priority types takes them. Applies to Assign, Preview and auto-assign."
							value={fillMode}
							onChange={(v) => setFillMode.mutate(v as "mixed" | "ordered")}
							options={FILL_OPTIONS}
							disabled={setFillMode.isPending || !eventData}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<FieldLabel htmlFor={excludedId}>Excluded ticket types</FieldLabel>
						<MultiSelectLegacy
							options={typeOptions}
							selected={excludedIds.map(String)}
							onChange={(ids) => setExcluded.mutate(ids.map(Number))}
							placeholder="None (everyone gets a group)"
							className="w-full rounded-none py-6 md:py-2"
						/>
						<FieldDescription>
							Tickets of these types are never put in a group: not by Assign,
							Re-sort or auto-assign. Any already in a group are taken out. You
							can still move one by hand.
						</FieldDescription>
					</div>
					<SwitchCardInput
						label="Auto-assign new tickets"
						description="When a ticket is paid from now on, put it in a group automatically (priority types first, otherwise the smallest group). Tickets already in a group never move."
						htmlFor="auto-assign-ticket-groups"
						variant="no-rounded"
						border={true}
						checked={eventData?.auto_assign_ticket_groups === true}
						onCheckedChange={(on) => autoAssign.mutate(on)}
						disabled={autoAssign.isPending || !eventData}
					/>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							className={BUTTON}
							onClick={() => previewMut.mutate()}
							disabled={previewMut.isPending}
						>
							<Eye className="mr-2 size-4" />
							Preview
						</Button>
						<Button
							type="button"
							className={BUTTON}
							onClick={confirmAssign}
							disabled={assign.isPending}
						>
							{assign.isPending ? "Assigning..." : "Assign"}
						</Button>
					</div>
				</FormGroupContainer>
			)}

			{preview && (
				<FormGroupContainer
					title={{
						icon: LayoutGrid,
						label: "Preview",
						description: `${preview.moves} ticket(s) will be placed. Green shows what arrives in each group. Nothing is saved until you press Assign.`,
					}}
				>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Group</TableHead>
									<TableHead>Now</TableHead>
									<TableHead>After</TableHead>
									<TableHead>Ticket types</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{preview.groups.map((g) => (
									<TableRow
										key={g.id}
										className={cn(
											g.added > 0 && "bg-green-50 dark:bg-green-950/30",
										)}
									>
										<TableCell className="font-medium">{g.name}</TableCell>
										<TableCell className="text-muted-foreground tabular-nums">
											{g.current_count}
										</TableCell>
										<TableCell className="tabular-nums">
											{g.count}
											{g.added > 0 && (
												<span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800 text-xs dark:bg-green-900/50 dark:text-green-300">
													+{g.added}
												</span>
											)}
										</TableCell>
										<TableCell className="whitespace-normal text-sm">
											{Object.entries(g.by_type).length === 0
												? "-"
												: Object.entries(g.by_type).map(([id, n], i) => {
														const added = g.added_by_type[id] ?? 0;
														return (
															<span key={id} className="text-muted-foreground">
																{i > 0 && ", "}
																{typeName(id)}: {n}
																{added > 0 && (
																	<span className="font-medium text-green-700 dark:text-green-400">
																		{" "}
																		(+{added} new)
																	</span>
																)}
															</span>
														);
													})}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</FormGroupContainer>
			)}

			{hasGroups && (
				<FormGroupContainer
					title={{
						icon: List,
						label: "Tickets in each group",
						description:
							"See who is in each group and compare them without closing this window.",
					}}
					actions={
						<Button
							type="button"
							variant="outline"
							className={BUTTON}
							onClick={() => setShowTickets((v) => !v)}
						>
							{showTickets ? "Hide tickets" : "Show tickets"}
						</Button>
					}
				>
					{showTickets ? (
						<DndContext
							sensors={sensors}
							onDragStart={onDragStart}
							onDragEnd={onDragEnd}
							onDragCancel={() => setDragging(null)}
						>
							<p className="mb-3 text-muted-foreground text-sm">
								Drag a name onto another group, or tick several and use Move to.
								Dragging a ticked name moves all the ticked ones.
							</p>
							{selected.size > 0 && (
								<div className="mb-3 flex flex-wrap items-center gap-2 border bg-muted/40 p-2 text-sm">
									<strong className="tabular-nums">{selected.size}</strong>{" "}
									selected
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												type="button"
												size="sm"
												className="rounded-none"
												disabled={move.isPending}
											>
												Move to...
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											<MoveToItems
												targets={targets}
												onPick={(key) => moveTo([...selected], key)}
											/>
										</DropdownMenuContent>
									</DropdownMenu>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="rounded-none"
										onClick={() => setSelected(new Set())}
									>
										Clear
									</Button>
								</div>
							)}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
								{data.groups.map((g) => (
									<GroupTicketColumn
										key={g.id}
										eventId={eventId}
										groupKey={String(g.id)}
										title={g.name}
										typeCounts={g.type_counts}
										typeNames={typeNames}
										targets={targets}
										selected={selected}
										onToggle={toggle}
										onMove={moveTo}
									/>
								))}
								{data.unassigned_count > 0 && (
									<GroupTicketColumn
										eventId={eventId}
										groupKey="none"
										title="Not in a group"
										typeCounts={data.unassigned_by_type}
										typeNames={typeNames}
										targets={targets}
										selected={selected}
										onToggle={toggle}
										onMove={moveTo}
									/>
								)}
							</div>
							<DragOverlay>
								{dragging && (
									<div className="border bg-background px-3 py-2 shadow-md">
										<p className="font-medium text-sm">
											{dragging.name}
											{dragging.count > 1 && ` + ${dragging.count - 1} more`}
										</p>
										<p className="text-muted-foreground text-xs">
											{dragging.typeName}
										</p>
									</div>
								)}
							</DragOverlay>
						</DndContext>
					) : (
						<p className="text-muted-foreground text-sm">
							Press Show tickets to list each group's tickets side by side.
						</p>
					)}
				</FormGroupContainer>
			)}
		</div>
	);
}

export default function TicketGroupsDialog() {
	const { event_id } = useParams<{ event_id: string }>();
	return <TicketGroupsView eventId={event_id} />;
}
