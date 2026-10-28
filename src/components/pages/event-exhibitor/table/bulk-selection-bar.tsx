"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { TagTotals } from "@/lib/api/event-vendor";
import {
	type BulkCollectTagsResult,
	bulkCollectExhibitorKitTags,
	bulkResetExhibitorKitTags,
	type ExhibitorKit,
	type ExhibitorKitFilters,
	restoreExhibitorKitTags,
} from "@/lib/api/exhibitor-kit";

interface BulkSelectionBarProps {
	eventId: number;
	/** Kits ticked on the current page. */
	selectedKits: ExhibitorKit[];
	/** Rows on the current page, and rows matching the filters across all pages. */
	pageRowCount: number;
	totalCount: number;
	pageAllSelected: boolean;
	/** True once "select all matching" was chosen: the action then targets `filters`. */
	allMatching: boolean;
	onAllMatchingChange: (value: boolean) => void;
	filters: ExhibitorKitFilters;
	/** Tags over every matching kit; drives the "mark all matching" shortcut. */
	tagTotals?: TagTotals;
	onClear: () => void;
	onUpdatePayment: () => void;
}

export function summarizeCollect(result: BulkCollectTagsResult): string {
	const parts = [
		`Tags marked collected on ${result.updated} ${result.updated === 1 ? "kit" : "kits"}`,
	];
	if (result.already_complete > 0)
		parts.push(`${result.already_complete} already complete`);
	if (result.skipped_cancelled > 0)
		parts.push(`${result.skipped_cancelled} cancelled skipped`);
	if (result.unpaid > 0) parts.push(`${result.unpaid} still unpaid`);
	return `${parts.join(". ")}.`;
}

