"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";

type PaymentStatus = "unpaid" | "paid" | "waived" | "sponsored" | "deposit";

/** How amount_paid is filled for each kit in the batch. */
type AmountMode = "booking_value" | "fixed" | "unchanged";

// ponytail: 4 at a time. Each PATCH triggers mailers, ticket reconciliation and
// booth sync server-side, so firing 200 at once would just bury the queue.
const CONCURRENCY = 4;

export interface BulkPaymentFormProps {
	kits: ExhibitorKit[];
	onClose?: () => void;
}

/** Resolves the amount_paid to send for one kit, or undefined to leave it alone. */
export function resolveAmount(
	kit: ExhibitorKit,
	mode: AmountMode,
	fixedAmount: string,
): string | undefined {
	if (mode === "unchanged") return undefined;
	if (mode === "fixed") return fixedAmount || undefined;

	const value = kit.booking_value;
	if (value === null || value === undefined || value === "") return undefined;
	return String(value);
}

/** Runs `task` over `items` with at most `limit` in flight at once. */
export async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	task: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
	const results: PromiseSettledResult<R>[] = new Array(items.length);
	let cursor = 0;

	const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
		(async () => {
			while (cursor < items.length) {
				const index = cursor++;
				try {
					results[index] = {
						status: "fulfilled",
						value: await task(items[index]),
					};
				} catch (reason) {
					results[index] = { status: "rejected", reason };
				}
			}
		})(),
	);

	await Promise.all(workers);
	return results;
}

export function BulkPaymentForm({ kits, onClose }: BulkPaymentFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);

	const statusField = useId();
	const amountField = useId();
	const noteField = useId();

	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
	const [amountMode, setAmountMode] = useState<AmountMode>("booking_value");
	const [fixedAmount, setFixedAmount] = useState("");
	const [paymentNote, setPaymentNote] = useState("");

	const queryClient = useQueryClient();

	const withoutBookingValue = kits.filter(
		(kit) =>
			kit.booking_value === null ||
			kit.booking_value === undefined ||
			kit.booking_value === "",
	).length;

	const bulkUpdate = useMutation({
		mutationFn: async () => {
			const results = await mapWithConcurrency(kits, CONCURRENCY, (kit) =>
				updateExhibitorKit(eventId, kit.id, {
					payment_status: paymentStatus,
					amount_paid: resolveAmount(kit, amountMode, fixedAmount),
					payment_note: paymentNote || undefined,
				}),
			);

			const failed = results.filter((r) => r.status === "rejected").length;
			return { total: kits.length, failed };
		},
		onSuccess: ({ total, failed }) => {
			if (failed === 0) {
				toast.success(`Updated ${total} ${total === 1 ? "kit" : "kits"}`);
			} else {
				toast.warning(
					`Updated ${total - failed} of ${total}. ${failed} failed — the ones still showing the old status need another go.`,
				);
			}
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Bulk update failed");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (amountMode === "fixed" && !fixedAmount) {
			toast.error("Enter an amount, or pick a different amount option");
			return;
		}
		bulkUpdate.mutate();
	};

	return (
		<form onSubmit={handleSubmit} className="grid gap-6 pt-4">
			<p className="text-muted-foreground text-sm">
				Applying to{" "}
				<span className="font-medium text-foreground">
					{kits.length} {kits.length === 1 ? "kit" : "kits"}
				</span>
				. Marking kits paid emails each PIC, issues team member tickets and
				books their booths.
			</p>

			<FieldGroup className="gap-4">
				<Field orientation="vertical">
					<FieldLabel htmlFor={statusField} className="text-sm">
						Payment Status
					</FieldLabel>
					<Select
						value={paymentStatus}
						onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
						disabled={bulkUpdate.isPending}
					>
						<SelectTrigger id={statusField} className="rounded-none">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="unpaid">Unpaid</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="waived">Waived</SelectItem>
							<SelectItem value="sponsored">Sponsored</SelectItem>
							<SelectItem value="deposit">Deposit</SelectItem>
						</SelectContent>
					</Select>
				</Field>

				<Field orientation="vertical">
					<FieldLabel className="text-sm">Amount Paid</FieldLabel>
					<RadioGroup
						value={amountMode}
						onValueChange={(value) => setAmountMode(value as AmountMode)}
						disabled={bulkUpdate.isPending}
						className="gap-2"
					>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="booking_value" id="amount-booking-value" />
							<Label
								htmlFor="amount-booking-value"
								className="font-normal text-sm"
							>
								Each kit&apos;s own booth price × quantity
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="fixed" id="amount-fixed" />
							<Label htmlFor="amount-fixed" className="font-normal text-sm">
								Same amount for every kit
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="unchanged" id="amount-unchanged" />
							<Label htmlFor="amount-unchanged" className="font-normal text-sm">
								Leave amounts as they are
							</Label>
						</div>
					</RadioGroup>

					{amountMode === "booking_value" && withoutBookingValue > 0 && (
						<p className="text-muted-foreground text-xs">
							{withoutBookingValue} of these have no booth price recorded —
							their amount is left unchanged.
						</p>
					)}

					{amountMode === "fixed" && (
						<Input
							id={amountField}
							type="number"
							value={fixedAmount}
							onChange={(e) => setFixedAmount(e.target.value)}
							placeholder="0.00"
							disabled={bulkUpdate.isPending}
							className="rounded-none"
						/>
					)}
				</Field>

				<Field orientation="vertical">
					<FieldLabel htmlFor={noteField} className="text-sm">
						Review Note{" "}
						<span className="font-normal text-muted-foreground">
							(optional)
						</span>
					</FieldLabel>
					<Textarea
						id={noteField}
						value={paymentNote}
						onChange={(e) => setPaymentNote(e.target.value)}
						placeholder="Applied to every selected kit..."
						disabled={bulkUpdate.isPending}
						className="min-h-[80px] rounded-none"
					/>
				</Field>
			</FieldGroup>

			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={bulkUpdate.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={bulkUpdate.isPending}
					className="rounded-none"
				>
					{bulkUpdate.isPending
						? `Updating ${kits.length}...`
						: `Update ${kits.length}`}
				</Button>
			</div>
		</form>
	);
}
