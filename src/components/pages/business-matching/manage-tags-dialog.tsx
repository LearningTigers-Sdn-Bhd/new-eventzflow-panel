import { AlertTriangle, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TagChipInput } from "@/components/admin-ui/form/tag-chip-input";
import { Button } from "@/components/ui/button";
import {
	useBusinessMatchingTags,
	useUpdateBusinessMatchingTags,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { TagRename } from "@/lib/api/business-matching";

interface ManageTagsDialogProps {
	eventId: string;
}

const ManageTagsDialog: React.FC<ManageTagsDialogProps> = ({ eventId }) => {
	const { closeDialog } = useDialog();

	const { data: tags, isLoading } = useBusinessMatchingTags(eventId);
	const { mutate: updateTags, isPending } =
		useUpdateBusinessMatchingTags(eventId);

	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);
	const [offeringRenames, setOfferingRenames] = useState<TagRename[]>([]);
	const [interestRenames, setInterestRenames] = useState<TagRename[]>([]);

	useEffect(() => {
		if (tags) {
			setOfferingTags(tags.offering_tags || []);
			setInterestTags(tags.interest_tags || []);
		}
	}, [tags]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateTags(
			{
				offering_tags: offeringTags,
				interest_tags: interestTags,
				renamed_offering_tags: offeringRenames,
				renamed_interest_tags: interestRenames,
			},
			{
				onSuccess: () => {
					toast.success("Tags updated successfully!");
					closeDialog();
				},
				onError: (error) => {
					toast.error("Failed to update tags", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const isEmpty = offeringTags.length === 0 && interestTags.length === 0;

	return (
		<form onSubmit={handleSubmit} className="space-y-4 py-2">
			<TagChipInput
				label="Offering Tags"
				value={offeringTags}
				onChange={setOfferingTags}
				onRename={(from, to) =>
					setOfferingRenames((prev) => [...prev, { from, to }])
				}
				placeholder="e.g. SaaS, Consulting, Seed Fund"
				description="What hosts and attendees can select to describe what they offer. Click the pencil to rename a tag everywhere it's already been selected."
				disabled={isPending}
			/>

			<TagChipInput
				label="Interest Tags"
				value={interestTags}
				onChange={setInterestTags}
				onRename={(from, to) =>
					setInterestRenames((prev) => [...prev, { from, to }])
				}
				placeholder="e.g. Enterprise Clients, Distributors"
				description="What hosts and attendees can select to describe what they're seeking. Click the pencil to rename a tag everywhere it's already been selected."
				disabled={isPending}
			/>

			{isEmpty && (
				<div className="flex items-start gap-2 rounded-none border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-800 dark:text-yellow-200">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<span>
						Hosts and attendees won't have anything to pick until you add tags.
					</span>
				</div>
			)}

			<div className="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Tags
				</Button>
			</div>
		</form>
	);
};

export default ManageTagsDialog;
