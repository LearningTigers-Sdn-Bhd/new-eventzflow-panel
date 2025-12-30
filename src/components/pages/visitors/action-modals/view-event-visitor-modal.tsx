"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Clock,
	Hash,
	Info,
	Mail,
	Phone,
	Tag,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEventById } from "@/lib/api/event";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";

interface VisitorViewModalProps {
	visitor: Visitor;
}

const formatGender = (gender?: string) => {
	if (!gender) return "Not provided";
	const genderMap: Record<string, string> = {
		male: "Male",
		female: "Female",
		other: "Other",
		prefer_not_to_say: "Prefer not to say",
	};
	return genderMap[gender] || gender;
};

export default function ViewEventVisitorModal({
	visitor,
}: VisitorViewModalProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const createdDate = new Date(visitor.created_at);
	const updatedDate = new Date(visitor.updated_at);

	// Fetch event details to get labels_data for custom fields
	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	// Prepare custom labels
	const customLabels =
		eventData?.labels_data && Object.keys(eventData.labels_data).length > 0
			? Object.entries(eventData.labels_data).map(([key, labelName]) => {
					const rawValue = visitor.custom_fields_data?.[key];
					return {
						name: labelName as string,
						value: typeof rawValue === "string" ? rawValue : "",
					};
				})
			: [];

	return (
		<ScrollArea className="h-[80vh]">
			<div className="flex flex-col gap-0">
				{/* Header Section with QR Code */}
				<div className="flex flex-col items-center gap-4 border-b border-dashed p-6 md:flex-row md:items-start">
					{/* QR Code */}
					<div className="shrink-0 border bg-white p-3">
						<QRCode value={visitor.public_id} size={120} />
					</div>

					{/* Basic Info */}
					<div className="flex flex-1 flex-col items-center gap-2 md:items-start">
						<div className="space-y-1 text-center md:text-left">
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
								Visitor
							</p>
							<h2 className="font-bold text-2xl tracking-tight">
								{visitor.full_name}
							</h2>
						</div>
						<Badge variant="outline" className="rounded-none font-mono text-xs">
							<Hash className="mr-1 h-3 w-3" />
							{visitor.public_id}
						</Badge>
						{(visitor.gender || visitor.age) && (
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Users className="h-4 w-4" />
								<span>
									{formatGender(visitor.gender)}
									{visitor.age && ` - ${visitor.age} years old`}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Contact Information */}
				<div className="border-b border-dashed p-6">
					<p className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
						Contact Information
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-muted-foreground text-xs uppercase">
									Email
								</p>
								<p
									className={cn(
										"truncate text-sm",
										!visitor.email && "text-muted-foreground/60 italic",
									)}
								>
									{visitor.email || "Not provided"}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-muted-foreground text-xs uppercase">
									Phone
								</p>
								<p
									className={cn(
										"truncate text-sm",
										!visitor.phone && "text-muted-foreground/60 italic",
									)}
								>
									{visitor.phone || "Not provided"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Custom Labels Section */}
				{customLabels.length > 0 && (
					<div className="border-b border-dashed p-6">
						<p className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
							Additional Information
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{customLabels.map((label, index) => (
								<div
									key={`${label.name}-${index}`}
									className="flex items-start gap-3"
								>
									<Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-muted-foreground text-xs uppercase">
											{label.name}
										</p>
										<p
											className={cn(
												"text-sm",
												!label.value && "text-muted-foreground/60 italic",
											)}
										>
											{label.value || "Not provided"}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{customLabels.length === 0 &&
					eventData?.labels_data &&
					Object.keys(eventData.labels_data).length === 0 && (
						<div className="border-b border-dashed p-6">
							<p className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
								Additional Information
							</p>
							<EmptyState
								title="No custom labels"
								description="No custom labels have been configured for this event."
								icon={<Info className="size-8" />}
								height="h-auto"
							/>
						</div>
					)}

				{/* Timestamps */}
				<div className="bg-muted/30 p-6">
					<p className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
						Record Information
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div>
								<p className="font-medium text-muted-foreground text-xs uppercase">
									Created At
								</p>
								<p className="text-sm">
									{createdDate.toLocaleDateString("en-US", {
										dateStyle: "medium",
									})}
								</p>
								<p className="text-muted-foreground text-xs">
									{createdDate.toLocaleTimeString("en-US", {
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div>
								<p className="font-medium text-muted-foreground text-xs uppercase">
									Last Updated
								</p>
								<p className="text-sm">
									{updatedDate.toLocaleDateString("en-US", {
										dateStyle: "medium",
									})}
								</p>
								<p className="text-muted-foreground text-xs">
									{updatedDate.toLocaleTimeString("en-US", {
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
