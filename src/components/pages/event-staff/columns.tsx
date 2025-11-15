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
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import { EventStaffActionsMenu } from "./action-menu";

export type EventStaffMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	globalRole: "org_owner" | "organizer" | "member";
	eventRole: "event_admin" | "event_team_member";
	status: "active" | "inactive";
	assignmentId: number;
	createdAt: string;
	updatedAt: string;
};

// Base columns that are always shown
const baseColumns: ColumnDef<EventStaffMember>[] = [
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
		size: 220,
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
		size: 150,
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
		accessorKey: "eventRole",
		size: 140,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterRole = column.getFilterValue() as
				| "event_admin"
				| "event_team_member"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2">
							<p className="font-medium">
								Event Role
								{filterRole && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterRole === "event_admin" ? "Admin" : "Team Member"}
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
							All Roles
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("event_admin")}
						>
							Admin
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("event_team_member")}
						>
							Team Member
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const role = row.getValue("eventRole") as string;
			const roleLabel = role === "event_admin" ? "Admin" : "Team Member";
			return (
				<Badge
					variant="outline"
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						role === "event_admin" && "border-purple-500 text-purple-500",
						role === "event_team_member" && "border-blue-500 text-blue-500",
					)}
				>
					{roleLabel}
				</Badge>
			);
		},
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
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-none">
								<ChevronDown className="size-4" />
							</Button>
						</DropdownMenuTrigger>
					</div>
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
					<p className="font-medium">Assigned At</p>
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
			const { formatDate } = useFormatDate();
			return <div>{formatDate(row.getValue("createdAt"))}</div>;
		},
	},
];

// Actions column (only for org_owner)
const actionsColumn: ColumnDef<EventStaffMember> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const member = row.original;
		return (
			<div className="flex justify-center">
				<EventStaffActionsMenu member={member} />
			</div>
		);
	},
};

// Function to get columns based on user role
export const getEventStaffColumns = (
	userRole?: "org_owner" | "organizer" | "member",
): ColumnDef<EventStaffMember>[] => {
	// Only org_owner can see actions column
	if (userRole === "org_owner") {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export for backward compatibility (with actions column)
export const columns: ColumnDef<EventStaffMember>[] = [
	...baseColumns,
	actionsColumn,
];
