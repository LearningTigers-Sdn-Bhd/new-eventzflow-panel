"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	getRfidAttendanceCheck,
	notifyRfidAttendanceCheck,
	type RfidAttendanceCheckGroup,
	type RfidAttendanceCheckReason,
} from "@/lib/api/rfid";
import { cn } from "@/lib/utils";

const GROUPS: {
	reason: RfidAttendanceCheckReason;
	title: string;
	hint: string;
}[] = [
	{
		reason: "never_detected",
		title: "Checked in, not seen at any gate",
		hint: "Registered at the desk but no gate has read them.",
	},
	{
		reason: "outside_during_session",
		title: "Outside during a live session",
		hint: "Seen before, but not inside while a session is running.",
	},
];

function GroupDetails({
	group,
	showSticker,
}: {
	group: RfidAttendanceCheckGroup;
	showSticker: boolean;
}) {
	const skipped = [
		group.no_phone > 0 && `${group.no_phone} with no phone number`,
		group.recently_notified > 0 &&
			`${group.recently_notified} already messaged in the last hour`,
	].filter(Boolean);

	return (
		<div className="space-y-1 text-muted-foreground text-xs">
			<p>
				{group.total} guests in this group
				{skipped.length > 0 && (
					<span className="text-amber-700">
						{" "}
						· skipping {skipped.join(", ")}
					</span>
				)}
			</p>
			{showSticker && (
				<>
					{group.total - group.no_sticker > 0 && (
						<p>
							{group.total - group.no_sticker} have a sticker but no gate read
							it (missed, or the gate was down).
						</p>
					)}
					{group.no_sticker > 0 && (
						<p>
							{group.no_sticker} have no sticker, so no gate could read them.
						</p>
					)}
				</>
			)}
		</div>
	);
}

/**
 * WhatsApp attendance check: fires the event webhook once per reachable guest
 * the gates may have missed. The receiver (SalesCatalyst) sends the message.
 */
export function AttendanceCheckDialog({
	eventId,
	open,
	onOpenChange,
}: {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [chosen, setChosen] = useState<RfidAttendanceCheckReason[]>([
		"never_detected",
	]);
	// null = every ticket type (until the user unticks one).
	const [types, setTypes] = useState<number[] | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "rfid", "attendance-check", types],
		queryFn: () => getRfidAttendanceCheck(eventId, types ?? undefined),
		// An empty selection cannot be sent as a query string; it means "no one".
		enabled: open && types?.length !== 0,
		placeholderData: (previous) => previous,
	});
	const allTypeIds = data?.ticket_types.map((type) => type.id) ?? [];
	const activeTypes = types ?? allTypeIds;

	const mutation = useMutation({
		mutationFn: () => notifyRfidAttendanceCheck(eventId, chosen, activeTypes),
		onSuccess: (result) => {
			toast.success(
				`Sent to ${result.sent} guest${result.sent === 1 ? "" : "s"}.` +
					(result.skipped_no_phone
						? ` ${result.skipped_no_phone} had no phone number.`
						: "") +
					(result.skipped_recent
						? ` ${result.skipped_recent} were messaged recently.`
						: ""),
			);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "rfid", "attendance-check"],
			});
			onOpenChange(false);
		},
		onError: (error) => toast.error(error.message),
	});

	const toSend =
		data && activeTypes.length > 0
			? chosen.reduce((sum, reason) => sum + data.groups[reason].sendable, 0)
			: 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>WhatsApp attendance check</DialogTitle>
					<DialogDescription>
						Reach guests the gates may have missed. They can confirm they are
						inside, or be asked to come back. Staff then add any missed visit
						manually.
					</DialogDescription>
				</DialogHeader>

				{isLoading || !data ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : (
					<div className="space-y-3">
						{!data.webhook_configured && (
							<p className="text-destructive text-sm">
								This event has no webhook URL, so nothing can be sent. Add one
								in event settings.
							</p>
						)}
						{data.ticket_types.length > 1 && (
							<div className="space-y-1.5">
								<div className="flex items-center justify-between gap-2">
									<p className="font-medium text-sm">
										Ticket types{" "}
										<span className="font-normal text-muted-foreground">
											({activeTypes.length} of {data.ticket_types.length})
										</span>
									</p>
									<div className="flex gap-3 text-xs">
										<button
											type="button"
											className="text-primary hover:underline"
											onClick={() => setTypes(null)}
										>
											All
										</button>
										<button
											type="button"
											className="text-primary hover:underline"
											onClick={() => setTypes([])}
										>
											None
										</button>
									</div>
								</div>
								<div className="max-h-36 divide-y overflow-y-auto border">
									{data.ticket_types.map((type) => (
										<label
											key={type.id}
											htmlFor={`attendance-type-${type.id}`}
											className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50"
										>
											<Checkbox
												id={`attendance-type-${type.id}`}
												checked={activeTypes.includes(type.id)}
												onCheckedChange={(checked) =>
													setTypes(
														checked
															? [...activeTypes, type.id]
															: activeTypes.filter((id) => id !== type.id),
													)
												}
											/>
											<span className="min-w-0 truncate" title={type.name}>
												{type.name}
											</span>
										</label>
									))}
								</div>
							</div>
						)}

						<div className="space-y-2">
							{GROUPS.map(({ reason, title, hint }) => {
								const group = data.groups[reason];
								const unavailable =
									reason === "outside_during_session" && !data.live_session;
								const off = unavailable || group.sendable === 0;
								return (
									<label
										key={reason}
										htmlFor={`attendance-check-${reason}`}
										className={cn(
											"flex items-start gap-3 border p-3",
											off ? "opacity-60" : "cursor-pointer",
										)}
									>
										<Checkbox
											id={`attendance-check-${reason}`}
											className="mt-0.5"
											disabled={off}
											checked={chosen.includes(reason)}
											onCheckedChange={(checked) =>
												setChosen((prev) =>
													checked
														? [...prev, reason]
														: prev.filter((item) => item !== reason),
												)
											}
										/>
										<div className="min-w-0 flex-1 space-y-1">
											<div className="flex items-start justify-between gap-3">
												<span className="font-medium text-sm">{title}</span>
												<span className="shrink-0 text-right">
													<span className="block font-bold text-lg tabular-nums leading-5">
														{group.sendable}
													</span>
													<span className="text-muted-foreground text-xs">
														to message
													</span>
												</span>
											</div>
											<p className="text-muted-foreground text-xs">
												{unavailable ? "No session is live right now." : hint}
												{reason === "outside_during_session" &&
													data.live_session &&
													` Live: ${data.live_session.name}.`}
											</p>
											{!unavailable && (
												<GroupDetails
													group={group}
													showSticker={reason === "never_detected"}
												/>
											)}
										</div>
									</label>
								);
							})}
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						disabled={
							!data?.webhook_configured || toSend === 0 || mutation.isPending
						}
						onClick={() => mutation.mutate()}
					>
						{mutation.isPending
							? "Sending…"
							: `Send to ${toSend} guest${toSend === 1 ? "" : "s"}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
