"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { getEventTickets, resizeGuestPasses } from "@/lib/api/ticket";

/**
 * Change a guest pass pack's size (e.g. 6 -> 12) without deleting and
 * recreating tickets: existing passes keep their QR codes, new ones join the
 * same batch.
 */
export default function ResizeGuestPassesForm() {
	const { closeDialog } = useDialog();
	const eventId = useParams().event_id as string;
	const queryClient = useQueryClient();
	const batchFieldId = useId();
	const quantityFieldId = useId();

	const [batchId, setBatchId] = useState("");
	const [quantity, setQuantity] = useState("");

	const { data: tickets, isLoading } = useQuery({
		queryKey: ["event", eventId, "tickets", "guest-pass-packs"],
		queryFn: () => getEventTickets(eventId),
	});

	const packs = useMemo(() => {
		const byBatch = new Map<string, { label: string; count: number }>();
		for (const t of tickets ?? []) {
			if (!t.guestPassLabel || !t.registrationBatchId) continue;
			const pack = byBatch.get(t.registrationBatchId) ?? {
				label: t.guestPassLabel,
				count: 0,
			};
			pack.count += 1;
			byBatch.set(t.registrationBatchId, pack);
		}
		return byBatch;
	}, [tickets]);

	const current = packs.get(batchId)?.count;
	const target = Number.parseInt(quantity, 10);
	const validTarget = Number.isFinite(target) && target >= 1 && target <= 500;
	const shrinking = current !== undefined && validTarget && target < current;

	const mutation = useMutation({
		mutationFn: resizeGuestPasses,
		onSuccess: (result) => {
			toast.success(
				`Pack now has ${result.quantity} passes (${result.added} added, ${result.removed} removed)`,
			);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to resize guest passes");
		},
	});

	return (
		<div className="h-full">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!batchId || !validTarget) return;
					mutation.mutate({
						eventId,
						registrationBatchId: batchId,
						quantity: target,
					});
				}}
				className="flex h-full flex-col justify-between gap-8"
			>
				<FieldSet className="grid grid-cols-1 gap-x-4 gap-y-8 md:gap-y-8">
					<div className="grid grid-cols-1 gap-4">
						<SelectLabel
							label="Company / Pack"
							htmlFor={batchFieldId}
							value={batchId}
							onChange={(value) => {
								setBatchId(value);
								setQuantity(String(packs.get(value)?.count ?? ""));
							}}
							options={[...packs].map(([id, pack]) => ({
								value: id,
								label: `${pack.label} (${pack.count} passes)`,
							}))}
							placeholder={
								isLoading ? "Loading..." : "Select a guest pass pack"
							}
							disabled={mutation.isPending || isLoading}
						/>
						<InputLabel
							label="New total number of passes"
							htmlFor={quantityFieldId}
							inputType="number"
							value={quantity}
							onChange={setQuantity}
							min={1}
							max={500}
							description="Existing passes and their QR codes are kept. Extra passes are added to the same pack."
							disabled={mutation.isPending || !batchId}
						/>
						{shrinking && (
							<div className="flex items-center gap-2 border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
								<AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
								<span className="text-amber-900 text-sm dark:text-amber-100">
									This archives {current - target} pass(es), highest numbers
									first. Passes that are checked in or renamed can't be removed.
								</span>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={closeDialog}
							disabled={mutation.isPending}
							className="w-auto rounded-none px-6 py-6 md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								mutation.isPending ||
								!batchId ||
								!validTarget ||
								target === current
							}
							className="w-auto rounded-none px-6 py-6 md:py-4"
						>
							{mutation.isPending ? "Saving..." : "Resize Pack"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</div>
	);
}
