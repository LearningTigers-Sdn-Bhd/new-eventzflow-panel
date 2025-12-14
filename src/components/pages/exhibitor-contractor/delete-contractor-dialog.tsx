"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	deleteContractor,
	type ExhibitionContractor,
} from "@/lib/api/contractor";

interface DeleteContractorContentProps {
	contractor: ExhibitionContractor;
}

export function DeleteContractorContent({
	contractor,
}: DeleteContractorContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: () => deleteContractor(contractor.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success("Contractor deleted successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to delete contractor", {
				description: error.message,
			});
		},
	});

	const companyName =
		contractor.exhibition_contractor_profile?.company_name ??
		contractor.full_name;

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to delete{" "}
						<span className="font-semibold">{companyName}</span>?
					</p>
					<p className="text-muted-foreground text-sm">
						This action cannot be undone. This will permanently delete the
						contractor account and remove all associated data.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={deleteMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => deleteMutation.mutate()}
					disabled={deleteMutation.isPending}
				>
					{deleteMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Delete
				</Button>
			</div>
		</div>
	);
}
