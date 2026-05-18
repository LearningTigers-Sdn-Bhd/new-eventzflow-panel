"use client";

import { Eye, Handshake, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import {
	useDeleteEventSponsorship,
	useEventSponsorshipTiers,
} from "@/hooks/use-event-sponsorships";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import EditEventSponsorshipForm from "../forms/edit-event-sponsorship-form";

interface SponsorshipCardProps {
	sponsorship: EventSponsorship;
}

export function SponsorshipCard({ sponsorship }: SponsorshipCardProps) {
	const { openDialog, closeDialog } = useDialog();
	const deleteMutation = useDeleteEventSponsorship();
	const { data: tiers } = useEventSponsorshipTiers(
		sponsorship.event_id.toString(),
	);

	const handleView = () => {
		window.open(
			`/event/${sponsorship.event_id}/sponsorships/${sponsorship.id}`,
			"_blank",
		);
	};

	const handleEdit = () => {
		openDialog({
			component: EditEventSponsorshipForm,
			props: {
				eventId: sponsorship.event_id.toString(),
				sponsorship,
				tiers: tiers || [],
				onClose: closeDialog,
			},
			config: {
				title: "Edit Sponsorship",
				description: "Update sponsorship details",
				size: "2xl",
				showCloseButton: true,
			},
		});
	};

	const handleDelete = () => {
		const hasPayments =
			Number.parseFloat(sponsorship.received_total || "0") > 0;
		const warningMessage = hasPayments
			? `Warning: This sponsorship has received payments totaling ${sponsorship.currency} ${Number.parseFloat(sponsorship.received_total || "0").toLocaleString()}.

Archiving it will hide it and its related payments from active views. Are you sure?`
			: "Are you sure you want to archive this sponsorship?";

		if (confirm(warningMessage)) {
			deleteMutation.mutate(
				{
					eventId: sponsorship.event_id.toString(),
					id: sponsorship.id.toString(),
				},
				{
					onSuccess: () => toast.success("Sponsorship archived successfully"),
					onError: () => toast.error("Failed to archive sponsorship"),
				},
			);
		}
	};

	const status = sponsorship.status;
	let variant: "default" | "secondary" | "destructive" | "outline" =
		"secondary";
	let badgeClassName = "capitalize px-1.5 py-0 h-5 text-[10px]";

	if (status === "received") {
		variant = "default";
		badgeClassName += " bg-emerald-600 hover:bg-emerald-700";
	} else if (status === "partially_received") {
		variant = "secondary";
		badgeClassName += " bg-amber-100 text-amber-800 hover:bg-amber-200";
	} else if (status === "cancelled") {
		variant = "destructive";
	}

	const total = Number.parseFloat(sponsorship.total_sponsor_amount || "0");
	const received = Number.parseFloat(sponsorship.received_total || "0");
	const percent =
		total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;

	return (
		<Card className="group transition-shadow hover:shadow-md">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-normal break-words">
						<a
							href={`/event/${sponsorship.event_id}/sponsorships/${sponsorship.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className="line-clamp-2 font-semibold text-primary text-sm hover:underline"
						>
							{sponsorship.title}
						</a>
						<div className="flex w-full items-start gap-1.5 text-muted-foreground text-xs">
							<Handshake className="mt-0.5 size-3 shrink-0" />
							<span>{sponsorship.sponsor?.name}</span>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleView}>
								<Eye className="mr-2 h-3 w-3" />
								View
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleEdit}>
								<Pencil className="mr-2 h-3 w-3" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-3 w-3" />
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex items-center justify-between text-xs">
					<Badge variant={variant} className={badgeClassName}>
						{status.replace("_", " ")}
					</Badge>
					<span className="font-medium">
						{sponsorship.currency} {total.toLocaleString()}
					</span>
				</div>

				{total > 0 && (
					<div className="space-y-1">
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
							<div
								className="h-full bg-primary transition-all"
								style={{ width: `${percent}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] text-muted-foreground">
							<span>{percent}% Paid</span>
							<span>Received: {received.toLocaleString()}</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
