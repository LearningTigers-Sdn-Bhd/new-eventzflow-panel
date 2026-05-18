"use client";

import { format } from "date-fns";
import { DollarSign, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDialog } from "@/hooks/use-dialog";
import { useEventSponsorshipPayments } from "@/hooks/use-event-sponsorships";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import AddPaymentForm from "../forms/add-payment-form";
import EditEventSponsorshipPaymentForm from "../forms/edit-event-sponsorship-payment-form";

interface PaymentsViewProps {
	sponsorship: EventSponsorship;
}

export default function PaymentsView({ sponsorship }: PaymentsViewProps) {
	const { openDialog, closeDialog } = useDialog();
	const { data: payments, isLoading } = useEventSponsorshipPayments(
		sponsorship.id.toString(),
	);

	const handleAddPayment = () => {
		openDialog({
			component: AddPaymentForm,
			props: {
				sponsorship,
				onClose: closeDialog,
			},
			config: {
				title: "Add Payment",
				description: "Record a received payment",
				size: "lg",
				showCloseButton: true,
			},
		});
	};

	const handleEditPayment = (payment: any) => {
		openDialog({
			component: EditEventSponsorshipPaymentForm,
			props: {
				sponsorship,
				payment,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Payment",
				description: "Update payment details",
				size: "lg",
				showCloseButton: true,
			},
		});
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2 text-base">
					<DollarSign className="size-4" />
					Payments
				</CardTitle>
				<Button size="sm" variant="outline" onClick={handleAddPayment}>
					<Plus className="mr-2 size-4" />
					Add Payment
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="text-muted-foreground text-sm">
						Loading payments...
					</div>
				) : !payments?.length ? (
					<div className="py-4 text-center text-muted-foreground text-sm">
						No payments recorded.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Method</TableHead>
								<TableHead>Ref</TableHead>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.map((payment) => (
								<TableRow key={payment.id} className="group">
									<TableCell>
										{format(new Date(payment.received_at), "dd MMM yyyy")}
									</TableCell>
									<TableCell className="font-medium">
										{payment.currency}{" "}
										{Number.parseFloat(payment.amount).toLocaleString()}
									</TableCell>
									<TableCell className="capitalize">
										{payment.method.replace("_", " ")}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{payment.reference_no || "-"}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
											onClick={() => handleEditPayment(payment)}
										>
											<Pencil className="size-3.5 text-muted-foreground" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
