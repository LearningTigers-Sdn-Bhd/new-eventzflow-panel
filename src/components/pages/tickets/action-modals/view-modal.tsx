import {
	Calendar,
	Check,
	DollarSign,
	FileText,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	User,
} from "lucide-react";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconHeading } from "@/components/ui/icon-heading";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "../../../../lib/utils";
import type { BaseTicket } from "../columns";

interface TicketViewModalProps {
	ticket: BaseTicket;
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
	ticket: BaseTicket;
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

export default function TicketViewModal({ ticket }: TicketViewModalProps) {
	const { closeDialog } = useDialog();
	const date = new Date(ticket.createdAt);

	const handleClose = () => {
		closeDialog();
	};

	return (
		<div className="flex flex-col gap-6 md:h-[80vh] w-full max-w-4xl mx-auto">
			{/* Header with Ticket ID */}
			<div className="flex items-center justify-between pb-4 border-b">
				<div>
					<h2 className="font-bold text-2xl">Ticket Details</h2>
					<p className="text-muted-foreground text-sm mt-1">ID: {ticket.id}</p>
				</div>
				<Badge
					variant={ticket.status === "scanned" ? "default" : "secondary"}
					className={cn(
						"text-sm px-4 py-2",
						ticket.status === "scanned"
							? "bg-green-500 text-white hover:bg-green-500"
							: "bg-gray-500 text-white hover:bg-gray-500",
					)}
				>
					{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
				</Badge>
			</div>
			<ScrollArea className="h-[60vh] w-full pe-6">
				<div className="grid grid-cols-1 gap-y-8">
					{/* Basic Information */}
					<div className="space-y-4">
						<IconHeading
							icon={FileText}
							title="Basic Information"
							description="Basic information about the buyer of the ticket."
						/>
						<Separator className="my-4" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
							<InfoLabel
								label="Name"
								value={ticket.name}
								icon={User}
								ticket={ticket}
							/>
							<InfoLabel
								label="Email"
								value={ticket.email}
								icon={Mail}
								ticket={ticket}
							/>
							{ticket.phone && (
								<InfoLabel
									label="Phone Number"
									value={ticket.phone}
									icon={Phone}
									ticket={ticket}
								/>
							)}
							{ticket.ticketTypeName && (
								<InfoLabel
									label="Ticket Type"
									value={ticket.ticketTypeName}
									icon={FileText}
									ticket={ticket}
								/>
							)}
							<InfoLabel
								label="Ticket Price"
								value={`RM${(typeof ticket.value === "number" ? ticket.value : parseFloat(ticket.value as string) || 0).toFixed(2)}`}
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

					{/* Additional Information - Custom Labels */}
					<div className="space-y-4">
						<IconHeading
							icon={FileText}
							title="Custom Labels"
							description="Custom labels configured for this event."
						/>
						<Separator className="my-4" />
						{ticket.customLabels && ticket.customLabels.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
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

			<div className="flex justify-end gap-2 pt-4 border-t">
				<Button type="button" variant="outline" onClick={handleClose}>
					Close
				</Button>
			</div>
		</div>
	);
}
