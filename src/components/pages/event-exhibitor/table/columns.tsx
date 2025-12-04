"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { EventVendor } from "@/lib/api/event-vendor";
import { ExhibitorActionsMenu } from "./action-menu";

export type ExhibitorMember = EventVendor;

const baseColumns: ColumnDef<ExhibitorMember>[] = [
	{
		accessorKey: "exhibitor_kit.booth_number",
		id: "booth_number",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Booth No.</p>
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
			const kit = row.original.exhibitor_kit;
			return <div className="font-medium">{kit?.booth_number || "-"}</div>;
		},
	},
	{
		accessorKey: "exhibitor_kit.company_name",
		id: "company_name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Company</p>
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
			const kit = row.original.exhibitor_kit;
			return (
				<div className="font-medium">
					{kit?.company_name || row.original.vendor.full_name}
				</div>
			);
		},
	},
	{
		accessorKey: "exhibitor_kit.name_on_fascia",
		id: "name_on_fascia",
		size: 180,
		header: () => <p className="font-medium">Fascia Name</p>,
		cell: ({ row }) => {
			const kit = row.original.exhibitor_kit;
			return <div className="text-sm">{kit?.name_on_fascia || "-"}</div>;
		},
	},
	{
		accessorKey: "exhibitor_kit.booth_type",
		id: "booth_type",
		size: 140,
		filterFn: (row, id, value) => {
			return row.original.exhibitor_kit?.booth_type === value;
		},
		header: ({ column }) => {
			const filterType = column.getFilterValue() as
				| "shell_scheme"
				| "raw_space"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							<p className="font-medium">
								Booth Type
								{filterType && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterType.replace("_", " ")}
									</Badge>
								)}
							</p>
							<ChevronDown className="size-4" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none bg-background"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Types
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("shell_scheme")}
						>
							Shell Scheme
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("raw_space")}
						>
							Raw Space
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const kit = row.original.exhibitor_kit;
			if (!kit?.booth_type)
				return <span className="text-muted-foreground">-</span>;
			return (
				<Badge
					variant="outline"
					className={cn(
						"rounded-none font-medium capitalize",
						kit.booth_type === "shell_scheme" &&
							"border-purple-500 text-purple-500",
						kit.booth_type === "raw_space" &&
							"border-orange-500 text-orange-500",
					)}
				>
					{kit.booth_type.replace("_", " ")}
				</Badge>
			);
		},
	},

	{
		accessorKey: "exhibitor_kit.pic_full_name",
		id: "pic_full_name",
		size: 220,
		header: () => <p className="font-medium">Contact Person</p>,
		cell: ({ row }) => {
			const kit = row.original.exhibitor_kit;
			if (!kit) return <span className="text-muted-foreground">-</span>;
			return (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{kit.pic_full_name}</span>
					<span className="text-xs text-muted-foreground">
						{kit.pic_email_address || kit.pic_contact_number}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "exhibitor_kit.payment_status",
		id: "payment_status",
		size: 140,
		filterFn: (row, id, value) => {
			return row.original.exhibitor_kit?.payment_status === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as string | undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							<p className="font-medium">
								Payment
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
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none bg-background"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("unpaid")}
						>
							Unpaid
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("paid")}
						>
							Paid
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("waived")}
						>
							Waived
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("sponsored")}
						>
							Sponsored
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const kit = row.original.exhibitor_kit;
			if (!kit?.payment_status)
				return <span className="text-muted-foreground">-</span>;
			const statusColors: Record<string, string> = {
				unpaid: "border-red-500 text-red-500",
				paid: "border-green-500 text-green-500",
				waived: "border-gray-500 text-gray-500",
				sponsored: "border-blue-500 text-blue-500",
			};
			return (
				<Badge
					variant="outline"
					className={cn(
						"rounded-none font-bold capitalize",
						statusColors[kit.payment_status] || "",
					)}
				>
					{kit.payment_status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "exhibitor_kit.exhibitor_team_members",
		id: "team_count",
		size: 140,
		header: () => <p className="font-medium">Team</p>,
		cell: ({ row }) => {
			const kit = row.original.exhibitor_kit;
			const members = kit?.exhibitor_team_members || [];

			if (members.length === 0) {
				return (
					<span className="text-muted-foreground text-sm text-center block">
						-
					</span>
				);
			}

			const getInitials = (name: string) => {
				return name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2);
			};

			const maxVisible = 3;
			const visibleMembers = members.slice(0, maxVisible);
			const remainingCount = members.length - maxVisible;

			return (
				<Popover>
					<PopoverTrigger asChild>
						<div className="flex items-center cursor-pointer">
							<div className="flex -space-x-2">
								{visibleMembers.map((member, index) => (
									<div
										key={member.id || index}
										className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
									>
										{getInitials(member.full_name)}
									</div>
								))}
								{remainingCount > 0 && (
									<div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-medium text-primary-foreground">
										+{remainingCount}
									</div>
								)}
							</div>
						</div>
					</PopoverTrigger>
					<PopoverContent
						side="top"
						sideOffset={4}
						className="w-auto p-0 rounded-none"
					>
						<div className="min-w-[200px]">
							<div className="border-b px-3 py-2">
								<p className="text-xs font-medium text-muted-foreground">
									{members.length} Team Member{members.length !== 1 ? "s" : ""}
								</p>
							</div>
							<div className="max-h-[200px] overflow-y-auto p-1">
								{members.map((member, index) => (
									<div
										key={member.id || index}
										className="flex items-center gap-2 rounded-none px-2 py-1.5 hover:bg-muted/50"
									>
										<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
											{getInitials(member.full_name)}
										</div>
										<span className="text-sm truncate">{member.full_name}</span>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			);
		},
	},
];

// Actions column
const actionsColumn: ColumnDef<ExhibitorMember> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const exhibitor = row.original;
		return (
			<div className="flex justify-center">
				<ExhibitorActionsMenu exhibitor={exhibitor} />
			</div>
		);
	},
};

// Function to get columns based on permissions
export const getColumns = (
	canManageVendors: boolean = false,
): ColumnDef<ExhibitorMember>[] => {
	if (canManageVendors) {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export with actions column
export const columns: ColumnDef<ExhibitorMember>[] = [
	...baseColumns,
	actionsColumn,
];
