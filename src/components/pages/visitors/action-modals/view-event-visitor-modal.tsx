"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Hash,
	Info,
	type LucideIcon,
	Mail,
	Phone,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getEventById } from "@/lib/api/event";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import { buildVisitorLabelsData } from "../wedding-custom-field";

interface VisitorViewModalProps {
	visitor: Visitor;
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

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	const labelsData = buildVisitorLabelsData(eventData);

	const customLabels =
		Object.keys(labelsData).length > 0
			? Object.entries(labelsData).map(([key, labelName]) => {
					const rawValue = visitor.custom_fields_data?.[key];
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
									{visitor.public_id}
								</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Registered on {createdDate.toLocaleDateString()} at{" "}
								{createdDate.toLocaleTimeString()}
							</p>
						</div>
						<Badge
							variant={visitor.checked_in ? "default" : "destructive"}
							className={cn(
								"w-fit rounded-none px-4 py-1.5 font-bold font-mono text-xs uppercase tracking-widest",
								visitor.checked_in
									? "bg-green-500 text-white hover:bg-green-600"
									: "bg-amber-500 text-white hover:bg-amber-600",
							)}
						>
							{visitor.checked_in ? "Visitor Scanned" : "Not Scanned Yet"}
						</Badge>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Visitor Information Card */}
						<Card className="gap-0 rounded-none border-2 p-0 shadow-none transition-colors hover:border-primary/50">
							<div className="border-b-2 bg-muted px-4 py-3">
								<h3 className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
									<Users className="size-4" />
									Visitor Information
								</h3>
							</div>
							<CardContent className="grid gap-6 p-6">
								<InfoItem
									label="Full Name"
									value={visitor.full_name}
									icon={Users}
									capitalize
								/>
								<InfoItem
									label="Gender"
									value={formatGender(visitor.gender)}
									icon={Users}
								/>
								<InfoItem
									label="Age"
									value={
										visitor.age ? `${visitor.age} years old` : "Not provided"
									}
									icon={Calendar}
								/>
							</CardContent>
						</Card>

						{/* Contact Information Card */}
						<Card className="gap-0 rounded-none border-2 p-0 shadow-none transition-colors hover:border-primary/50">
							<div className="border-b-2 bg-muted px-4 py-3">
								<h3 className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
									<Mail className="size-4" />
									Contact Details
								</h3>
							</div>
							<CardContent className="grid gap-6 p-6">
								<InfoItem
									label="Email Address"
									value={visitor.email || "No email provided"}
									icon={Mail}
								/>
								<InfoItem
									label="Phone Number"
									value={visitor.phone || "No phone provided"}
									icon={Phone}
								/>
								<InfoItem
									label="Registration Date"
									value={createdDate.toLocaleDateString(undefined, {
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
									No custom fields found for this visitor.
								</p>
							</div>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
