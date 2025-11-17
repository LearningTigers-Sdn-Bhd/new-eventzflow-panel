"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorEmptyStateProps {
	onAddVendor?: () => void;
}

export function VendorEmptyState({ onAddVendor }: VendorEmptyStateProps) {
	return (
		<div className="flex h-96 items-center justify-center">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 p-6">
					<Package className="h-12 w-12 text-slate-400" />
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-foreground">
						No vendors yet
					</h3>
					<p className="max-w-sm text-sm text-muted-foreground">
						Get started by adding your first vendor. Manage vendor profiles,
						contact information, and track their activity.
					</p>
				</div>
				{onAddVendor && (
					<Button
						onClick={onAddVendor}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Add Your First Vendor
					</Button>
				)}
			</div>
		</div>
	);
}
