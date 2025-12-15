"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Eye, Package, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit/response";
import type { EventVendor } from "@/lib/api/event-vendor/response";
import type { Event } from "@/lib/api/event";

export interface ExhibitorKitWithEventAndVendor extends ExhibitorKit {
	vendor?: EventVendor;
	event?: Event;
}

const getPaymentStatusStyle = (status: string) => {
	switch (status) {
		case "paid":
			return "border-green-500 text-green-500";
		case "unpaid":
			return "border-red-500 text-red-500";
		case "waived":
			return "border-gray-500 text-gray-500";
		case "sponsored":
			return "border-blue-500 text-blue-500";
		default:
			return "border-gray-500 text-gray-500";
	}
};

export const columns: ColumnDef<ExhibitorKitWithEventAndVendor>[] = [
	{
		id: "event",
		accessorFn: (row) => row.event?.title,
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="h-auto p-0 font-semibold hover:bg-transparent"
			>
				Event
				<ArrowDown
					className={cn(
						"ml-2 h-4 w-4 transition-transform",
						column.getIsSorted() === "asc" && "rotate-180",
					)}
				/>
			</Button>
		),
		cell: ({ row }) => {
			const kit = row.original;
			return (
				<div className="font-medium">{kit.event?.title || "Unknown Event"}</div>
			);
		},
	},
	{
		accessorKey: "company_name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="h-auto p-0 font-semibold hover:bg-transparent"
			>
				Company
				<ArrowDown
					className={cn(
						"ml-2 h-4 w-4 transition-transform",
						column.getIsSorted() === "asc" && "rotate-180",
					)}
				/>
			</Button>
		),
		cell: ({ row }) => {
			const kit = row.original;
			return (
				<div>
					<div className="font-medium">{kit.company_name}</div>
					<div className="text-sm text-muted-foreground">
						{kit.vendor?.vendor?.full_name || "Unknown Vendor"}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "booth_number",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="h-auto p-0 font-semibold hover:bg-transparent"
			>
				Booth
				<ArrowDown
					className={cn(
						"ml-2 h-4 w-4 transition-transform",
						column.getIsSorted() === "asc" && "rotate-180",
					)}
				/>
			</Button>
		),
		cell: ({ row }) => {
			const kit = row.original;
			return (
				<div>
					<div className="font-medium">{kit.booth_number}</div>
					<div className="text-sm text-muted-foreground capitalize">
						{kit.booth_type.replace('_', ' ')}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "pic_full_name",
		header: "Primary Contact",
		cell: ({ row }) => {
			const kit = row.original;
			return (
				<div>
					<div className="font-medium">{kit.pic_full_name}</div>
					<div className="text-sm text-muted-foreground">{kit.pic_email_address}</div>
					<div className="text-sm text-muted-foreground">{kit.pic_contact_number}</div>
				</div>
			);
		},
	},
	{
		accessorKey: "exhibitor_team_members",
		header: "Team Size",
		cell: ({ row }) => {
			const kit = row.original;
			const teamSize = kit.exhibitor_team_members?.length || 0;
			return (
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span>{teamSize} member{teamSize !== 1 ? 's' : ''}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "items_count",
		header: "Items & Services",
		cell: ({ row }) => {
			const kit = row.original;
			const itemsCount = kit.exhibitor_kit_items?.length || 0;
			const printingsCount = kit.exhibitor_kit_printings?.length || 0;
			const customRequestsCount = kit.custom_requests?.length || 0;
			
			return (
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-sm">
						<Package className="h-3 w-3 text-muted-foreground" />
						<span>{itemsCount} items</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<Package className="h-3 w-3 text-muted-foreground" />
						<span>{printingsCount} services</span>
					</div>
					{customRequestsCount > 0 && (
						<div className="flex items-center gap-2 text-sm">
							<Package className="h-3 w-3 text-muted-foreground" />
							<span>{customRequestsCount} custom requests</span>
						</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "payment_status",
		header: "Payment Status",
		cell: ({ row }) => {
			const kit = row.original;
			return (
				<Badge 
					variant="outline"
					className={cn("rounded-none font-bold capitalize", getPaymentStatusStyle(kit.payment_status))}
				>
					{kit.payment_status}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const kit = row.original;
			
			return (
				<div className="flex justify-center lg:justify-center">
					<PublicViewDetailsButton kitId={kit.id} eventId={kit.event?.id} />
				</div>
			);
		},
	},
];

function PublicViewDetailsButton({ kitId, eventId }: { kitId: number; eventId?: number }) {
	const router = useRouter();

	const handleViewDetails = () => {
		if (eventId) {
			router.push(`/event/${eventId}/contractor-exhibitor-kits/${kitId}` as any);
		}
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleViewDetails}
			disabled={!eventId}
			className="rounded-none border border-primary/20 h-8 px-3 w-full lg:w-auto"
		>
			<Eye className="h-4 w-4 mr-2" />
			View
		</Button>
	);
}
