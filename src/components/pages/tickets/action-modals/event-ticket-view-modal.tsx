import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Check,
	Clock,
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
import { useParams } from "next/navigation";
import * as React from "react";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getEventById } from "@/lib/api/event";
import { cn } from "../../../../lib/utils";
import type { BaseTicket } from "../event-ticket-table-columns";

interface TicketViewModalProps {
	ticket: BaseTicket;
	onClose?: () => void;
}

const InfoItem = ({
	label,
	value,
	icon: Icon,
	capitalize = false,
	className,
}: {
	label: string;
	value: string;
	icon: LucideIcon;
	capitalize?: boolean;
	className?: string;
}) => {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="size-3.5" />
				<span className="font-medium text-[10px] uppercase tracking-wider">
					{label}
				</span>
			</div>
			<p
				className={cn(
					"font-semibold text-sm leading-tight",
					capitalize && "capitalize",
				)}
			>
				{value || "-"}
			</p>
		</div>
	);
};

export default function TicketViewModal({ ticket }: TicketViewModalProps) {
	const date = new Date(ticket.createdAt);
	const params = useParams();
	const eventId = params.event_id as string;

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Merge event labels_data with any custom labels injected directly into the ticket
	const mergedLabelsMap = React.useMemo(() => {
		const map: Record<string, string> = { ...(eventData?.labels_data ?? {}) };
		ticket.customLabels?.forEach(({ name }) => {
			if (!(name in map)) {
				// Prettify raw key: ic_no -> Ic No, t_shirt_size -> T Shirt Size
				map[name] = name
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());
			}
		});
		return map;
	}, [eventData?.labels_data, ticket.customLabels]);

	const customLabels =
		Object.keys(mergedLabelsMap).length > 0
			? Object.entries(mergedLabelsMap).map(([key, labelName]) => {
					const rawValue = ticket.customLabels?.find(
						(l) => l.name === key,
					)?.value;
					return {
						name: labelName as string,
						value: typeof rawValue === "string" ? rawValue : "",
					};
				})
			: [];

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
									{ticket.publicId}
								</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Registered on {date.toLocaleDateString()} at{" "}
								{date.toLocaleTimeString()}
							</p>
						</div>
						<Badge
							variant={ticket.status === "scanned" ? "default" : "destructive"}
							className={cn(
								"w-fit rounded-none px-4 py-1.5 font-bold font-mono text-xs uppercase tracking-widest",
								ticket.status === "scanned"
									? "bg-green-500 text-white hover:bg-green-600"
									: "bg-amber-500 text-white hover:bg-amber-600",
							)}
						>
							{ticket.status === "scanned"
								? "Ticket Scanned"
								: "Not Scanned Yet"}
						</Badge>
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
									label="Phone Number"
									value={ticket.phone || "No phone provided"}
									icon={Phone}
								/>
							</CardContent>
						</Card>

						{/* Ticket Information Card */}
						<Card className="gap-0 rounded-none border-2 p-0 shadow-none transition-colors hover:border-primary/50">
							<div className="border-b-2 bg-muted px-4 py-3">
								<h3 className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
									<Tag className="size-4" />
									Ticket Details
								</h3>
							</div>
							<CardContent className="grid gap-6 p-6">
								<InfoItem
									label="Ticket Type"
									value={ticket.ticketTypeName || "Standard"}
									icon={FileText}
								/>
								<InfoItem
									label="Price"
									value={`RM${(typeof ticket.value === "number" ? ticket.value : Number.parseFloat(ticket.value as string) || 0).toFixed(2)}`}
									icon={DollarSign}
								/>
								<InfoItem
									label="Purchase Date"
									value={date.toLocaleDateString(undefined, {
										dateStyle: "long",
									})}
									icon={Calendar}
								/>
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

						{customLabels.length > 0 ? (
							<Card className="rounded-none border-2 border-dashed p-0 shadow-none">
								<CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
									{customLabels.map((label, index) => (
										<InfoItem
											key={`${label.name}-${index}`}
											label={label.name}
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
				</div>
			</ScrollArea>
		</div>
	);
}