export function BulkSelectionBar({
	eventId,
	selectedKits,
	pageRowCount,
	totalCount,
	pageAllSelected,
	allMatching,
	onAllMatchingChange,
	filters,
	tagTotals,
	onClear,
	onUpdatePayment,
}: BulkSelectionBarProps) {
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();
	const refresh = () =>
		queryClient.invalidateQueries({
			queryKey: ["event", String(eventId), "vendors"],
		});

	// Targets every kit matching the filters (spans pages) or just the ticked rows.
	// `reset` flips the action to un-collecting, which both share the undo flow below.
	const apply = useMutation({
		mutationFn: ({
			matching,
			reset,
		}: {
			matching: boolean;
			reset: boolean;
		}) => {
			const target = matching
				? { filters }
				: { kitIds: selectedKits.map((kit) => kit.id) };
			return reset
				? bulkResetExhibitorKitTags(eventId, target)
				: bulkCollectExhibitorKitTags(eventId, target);
		},
		onSuccess: (result, { reset }) => {
			refresh();
			onClear();
			const message = reset
				? `Tags reset on ${result.updated} ${result.updated === 1 ? "kit" : "kits"}.`
				: summarizeCollect(result as BulkCollectTagsResult);
			if (result.previous.length === 0) {
				toast.info(message);
				return;
			}
			toast.success(message, {
				duration: 15000,
				action: {
					label: "Undo",
					onClick: () =>
						restoreExhibitorKitTags(eventId, result.previous)
							.then(() => {
								refresh();
								toast.success("Undone");
							})
							.catch((error: Error) =>
								toast.error(error.message || "Couldn't undo"),
							),
				},
			});
		},
		onError: (error: Error) =>
			toast.error(error.message || "Couldn't update the tags"),
	});

	const selectedCount = allMatching ? totalCount : selectedKits.length;
	if (selectedCount === 0) {
		// A search or filter is active and tags are still owed: one click covers them all.
		const hasFilters = Object.values(filters).some(Boolean);
		const owed = tagTotals ? tagTotals.entitled - tagTotals.collected : 0;
		if (!hasFilters || totalCount === 0 || owed <= 0) return null;

		return (
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2 border bg-muted/40 px-3 py-2">
				<p className="text-sm">
					<span className="font-medium">{totalCount}</span> matching{" "}
					{totalCount === 1 ? "kit" : "kits"}, {owed}{" "}
					{owed === 1 ? "tag" : "tags"} still to collect
				</p>
				<Button
					size="sm"
					className="rounded-none"
					disabled={apply.isPending}
					onClick={() => apply.mutate({ matching: true, reset: false })}
				>
					<Tag className="mr-2 size-4" />
					{apply.isPending
						? "Marking..."
						: `Mark all ${totalCount} matching collected`}
				</Button>
			</div>
		);
	}

	// Everything selected is already collected, so the action flips to un-collecting.
	// With "all matching" selected the totals over those matches decide it.
	const allCollected = allMatching
		? !!tagTotals &&
			tagTotals.entitled > 0 &&
			tagTotals.collected >= tagTotals.entitled
		: selectedKits.every(
				(kit) =>
					kit.booking_status === "cancelled" ||
					(kit.tags_collected ?? 0) >= (kit.tags_included ?? 0),
			);

	const handleTagsClick = () => {
		if (!allCollected) {
			apply.mutate({ matching: allMatching, reset: false });
			return;
		}
		openConfirm({
			title: "Mark tags as not collected?",
			message: `This resets ${selectedCount} ${selectedCount === 1 ? "kit" : "kits"} to 0 tags collected. You can undo it right after.`,
			confirmLabel: "Mark not collected",
			cancelLabel: "Keep collected",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				apply.mutate({ matching: allMatching, reset: true });
				closeDialog();
			},
			onCancel: closeDialog,
		});
	};

	const canSelectAllMatching =
		!allMatching && pageAllSelected && totalCount > pageRowCount;

	return (
		<div className="mb-2 flex flex-wrap items-center justify-between gap-2 border bg-muted/40 px-3 py-2">
			<p className="text-sm">
				{allMatching ? (
					<>
						All <span className="font-medium">{totalCount}</span> matching kits
						selected
					</>
				) : (
					<>
						<span className="font-medium">{selectedCount}</span>{" "}
						{selectedCount === 1 ? "kit" : "kits"} selected
					</>
				)}
				{canSelectAllMatching && (
					<Button
						variant="link"
						size="sm"
						className="h-auto px-2 py-0"
						onClick={() => onAllMatchingChange(true)}
					>
						Select all {totalCount} matching
					</Button>
				)}
			</p>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="rounded-none"
					onClick={onClear}
				>
					Clear
				</Button>
				{!allMatching && (
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={onUpdatePayment}
					>
						Update Payment
					</Button>
				)}
				<Button
					size="sm"
					variant={allCollected ? "outline" : "default"}
					className="rounded-none"
					disabled={apply.isPending}
					onClick={handleTagsClick}
				>
					{allCollected ? (
						<RotateCcw className="mr-2 size-4" />
					) : (
						<Tag className="mr-2 size-4" />
					)}
					{apply.isPending
						? "Updating..."
						: allCollected
							? `Mark tags not collected (${selectedCount})`
							: `Mark tags collected (${selectedCount})`}
				</Button>
			</div>
		</div>
	);
}

/** "212 / 430 tags collected" over the current search and filters. */
export function TagTotalsSummary({ totals }: { totals?: TagTotals }) {
	if (!totals || totals.entitled === 0) return null;

	const remaining = totals.entitled - totals.collected;
	return (
		<div className="mb-2 flex items-baseline justify-end gap-2 text-sm">
			<span className="font-medium text-lg tabular-nums">
				{totals.collected} / {totals.entitled}
			</span>
			<span className="text-muted-foreground">
				tags collected
				{remaining > 0 ? `, ${remaining} to go` : ", all done"}
				{totals.extra > 0 && (
					<span className="text-amber-600"> · {totals.extra} extra</span>
				)}
			</span>
		</div>
	);
}
