"use client";

import { Loader2, Package } from "lucide-react";
import { IconTitle } from "@/components/ui/icon-heading";
import type { Event } from "@/lib/api/event";
import type { ExhibitorKitWithEventAndVendor } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface ExhibitorKitsClientWrapperProps {
	kits: ExhibitorKitWithEventAndVendor[];
	events: Event[];
	isLoading?: boolean;
	error?: Error | null;
	showHeader?: boolean;
}

export default function ExhibitorKitsClientWrapper({
	kits,
	events,
	isLoading = false,
	error = null,
	showHeader = true,
}: ExhibitorKitsClientWrapperProps) {
	// Sort by created_at in descending order (latest first)
	const sortedKits = [...kits].sort((a, b) => {
		if (!a.created_at || !b.created_at) return 0;
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<Package className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					Failed to load exhibitor list
				</h3>
				<p className="text-muted-foreground text-sm">{error.message}</p>
			</div>
		);
	}

	return (
		<div className="p-0">
			{showHeader && (
				<div className="page-header mb-6">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Package}
							title="Exhibitor List"
							description="View exhibitor across all events."
						/>
					</div>
				</div>
			)}
			{isLoading ? (
				<div className="flex h-[50vh] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable columns={columns} data={sortedKits} events={events} />
			)}
		</div>
	);
}
