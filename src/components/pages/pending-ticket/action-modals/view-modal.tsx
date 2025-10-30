import {
	Calendar,
	Check,
	CreditCard,
	DollarSign,
	FileText,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	User,
	X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconHeading } from "@/components/ui/icon-heading";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "../../../../lib/utils";
import type { PendingTicket } from "../columns";
import {
	formatTicketPrice,
	getPaymentStatusColor,
	getPaymentStatusText,
} from "../constants";

interface PendingTicketViewModalProps {
	ticket: PendingTicket;
	onClose?: () => void;
}

const InfoLabel = ({
	label,
	value,
	icon: Icon,
	ticket,
	capitalize = false,
}: {
	label: string;
	value: string;
	icon: LucideIcon;
	ticket: PendingTicket;
	capitalize?: boolean;
}) => {
	return (
		<div className="flex items-center gap-2">
			<Icon className="mr-2 size-5" />
			<div>
				<Label className="font-medium text-muted-foreground text-sm">
					{label}
				</Label>
				{label === "Status" ? (
					<Badge
						variant={ticket.status === "scanned" ? "default" : "secondary"}
						className={
							ticket.status === "scanned"
								? "bg-green-500 text-white hover:bg-green-500"
								: "bg-gray-500 text-white hover:bg-gray-500"
						}
					>
						{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				) : (
					<p className={cn("font-medium", capitalize && "capitalize")}>
						{value}
					</p>
				)}
			</div>
		</div>
	);
};

const PaymentInfoLabel = ({
	label,
	value,
	icon: Icon,
	ticket,
}: {
	label: string;
	value: string;
	icon: LucideIcon;
	ticket: PendingTicket;
}) => {
	const isPaymentStatus = label === "Payment Status";
	// Use stronger colors for modal view
	const statusColor = isPaymentStatus
		? getPaymentStatusColor(ticket.paymentStatus)
				.replace("100", "500")
				.replace("800", "white")
		: "";

	return (
		<div className="flex items-center gap-2">
			<Icon className="mr-2 size-5" />
			<div>
				<Label className="font-medium text-muted-foreground text-sm">
					{label}
				</Label>
				{isPaymentStatus ? (
					<Badge variant="secondary" className={statusColor}>
						{getPaymentStatusText(ticket.paymentStatus)}
					</Badge>
				) : (
					<p className="font-medium">{value}</p>
				)}
			</div>
		</div>
	);
};

export default function PendingTicketViewModal({
	ticket,
}: PendingTicketViewModalProps) {
	const { closeDialog } = useDialog();
	const date = new Date(ticket.createdAt);

	const handleClose = () => {
		closeDialog();
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="font-bold text-xl">
				Pending Ticket Details - {ticket.id}
			</div>

			<div className="grid grid-cols-1 gap-y-16">
				{/* Basic Information */}
				<div className="space-y-4">
					<IconHeading
						icon={FileText}
						title="Basic Information"
						description="Basic information about the buyer of the ticket."
					/>
					<Separator className="my-4" />
					<div className="grid grid-cols-2 gap-x-2 gap-y-6">
						<InfoLabel
							label="Name"
							value={ticket.name}
							icon={User}
							ticket={ticket}
						/>
						<InfoLabel
							label="Email"
							value={ticket.email ?? ""}
							icon={Mail}
							ticket={ticket}
						/>
						<InfoLabel
							label="Phone Number"
							value={ticket.phone ?? ""}
							icon={Phone}
							ticket={ticket}
						/>
						<InfoLabel
							label="Ticket Price"
							value={formatTicketPrice(ticket.value)}
							icon={DollarSign}
							ticket={ticket}
						/>
						<InfoLabel
							label="Status"
							value={ticket.status}
							icon={Check}
							ticket={ticket}
						/>
						<InfoLabel
							label="Created At"
							value={date.toLocaleDateString()}
							icon={Calendar}
							ticket={ticket}
						/>
					</div>
				</div>

				{/* Payment Information */}
				<div className="space-y-4">
					<IconHeading
						icon={CreditCard}
						title="Payment Information"
						description="Payment details for this pending ticket."
					/>
					<Separator className="my-4" />
					<div className="grid grid-cols-2 gap-x-2 gap-y-6">
						<PaymentInfoLabel
							label="Payment Status"
							value={ticket.paymentStatus}
							icon={CreditCard}
							ticket={ticket}
						/>
						{ticket.paymentScreenshotUrl && (
							<PaymentInfoLabel
								label="Payment Screenshot URL"
								value={ticket.paymentScreenshotUrl}
								icon={FileText}
								ticket={ticket}
							/>
						)}
						{ticket.transactionId && (
							<PaymentInfoLabel
								label="Transaction ID"
								value={ticket.transactionId}
								icon={FileText}
								ticket={ticket}
							/>
						)}
						{ticket.paymentMethod && (
							<PaymentInfoLabel
								label="Payment Method"
								value={ticket.paymentMethod}
								icon={CreditCard}
								ticket={ticket}
							/>
						)}
					</div>
				</div>

				{/* Custom Labels */}
				<div className="space-y-4">
					<IconHeading
						icon={FileText}
						title="Custom Labels"
						description="Custom labels configured for this event."
					/>
					<Separator className="my-4" />
					{ticket.customLabels.length > 0 ? (
						<div className="grid grid-cols-2 gap-x-2 gap-y-6">
							{ticket.customLabels.map((label, index) => (
								<InfoLabel
									key={`${label.name}-${index}`}
									label={label.name}
									value={label.value}
									icon={Info}
									ticket={ticket}
									capitalize={true}
								/>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							No custom labels have been configured for this event.
						</p>
					)}
				</div>
			</div>

			<div className="mt-16 flex justify-end">
				<Button type="button" onClick={handleClose}>
					<X className="size-4" />
					Close
				</Button>
			</div>
		</div>
	);
}
