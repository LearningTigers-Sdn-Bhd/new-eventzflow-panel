"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowDown,
	ChevronDown,
} from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { QuerySearchField } from "@/components/query-search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizerMembers } from "@/lib/api/team";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamMemberActionsMenu } from "./action-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { TeamMember } from "@/lib/api/team";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";

interface OrganizerMembersContentProps {
	organizer: TeamMember;
}

// Define columns for the table
const getColumns = (formatDate: (date: string) => string): ColumnDef<TeamMember>[] => [
	{
		accessorKey: "full_name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Name</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		accessorKey: "email",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Email</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("email")}
			</div>
		),
	},
	{
		accessorKey: "phone",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Phone</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("phone") || "-"}
			</div>
		),
	},
	{
		accessorKey: "status",
		size: 120,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as
				| "active"
				| "inactive"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 rounded-none p-0">
							<div className="flex items-center gap-2">
								<p className="font-medium">
									Status
									{filterStatus && (
										<Badge
											variant="secondary"
											className="ml-2 bg-transparent text-xs capitalize underline"
										>
											{filterStatus}
										</Badge>
									)}
								</p>
								<ChevronDown className="size-4" />
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("active")}
						>
							Active
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("inactive")}
						>
							Inactive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => (
			<Badge
				className={cn(
					"min-w-16 rounded-none font-bold capitalize",
					row.getValue("status") === "active" && "bg-green-500",
					row.getValue("status") === "inactive" && "bg-red-500",
				)}
			>
				{row.getValue("status")}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		size: 130,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			return <div>{formatDate(row.getValue("createdAt"))}</div>;
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const member = row.original;
			return (
				<div className="flex justify-center">
					<TeamMemberActionsMenu member={member} />
				</div>
			);
		},
	},
];

export default function OrganizerMembersContent({
	organizer,
}: OrganizerMembersContentProps) {
	const { formatDate } = useFormatDate();

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

	const columns = React.useMemo(() => getColumns(formatDate), [formatDate]);

	// Fetch real data from API
	const {
		data: members = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["organizer-members", organizer.id],
		queryFn: () => getOrganizerMembers(organizer.id),
	});

	const table = useReactTable({
		data: members,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	// Show loading state
	if (isLoading) {
		return (
			<div className="space-y-6 px-2 md:px-4">
				<Card className="rounded-none border-dashed">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>{organizer.full_name}</span>
							<Badge
								variant="outline"
								className={cn(
									"min-w-16 rounded-none font-bold capitalize",
									"border-blue-500 text-blue-500",
								)}
							>
								Organizer
							</Badge>
						</CardTitle>
						<CardDescription>
							<div className="space-y-1">
								<p>Email: {organizer.email}</p>
								{organizer.phone && <p>Phone: {organizer.phone}</p>}
							</div>
						</CardDescription>
					</CardHeader>
				</Card>
				<div className="flex items-center justify-center py-12">
					<p className="text-muted-foreground">Loading members...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="space-y-6 px-2 md:px-4">
				<Card className="rounded-none border-dashed">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>{organizer.full_name}</span>
							<Badge
								variant="outline"
								className={cn(
									"min-w-16 rounded-none font-bold capitalize",
									"border-blue-500 text-blue-500",
								)}
							>
								Organizer
							</Badge>
						</CardTitle>
						<CardDescription>
							<div className="space-y-1">
								<p>Email: {organizer.email}</p>
								{organizer.phone && <p>Phone: {organizer.phone}</p>}
							</div>
						</CardDescription>
					</CardHeader>
				</Card>
				<div className="flex items-center justify-center py-12">
					<p className="text-destructive">Failed to load members. Please try again.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 px-2 md:px-4">
			{/* Organizer Info Card */}
			<Card className="rounded-none border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span>{organizer.full_name}</span>
						<Badge
							variant="outline"
							className={cn(
								"min-w-16 rounded-none font-bold capitalize",
								"border-blue-500 text-blue-500",
							)}
						>
							Organizer
						</Badge>
					</CardTitle>
					<CardDescription>
						<div className="space-y-1">
							<p>Email: {organizer.email}</p>
							{organizer.phone && <p>Phone: {organizer.phone}</p>}
						</div>
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Search and Filter Controls */}
			<div className="mb-4 flex items-center gap-2 border-y border-dashed bg-accent px-2 py-4 lg:px-4">
				<QuerySearchField
					table={table}
					columns={["full_name", "email", "phone"]}
					placeholder="Search members..."
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto rounded-none">
							{table.getAllColumns().filter((column) => column.getIsVisible())
								.length - 1}{" "}
							columns
							<ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="rounded-none bg-background"
					>
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="rounded-none capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Members Table */}
			<div className="overflow-hidden rounded-none border border-dashed">
				<Table className="w-full">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className={cn(
												header.index === 0 && "ps-3",
												"rounded-none",
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{ width: `${cell.column.getSize()}px` }}
											className={cn(
												table.getVisibleLeafColumns()[0]?.id ===
													cell.column.id && "ps-4",
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No members found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}

