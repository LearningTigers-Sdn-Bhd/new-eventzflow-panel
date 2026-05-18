"use client";

import {
	Calendar,
	DollarSign,
	FileText,
	Handshake,
	Pencil,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import {
	useDeleteEventSponsorship,
	useEventSponsorshipTiers,
} from "@/hooks/use-event-sponsorships";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import EditEventSponsorshipForm from "../forms/edit-event-sponsorship-form";
import AttachmentsView from "./attachments-view";
import ItemsView from "./items-view";
import PaymentsView from "./payments-view";

interface EventSponsorshipDetailViewProps {
	sponsorship: EventSponsorship;
}

export default function EventSponsorshipDetailView({
	sponsorship,
}: EventSponsorshipDetailViewProps) {
	const { openDialog, closeDialog } = useDialog();
	const router = useRouter();
	const deleteMutation = useDeleteEventSponsorship();
	const { data: tiers } = useEventSponsorshipTiers(
		sponsorship.event_id.toString(),
	);

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
			? `This sponsorship has received payments totaling ${
					sponsorship.currency
				} ${Number.parseFloat(sponsorship.received_total || "0").toLocaleString()}.`
			: "";

		openDialog({
			component: DeleteConfirmationDialog,
			props: {
				title: "Delete Sponsorship",
				description: `Are you sure you want to permanently delete this sponsorship? ${warningMessage}`,
				isPending: deleteMutation.isPending,
				onClose: closeDialog,
				onConfirm: () => {
					deleteMutation.mutate(
						{
							eventId: sponsorship.event_id.toString(),
							id: sponsorship.id.toString(),
						},
						{
							onSuccess: () => {
								toast.success("Sponsorship deleted successfully");
								closeDialog();
								router.push(`/event/${sponsorship.event_id}/sponsorships`);
							},
							onError: (error: any) => {
								toast.error(error.message || "Failed to delete sponsorship");
								closeDialog();
							},
						},
					);
				},
			},
			config: {
				showCloseButton: false,
			},
		});
	};

	const total = Number.parseFloat(sponsorship.total_sponsor_amount || "0");
	const received = Number.parseFloat(sponsorship.received_total || "0");
	const percent =
		total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;

	const status = sponsorship.status;
	let variant: "default" | "secondary" | "destructive" | "outline" =
		"secondary";
	let badgeClassName = "capitalize";

	if (status === "received") {
		variant = "default";
		badgeClassName += " bg-emerald-600 hover:bg-emerald-700";
	} else if (status === "partially_received") {
		variant = "secondary";
		badgeClassName += " bg-amber-100 text-amber-800 hover:bg-amber-200";
	} else if (status === "cancelled") {
		variant = "destructive";
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="font-bold text-2xl tracking-tight">
							{sponsorship.title}
						</h1>
						<Badge variant={variant} className={badgeClassName}>
							{status.replace("_", " ")}
						</Badge>
					</div>
					<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
						<Handshake className="size-4" />
						<span>{sponsorship.sponsor?.name}</span>
						{sponsorship.tier_name_snapshot && (
							<>
								<span>•</span>
								<span>{sponsorship.tier_name_snapshot}</span>
							</>
						)}
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleEdit}>
						<Pencil className="mr-2 size-4" />
						Edit
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						<Trash2 className="mr-2 size-4" />
						Delete
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Main Info */}
				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Financial Overview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<span className="text-muted-foreground text-sm">
										Total Sponsor Amount
									</span>
									<div className="font-bold text-2xl">
										{sponsorship.currency} {total.toLocaleString()}
									</div>
								</div>
								<div className="space-y-1">
									<span className="text-muted-foreground text-sm">
										Received
									</span>
									<div className="font-bold text-2xl text-emerald-600">
										{sponsorship.currency} {received.toLocaleString()}
									</div>
								</div>
							</div>

							<div className="space-y-1">
								<div className="flex justify-between text-xs">
									<span>Progress</span>
									<span>{percent}%</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
									<div
										className="h-full bg-primary transition-all"
										style={{ width: `${percent}%` }}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Conditional Views based on type */}
					{(sponsorship.sponsorship_type === "monetary" ||
						sponsorship.sponsorship_type === "mixed") && (
						<PaymentsView sponsorship={sponsorship} />
					)}

					{(sponsorship.sponsorship_type === "in_kind" ||
						sponsorship.sponsorship_type === "mixed") && (
						<ItemsView sponsorship={sponsorship} />
					)}

					<AttachmentsView sponsorship={sponsorship} />
				</div>

				{/* Sidebar Info */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Contact Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="grid gap-1">
								<span className="text-muted-foreground">Contact Person</span>
								<span className="font-medium">
									{sponsorship.contact_name || "-"}
								</span>
							</div>
							<div className="grid gap-1">
								<span className="text-muted-foreground">Email</span>
								<span className="truncate font-medium">
									{sponsorship.contact_email || "-"}
								</span>
							</div>
							<div className="grid gap-1">
								<span className="text-muted-foreground">Phone</span>
								<span className="font-medium">
									{sponsorship.contact_whatsapp || "-"}
								</span>
							</div>
						</CardContent>
					</Card>

					{sponsorship.description && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Notes</CardTitle>
							</CardHeader>
							<CardContent className="text-muted-foreground text-sm">
								{sponsorship.description}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
