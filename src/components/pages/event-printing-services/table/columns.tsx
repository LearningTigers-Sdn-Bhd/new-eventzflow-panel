"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, DollarSign, Unlink, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import type { EventPrintingService } from "@/lib/api/event-printing-service";
import { PriceTierDialog } from "../price-tier-dialog";

interface GetColumnsProps {
	onUnlink: (eventPrintingServiceId: number, serviceName: string) => void;
}

export function getColumns({ onUnlink }: GetColumnsProps): ColumnDef<EventPrintingService>[] {
	return [
		{
			id: "name",
			accessorFn: (row) => row.printingService?.name ?? "",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="rounded-none px-0"
				>
					Service Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const service = row.original;
				return (
					<div>
						<div className="font-medium">{service.printingService?.name || "-"}</div>
						{service.printingService?.description && (
							<div className="line-clamp-1 text-muted-foreground text-sm">
								{service.printingService.description}
							</div>
						)}
					</div>
				);
			},
			size: 250,
		},
		{
			id: "category",
			accessorFn: (row) => row.printingService?.itemCategory?.name ?? "",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.printingService?.itemCategory;
				return category ? (
					<Badge variant="outline" className="rounded-none">
						{category.name}
					</Badge>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
			size: 150,
		},
		{
			id: "unit",
			accessorFn: (row) => row.printingService?.unitOfMeasure ?? "",
			header: "Unit",
			cell: ({ row }) => (
				<span>{row.original.printingService?.unitOfMeasure || "-"}</span>
			),
			size: 100,
		},
		{
			id: "defaultPrice",
			accessorFn: (row) => row.printingService?.defaultPrice ?? 0,
			header: "Default Price",
			cell: ({ row }) => (
				<span className="font-medium">
					RM {row.original.printingService?.defaultPrice != null ? Number(row.original.printingService.defaultPrice).toFixed(2) : "0.00"}
				</span>
			),
			size: 120,
		},
		{
			id: "priceTiers",
			header: "Pricing",
			cell: ({ row }) => {
				const service = row.original;
				return <PriceTiersCell service={service} />;
			},
			size: 120,
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const service = row.original;
				return <ActionsCell service={service} onUnlink={onUnlink} />;
			},
			size: 70,
		},
	];
}

function PriceTiersCell({ service }: { service: EventPrintingService }) {
	const { openDialog } = useDialog();

	const handleManagePricing = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				eventPrintingService: service,
			},
			config: {
				title: `Manage Pricing: ${service.printingService?.name}`,
				description: "Configure time-based pricing tiers for this service.",
				size: "xl",
			},
		});
	};

	return (
		<Button
			size="sm"
			variant="outline"
			onClick={handleManagePricing}
			className="h-7 rounded-none px-3"
		>
			<DollarSign className="mr-1 h-3 w-3" />
			Manage
		</Button>
	);
}

function ActionsCell({
	service,
	onUnlink,
}: {
	service: EventPrintingService;
	onUnlink: (id: number, serviceName: string) => void;
}) {
	const { openDialog } = useDialog();

	const handleManagePricing = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				eventPrintingService: service,
			},
			config: {
				title: `Manage Pricing: ${service.printingService?.name}`,
				description: "Configure time-based pricing tiers for this service.",
				size: "xl",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none">
				<DropdownMenuItem onClick={handleManagePricing} className="rounded-none">
					<DollarSign className="mr-2 h-4 w-4" />
					Manage Pricing
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUnlink(service.id, service.printingService?.name || "this service")}
					className="rounded-none text-destructive"
				>
					<Unlink className="mr-2 h-4 w-4" />
					Unlink Service
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
