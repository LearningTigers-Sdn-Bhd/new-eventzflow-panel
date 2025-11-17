"use client";

import {
	Calendar,
	FileText,
	Mail,
	Phone,
	User,
	Users,
	Hash,
	type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconHeading } from "@/components/ui/icon-heading";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import type { Visitor } from "@/lib/api/visitor";

interface VisitorViewModalProps {
	visitor: Visitor;
}

const InfoLabel = ({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string | number;
	icon: LucideIcon;
}) => {
	return (
		<div className="flex items-start gap-3">
			<Icon className="mt-0.5 size-5 text-muted-foreground" />
			<div className="flex-1">
				<Label className="font-medium text-muted-foreground text-sm">
					{label}
				</Label>
				<p className="mt-1 font-medium">{value || "Not provided"}</p>
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

export default function VisitorViewModal({ visitor }: VisitorViewModalProps) {
	const { closeDialog } = useDialog();
	const createdDate = new Date(visitor.created_at);
	const updatedDate = new Date(visitor.updated_at);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 md:h-[80vh]">
			{/* Header with Visitor Name */}
			<div className="flex items-start justify-between border-b pb-4">
				<div>
					<h2 className="font-bold text-2xl">{visitor.full_name}</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						ID: {visitor.public_id}
					</p>
				</div>
				<Badge variant="secondary" className="px-4 py-2 text-sm">
					Visitor
				</Badge>
			</div>

			<ScrollArea className="h-[60vh] w-full pe-6">
				<div className="grid grid-cols-1 gap-y-8">
					{/* Basic Information */}
					<div className="space-y-4">
						<IconHeading
							icon={FileText}
							title="Basic Information"
							description="Personal details of the visitor"
						/>
						<Separator className="my-4" />
						<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
							<InfoLabel label="Full Name" value={visitor.full_name} icon={User} />
							<InfoLabel
								label="Email"
								value={visitor.email || "Not provided"}
								icon={Mail}
							/>
							<InfoLabel
								label="Phone Number"
								value={visitor.phone || "Not provided"}
								icon={Phone}
							/>
							<InfoLabel
								label="Public ID"
								value={visitor.public_id}
								icon={Hash}
							/>
							{visitor.gender && (
								<InfoLabel
									label="Gender"
									value={formatGender(visitor.gender)}
									icon={Users}
								/>
							)}
							{visitor.age && (
								<InfoLabel
									label="Age"
									value={`${visitor.age} years old`}
									icon={Users}
								/>
							)}
						</div>
					</div>

					{/* Additional Information */}
					<div className="space-y-4">
						<IconHeading
							icon={Calendar}
							title="Additional Information"
							description="Record timestamps"
						/>
						<Separator className="my-4" />
						<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
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
			</ScrollArea>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button type="button" variant="outline" onClick={closeDialog}>
					Close
				</Button>
			</div>
		</div>
	);
}
