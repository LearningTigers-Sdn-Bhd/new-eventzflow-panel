import {
	Calendar,
	Check,
	CreditCard,
	DollarSign,
	FileText,
	Hash,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	User,
} from "lucide-react";
import { IconHeading } from "@/components/admin-ui/icon-heading";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "../../../../lib/utils";
import {
	formatTicketPrice,
	getPaymentStatusColor,
	getPaymentStatusText,
} from "../constants";
import type { PendingTicket } from "../pending-ticket-table-columns";

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
				<Label className="font-medium text-muted-foreground text-xs">
					{label}
				</Label>
				{label === "Status" ? (
					<Badge
						variant={ticket.status === "scanned" ? "default" : "destructive"}
						className={cn(
							"rounded-none font-bold font-mono text-xs uppercase",
							ticket.status === "scanned"
								? "bg-green-500 text-white hover:bg-green-500"
								: "bg-destructive text-white hover:bg-destructive",
						)}
					>
						{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				) : (
					<p className={cn("font-medium text-sm", capitalize && "capitalize")}>
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
				<Label className="font-medium text-muted-foreground text-xs">
					{label}
				</Label>
				{isPaymentStatus ? (
					<Badge variant="secondary" className={statusColor}>
						{getPaymentStatusText(ticket.paymentStatus)}
					</Badge>
				) : (
					<p className="font-medium text-sm">{value}</p>
				)}
			</div>
		</div>
	);
};

export default function PendingTicketViewModal({
	ticket,
}: PendingTicketViewModalProps) {
	const date = new Date(ticket.createdAt);

	return (
		<div className="flex h-full w-full flex-col gap-6 p-0 md:p-4">
			<ScrollArea className="h-[80vh]">
				<div className="grid grid-cols-1 gap-y-8">
					{/* Basic Information */}
					<div className="space-y-4">
						<IconHeading
							icon={FileText}
							title="Pending Ticket Details and Basic Information"
							description="Pending ticket details and basic information about the buyer."
						/>
						<div className="flex flex-col gap-3 px-2">
							<div className="grid grid-cols-2">
								<InfoLabel
									label="Ticket ID"
									value={ticket.id}
									icon={Hash}
									ticket={ticket}
								/>
								<InfoLabel
									label="Status"
									value={ticket.status}
									icon={Check}
									ticket={ticket}
								/>
							</div>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
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
									label="Role"
									value={ticket.role ?? "None"}
									icon={User}
									ticket={ticket}
								/>
							</div>
							{ticket.phone && (
								<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
									<InfoLabel
										label="Phone Number"
										value={ticket.phone}
										icon={Phone}
										ticket={ticket}
									/>
								</div>
							)}
							<div className="grid grid-cols-2">
								<InfoLabel
									label="Ticket Price"
									value={formatTicketPrice(ticket.value)}
									icon={DollarSign}
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
					</div>

					{/* Payment Information */}
					<div className="space-y-4">
						<IconHeading
							icon={CreditCard}
							title="Payment Information"
							description="Payment details for this pending ticket."
						/>
						<div className="grid grid-cols-1 gap-x-4 gap-y-3 px-2 sm:grid-cols-2 md:gap-y-6 md:px-2">
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
						{ticket.customLabels && ticket.customLabels.length > 0 ? (
							<div className="grid grid-cols-1 gap-x-4 gap-y-3 px-2 sm:grid-cols-2 md:gap-y-6 md:px-2">
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
							<EmptyState
								title="No custom labels"
								description="No custom labels have been configured for this event"
								icon={<Info className="size-8" />}
								height="h-auto"
							/>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
