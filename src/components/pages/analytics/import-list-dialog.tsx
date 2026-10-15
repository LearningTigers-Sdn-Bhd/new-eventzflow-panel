"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	ChevronDown,
	GripVertical,
	ListOrdered,
	Plus,
	Search,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useReportLanguage } from "@/hooks/use-report-language";
import {
	type CustomFieldBreakdownRow,
	setCustomFieldList,
} from "@/lib/api/event/analytics";
import { cn } from "@/lib/utils";
import { parseValueList } from "./parse-value-list";

interface ImportListDialogProps {
	eventId: string;
	fieldKey: string;
	groupLabel: string;
	fieldLabel: string;
	groups: { group: string; rows: CustomFieldBreakdownRow[] }[];
}

interface ArrangeItem {
	value: string;
	quota?: number;
	count: number;
}

/**
 * Sets the display order + quotas of one group's values in the breakdown.
 * "Arrange" reorders what the report already shows (drag or type a
 * position); "Paste List" bulk-loads a client's list, including values with
 * no registrations yet. Only report config is saved — never ticket data.
 */
export function ImportListDialog({
	eventId,
	fieldKey,
	groupLabel,
	fieldLabel,
	groups,
}: ImportListDialogProps) {
	const { labels } = useReportLanguage();
	const queryClient = useQueryClient();
	const listId = useId();
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("arrange");
	const [groupValue, setGroupValue] = useState("");
	const [text, setText] = useState("");
	const [search, setSearch] = useState("");
	const [order, setOrder] = useState<ArrangeItem[]>([]);

	const group = groups.find((g) => g.group === groupValue.trim());

	// Reset the arrange list whenever the picked group (or its data) changes.
	useEffect(() => {
		setOrder(
			(group?.rows ?? [])
				.filter((row) => row.value !== "Unspecified")
				.map((row) => ({
					value: row.value,
					quota: row.quota,
					count: row.count,
				})),
		);
		setSearch("");
	}, [group]);

	const pasted = useMemo(() => parseValueList(text), [text]);
	const registered = useMemo(
		() =>
			new Set(
				group?.rows.filter((row) => row.count > 0).map((row) => row.value),
			),
		[group],
	);

	const items =
		tab === "paste"
			? pasted
			: order.map(({ value, quota }) => ({ value, quota: quota ?? null }));

	const mutation = useMutation({
		mutationFn: () =>
			setCustomFieldList(eventId, fieldKey, groupValue.trim(), items),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "custom_field_breakdown"],
			});
			setOpen(false);
			setText("");
		},
	});

	const moveTo = (from: number, to: number) =>
		setOrder((prev) =>
			arrayMove(prev, from, Math.min(Math.max(to, 0), prev.length - 1)),
		);
	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		moveTo(
			order.findIndex((item) => item.value === active.id),
			order.findIndex((item) => item.value === over.id),
		);
	};
	const setQuota = (value: string, quota?: number) =>
		setOrder((prev) =>
			prev.map((item) => (item.value === value ? { ...item, quota } : item)),
		);

	const query = search.trim().toLowerCase();
	const visible = query
		? order.filter((item) => item.value.toLowerCase().includes(query))
		: order;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
				>
					<ListOrdered className="h-4 w-4" />
					{labels.importList}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{labels.importListTitle}</DialogTitle>
					<DialogDescription>{labels.importListHint}</DialogDescription>
				</DialogHeader>

				<div className="space-y-1">
					<label htmlFor={`${listId}-group`} className="font-medium text-sm">
						{groupLabel}
					</label>
					<CreatableSelect
						id={`${listId}-group`}
						value={groupValue}
						onChange={setGroupValue}
						options={groups.map((g) => g.group)}
						placeholder={labels.selectOrType}
						addNewLabel={labels.addNew}
					/>
					{groupValue.trim() && !group && (
						<p className="text-amber-700 text-xs dark:text-amber-400">
							{labels.newGroupWarning}
						</p>
					)}
				</div>

				<Tabs value={tab} onValueChange={setTab} className="min-w-0">
					<TabsList className="rounded-none">
						<TabsTrigger value="arrange" className="rounded-none">
							{labels.tabArrange}
						</TabsTrigger>
						<TabsTrigger value="paste" className="rounded-none">
							{labels.tabPaste}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="arrange" className="space-y-2">
						{!groupValue.trim() ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								{labels.pickGroupFirst}
							</p>
						) : order.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								{labels.noDataAvailable}
							</p>
						) : (
							<>
								<p className="text-muted-foreground text-xs">
									{labels.arrangeHint}
								</p>
								{order.length > 5 && (
									<div className="relative">
										<Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											placeholder={labels.searchPlaceholder}
											className="h-8 rounded-none pl-8"
										/>
									</div>
								)}
								<div className="max-h-80 overflow-y-auto border text-sm">
									<div className="sticky top-0 z-10 grid grid-cols-[2rem_3.5rem_1fr_4.5rem_4rem] items-center gap-2 bg-muted px-2 py-1.5 font-medium text-xs">
										<span />
										<span>{labels.billNo}</span>
										<span>{fieldLabel}</span>
										<span className="text-right">{labels.quota}</span>
										<span className="text-right">{labels.registered}</span>
									</div>
									<DndContext onDragEnd={handleDragEnd}>
										<SortableContext
											items={visible.map((item) => item.value)}
											strategy={verticalListSortingStrategy}
										>
											{visible.map((item) => (
												<ArrangeRow
													key={item.value}
													item={item}
													position={order.indexOf(item) + 1}
													dragDisabled={!!query}
													onMoveTo={(to) => moveTo(order.indexOf(item), to - 1)}
													onQuota={(quota) => setQuota(item.value, quota)}
												/>
											))}
										</SortableContext>
									</DndContext>
								</div>
							</>
						)}
					</TabsContent>

					<TabsContent value="paste" className="space-y-2">
						<p className="text-muted-foreground text-xs">{labels.pasteHint}</p>
						<Textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows={8}
							className="max-h-40 overflow-y-auto rounded-none font-mono text-xs"
							placeholder={labels.importListPlaceholder}
						/>
						{pasted.length > 0 && (
							<div className="max-h-64 overflow-y-auto border text-sm">
								<table className="w-full">
									<thead className="sticky top-0 bg-muted">
										<tr>
											<th className="w-10 px-2 py-1 text-left">
												{labels.billNo}
											</th>
											<th className="px-2 py-1 text-left">{fieldLabel}</th>
											<th className="px-2 py-1 text-right">{labels.quota}</th>
											<th className="px-2 py-1" />
										</tr>
									</thead>
									<tbody>
										{pasted.map((item, index) => (
											<tr key={item.value} className="border-t">
												<td className="px-2 py-1 text-muted-foreground">
													{index + 1}
												</td>
												<td className="px-2 py-1">{item.value}</td>
												<td className="px-2 py-1 text-right">
													{item.quota ?? "-"}
												</td>
												<td className="px-2 py-1 text-right text-xs">
													{registered.has(item.value) ? (
														<span className="text-green-600 dark:text-green-400">
															{labels.statusExisting}
														</span>
													) : (
														<span className="text-amber-700 dark:text-amber-400">
															{labels.statusNew}
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</TabsContent>
				</Tabs>

				{mutation.isError && (
					<p className="text-destructive text-sm">{labels.importFailed}</p>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						className="rounded-none"
						onClick={() => setOpen(false)}
					>
						{labels.cancel}
					</Button>
					<Button
						type="button"
						className="rounded-none"
						disabled={!groupValue.trim() || !items.length || mutation.isPending}
						onClick={() => mutation.mutate()}
					>
						{labels.save} ({items.length})
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface ArrangeRowProps {
	item: ArrangeItem;
	position: number;
	dragDisabled: boolean;
	onMoveTo: (position: number) => void;
	onQuota: (quota?: number) => void;
}

function ArrangeRow({
	item,
	position,
	dragDisabled,
	onMoveTo,
	onQuota,
}: ArrangeRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.value, disabled: dragDisabled });

	const commitPosition = (raw: string) => {
		const next = Number(raw);
		if (Number.isInteger(next) && next > 0 && next !== position) onMoveTo(next);
	};

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn(
				"grid grid-cols-[2rem_3.5rem_1fr_4.5rem_4rem] items-center gap-2 border-t bg-background px-2 py-1",
				isDragging && "relative z-20 shadow-md",
			)}
		>
			<button
				type="button"
				aria-label="Drag to reorder"
				disabled={dragDisabled}
				className="flex cursor-grab items-center justify-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-4" />
			</button>
			<Input
				key={position}
				type="number"
				min={1}
				defaultValue={position}
				onBlur={(e) => commitPosition(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") commitPosition(e.currentTarget.value);
				}}
				className="h-7 rounded-none px-1.5 text-xs"
			/>
			<span className="min-w-0 truncate" title={item.value}>
				{item.value}
			</span>
			<Input
				type="number"
				min={0}
				defaultValue={item.quota ?? ""}
				placeholder="-"
				onBlur={(e) => {
					const raw = e.target.value.trim();
					onQuota(raw === "" ? undefined : Math.max(0, Number(raw)));
				}}
				className="h-7 rounded-none px-1.5 text-right text-xs"
			/>
			<span className="text-right text-muted-foreground tabular-nums">
				{item.count.toLocaleString()}
			</span>
		</div>
	);
}

interface CreatableSelectProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	options: string[];
	placeholder: string;
	addNewLabel: string;
}

/** Select-styled picker over existing options that also accepts a typed new value. */
function CreatableSelect({
	id,
	value,
	onChange,
	options,
	placeholder,
	addNewLabel,
}: CreatableSelectProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const typed = query.trim();
	const filtered = options.filter((o) =>
		o.toLowerCase().includes(typed.toLowerCase()),
	);
	const choose = (next: string) => {
		onChange(next);
		setOpen(false);
		setQuery("");
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					className={cn(
						"flex h-9 w-full items-center justify-between gap-2 rounded-none border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
						!value && "text-muted-foreground",
					)}
				>
					<span className="line-clamp-1">{value || placeholder}</span>
					<ChevronDown className="size-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-(--radix-popover-trigger-width) rounded-none p-1"
			>
				<Input
					autoFocus
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && typed) {
							e.preventDefault();
							choose(filtered.find((o) => o === typed) ?? typed);
						}
					}}
					placeholder={placeholder}
					className="mb-1 h-8 rounded-none"
				/>
				<div className="max-h-60 overflow-y-auto">
					{filtered.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => choose(option)}
							className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
						>
							<span>{option}</span>
							{option === value && <Check className="size-4 shrink-0" />}
						</button>
					))}
					{typed && !options.includes(typed) && (
						<button
							type="button"
							onClick={() => choose(typed)}
							className="flex w-full items-center gap-2 border-t px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
						>
							<Plus className="size-4 shrink-0 text-muted-foreground" />
							<span>
								{addNewLabel}: <span className="font-medium">{typed}</span>
							</span>
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
