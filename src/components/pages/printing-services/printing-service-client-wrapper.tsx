"use client";

import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { PrintingService } from "@/lib/api/printing-service";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";
import { PrintingServiceFormContent } from "./printing-service-form-dialog";

interface PrintingServiceClientWrapperProps {
	services: PrintingService[];
	isLoading?: boolean;
	error?: Error | null;
	showHeader?: boolean;
}

export default function PrintingServiceClientWrapper({
	services,
	isLoading = false,
	error = null,
	showHeader = true,
}: PrintingServiceClientWrapperProps) {
	const { openDialog } = useDialog();

	// Sort by created_at in descending order (latest first)
	const sortedServices = [...services].sort((a, b) => {
		if (!a.createdAt || !b.createdAt) return 0;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const handleAddService = () => {
		openDialog({
			component: PrintingServiceFormContent,
			props: {},
			config: {
				title: "Add Printing Service",
				description: "Create a new printing service for your catalog.",
				size: "lg",
			},
		});
	};

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<Printer className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					Failed to load printing services
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
							icon={Printer}
							title="Printing Services"
							description="Manage your catalog of printing services for events."
						/>
					</div>
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleAddService}
							className="w-full shrink-0 rounded-none"
						>
							Add Service
						</Button>
					</div>
				</div>
			)}
			{isLoading ? (
				<div className="flex h-[50vh] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable
					columns={columns}
					data={sortedServices}
					onAddService={handleAddService}
				/>
			)}
		</div>
	);
}
