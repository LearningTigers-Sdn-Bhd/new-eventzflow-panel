import {
	AlertCircle,
	Check,
	Clock,
	CreditCard,
	DollarSign,
	FileText,
	Hash,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	Tag,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../../../lib/utils";
import {
	formatTicketPrice,
	getPaymentStatusColor,
	getPaymentStatusText,
	getReviewStatusColor,
	getReviewStatusText,
	getRsvpStatusColor,
	getRsvpStatusText,
} from "../constants";
import type { PendingTicket } from "../pending-ticket-table-columns";

interface PendingTicketViewModalProps {
	ticket: PendingTicket;
	onClose?: () => void;
}

const InfoItem = ({
	label,
	value,
	icon: Icon,
	capitalize = false,
	className,
	children,
}: {
	label: string;
	value?: string;
	icon: LucideIcon;
	capitalize?: boolean;
	className?: string;
	children?: React.ReactNode;
}) => {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="size-3.5" />
				<span className="font-medium text-[10px] uppercase tracking-wider">
					{label}
				</span>
			</div>
			{children ? (
				children
			) : (
				<p
					className={cn(
						"font-semibold text-sm leading-tight",
						capitalize && "capitalize",
					)}
				>
					{value || "-"}
				</p>
			)}
		</div>
	);
};

export default function PendingTicketViewModal({
	ticket,
}: PendingTicketViewModalProps) {
	const date = new Date(ticket.createdAt);

	return (
		<div className="flex h-full w-full flex-col gap-0 p-0">
			<ScrollArea className="max-h-[85vh]">
				<div className="flex flex-col gap-6 p-6">
					{/* Header Status Section */}
					<div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Hash className="size-4 text-muted-foreground" />
								<span className="font-mono font-semibold text-lg">
									{ticket.id}
								</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Created on {date.toLocaleDateString()} at{" "}
								{date.toLocaleTimeString()}
							</p>
						</div>
						<div className="flex gap-2">
							<Badge
								variant="outline"
								className={cn(
									"rounded-none border-2 px-4 py-1.5 font-bold font-mono text-xs uppercase tracking-widest",
									ticket.status === "scanned"
										? "border-green-500 text-green-600"
										: "border-amber-500 text-amber-600",
								)}
							>
								{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
							</Badge>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Buyer Information Card */}
						<Card className="gap-0 rounded-none border-2 p-0 shadow-none transition-colors hover:border-primary/50">
							<div className="border-b-2 bg-muted px-4 py-3">
								<h3 className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
									<User className="size-4" />
									Buyer Information
								</h3>
							</div>
							<CardContent className="grid gap-6 p-6">
								<InfoItem
									label="Full Name"
									value={ticket.name}
									icon={User}
									capitalize
								/>
								<InfoItem
									label="Email Address"
									value={ticket.email || "No email provided"}
									icon={Mail}
								/>
								<InfoItem
									label="Role"
									value={ticket.role || "None"}
									icon={User}
								/>
								<InfoItem
									label="Phone Number"
									value={ticket.phone || "No phone provided"}
									icon={Phone}
								/>
							</CardContent>
						</Card>

						{/* Payment Information Card */}
						<Card className="gap-0 rounded-none border-2 border-primary/30 bg-primary/5 p-0 shadow-none transition-colors hover:border-primary/50">
							<div className="border-primary/30 border-b-2 bg-primary/20 px-4 py-3">
								<h3 className="flex items-center gap-2 font-bold text-primary text-xs uppercase tracking-wider">
									<CreditCard className="size-4" />
									Payment Details
								</h3>
							</div>
							<CardContent className="grid gap-6 p-6">
								<InfoItem label="Review Status" icon={Check}>
									<Badge
										className={cn(
											"w-fit rounded-none font-bold",
											getReviewStatusColor(
												ticket.ticketApplication?.reviewStatus,
											),
										)}
									>
										{getReviewStatusText(
											ticket.ticketApplication?.reviewStatus,
										)}
									</Badge>
								</InfoItem>
								<InfoItem label="RSVP Status" icon={Tag}>
									<Badge
										className={cn(
											"w-fit rounded-none font-bold",
											getRsvpStatusColor(ticket.ticketApplication?.rsvpStatus),
										)}
									>
										{getRsvpStatusText(ticket.ticketApplication?.rsvpStatus)}
									</Badge>
								</InfoItem>
								{ticket.ticketApplication?.rejectionReason && (
									<InfoItem
										label="Rejection Reason"
										value={ticket.ticketApplication.rejectionReason}
										icon={AlertCircle}
									/>
								)}
								{ticket.ticketApplication?.rsvpExpiresAt && (
									<InfoItem
										label="RSVP Expires At"
										value={new Date(
											ticket.ticketApplication.rsvpExpiresAt,
										).toLocaleString()}
										icon={Clock}
									/>
								)}
								<InfoItem label="Payment Status" icon={AlertCircle}>
									<Badge
										className={cn(
											"w-fit rounded-none font-bold",
											getPaymentStatusColor(ticket.paymentStatus),
										)}
									>
										{getPaymentStatusText(ticket.paymentStatus)}
									</Badge>
								</InfoItem>
								<InfoItem
									label="Ticket Price"
									value={formatTicketPrice(ticket.value)}
									icon={DollarSign}
								/>
								<InfoItem
									label="Payment Method"
									value={ticket.paymentMethod || "Not specified"}
									icon={CreditCard}
								/>
								{ticket.transactionId && (
									<InfoItem
										label="Transaction ID"
										value={ticket.transactionId}
										icon={FileText}
									/>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Custom Information Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Info className="size-4 text-primary" />
							<h3 className="font-bold text-sm uppercase tracking-tight">
								Additional Information
							</h3>
						</div>
						<Separator />

						{ticket.customLabels && ticket.customLabels.length > 0 ? (
							<Card className="rounded-none border-2 border-dashed p-0 shadow-none">
								<CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
									{ticket.customLabels.map((label, index) => (
										<InfoItem
											key={`${label.name}-${index}`}
											label={
												label.name.includes("_")
													? label.name
															.replace(/_/g, " ")
															.replace(/\b\w/g, (c) => c.toUpperCase())
													: label.name
											}
											value={label.value}
											icon={Info}
											capitalize={true}
										/>
									))}
								</CardContent>
							</Card>
						) : (
							<div className="flex flex-col items-center justify-center rounded-none border border-dashed p-8 text-center">
								<Info className="mb-2 size-8 text-muted-foreground/50" />
								<p className="font-medium text-muted-foreground text-sm">
									No custom fields found for this ticket.
								</p>
							</div>
						)}
					</div>

					{ticket.paymentScreenshotUrl && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<FileText className="size-4 text-primary" />
								<h3 className="font-bold text-sm uppercase tracking-tight">
									Payment Proof
								</h3>
							</div>
							<Separator />
							<div className="relative aspect-video w-full overflow-hidden rounded-none border bg-muted">
								<img
									src={ticket.paymentScreenshotUrl}
									alt="Payment Screenshot"
									className="h-full w-full object-contain"
								/>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
