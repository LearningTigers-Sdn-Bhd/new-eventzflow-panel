"use client";

import { HardHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { ContractorFormContent } from "./contractor-form-dialog";
import { DataTable } from "./table/exhibitor-contractor-table";
import { columns } from "./table/exhibitor-contractor-table-columns";

interface ContractorClientWrapperProps {
	contractors: ExhibitionContractor[];
	isLoading?: boolean;
	error?: Error | null;
	showHeader?: boolean;
}

export default function ContractorClientWrapper({
	contractors,
	isLoading = false,
	error = null,
	showHeader = true,
}: ContractorClientWrapperProps) {
	const { openDialog } = useDialog();

	// Sort by created_at in descending order (latest first)
	const sortedContractors = [...contractors].sort((a, b) => {
		if (!a.created_at || !b.created_at) return 0;
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	const handleAddContractor = () => {
		openDialog({
			component: ContractorFormContent,
			props: {},
			config: {
				title: "Add Contractor",
				description: "Create a new exhibition contractor account.",
				size: "2xl",
			},
		});
	};

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<HardHat className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					Failed to load contractors
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
							icon={HardHat}
							title="Exhibitor Contractors"
							description="Manage your exhibitor contractors and their services."
						/>
					</div>
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleAddContractor}
							className="w-full shrink-0 rounded-none"
						>
							Add Contractor
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
					data={sortedContractors}
					onAddContractor={handleAddContractor}
				/>
			)}
		</div>
	);
}
