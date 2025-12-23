"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	FileText,
	Hash,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	User,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { IconHeading } from "@/components/admin-ui/icon-heading";
import { EmptyState } from "@/components/data-state";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEventById } from "@/lib/api/event";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";

interface VisitorViewModalProps {
	visitor: Visitor;
}

const InfoLabel = ({
	label,
	value,
	icon: Icon,
	capitalize = false,
}: {
	label: string;
	value: string | number;
	icon: LucideIcon;
	capitalize?: boolean;
}) => {
	return (
		<div className="flex items-center gap-2">
			<Icon className="mr-2 size-5" />
			<div>
				<Label className="font-medium text-muted-foreground text-xs">
					{label}
				</Label>
				<p className={cn("font-medium text-sm", capitalize && "capitalize")}>
					{value || "Not provided"}
				</p>
			</div>
		</div>
	);
};

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
		eventData?.labels_data && visitor.custom_fields_data
			? Object.entries(eventData.labels_data).map(([key, labelName]) => ({
					name: labelName as string,
					value: visitor.custom_fields_data?.[key] || "Not provided",
				}))
			: [];

	return (
		<div className="flex h-full w-full flex-col gap-6 p-0 md:p-4">
			<ScrollArea className="h-[80vh]">
				<div className="grid grid-cols-1 gap-y-8">
					{/* Basic Information */}
					<div className="space-y-4">
						<IconHeading
							icon={FileText}
							title="Visitor Details and Basic Information"
							description="Personal details and basic information about the visitor."
						/>
						<div className="flex flex-col gap-3 px-2">
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
								<InfoLabel
									label="Full Name"
									value={visitor.full_name}
									icon={User}
								/>
								<InfoLabel
									label="Public ID"
									value={visitor.public_id}
									icon={Hash}
								/>
							</div>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
								<InfoLabel
									label="Email"
									value={visitor.email || ""}
									icon={Mail}
								/>
								<InfoLabel
									label="Phone Number"
									value={visitor.phone || ""}
									icon={Phone}
								/>
							</div>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
								<InfoLabel
									label="Gender"
									value={formatGender(visitor.gender)}
									icon={Users}
									capitalize
								/>
								<InfoLabel
									label="Age"
									value={visitor.age ? `${visitor.age} years old` : ""}
									icon={Users}
								/>
							</div>
							<div className="grid grid-cols-2">
								<InfoLabel
									label="Created At"
									value={`${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`}
									icon={Calendar}
								/>
								<InfoLabel
									label="Last Updated"
									value={`${updatedDate.toLocaleDateString()} at ${updatedDate.toLocaleTimeString()}`}
									icon={Calendar}
								/>
							</div>
						</div>
					</div>

					{/* Additional Information - Custom Labels */}
					<div className="space-y-4">
						<IconHeading
							icon={Info}
							title="Custom Labels"
							description="Custom labels configured for this event."
						/>
						{customLabels.length > 0 ? (
							<div className="grid grid-cols-1 gap-x-4 gap-y-3 px-2 sm:grid-cols-2 md:gap-y-6 md:px-2">
								{customLabels.map((label, index) => (
									<InfoLabel
										key={`${label.name}-${index}`}
										label={label.name}
										value={label.value}
										icon={Info}
										capitalize={true}
									/>
								))}
							</div>
						) : (
							<EmptyState
								title="No custom labels"
								description="No custom labels have been configured for this event or no data provided."
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
