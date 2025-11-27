"use client";

import { Calendar, Mail, Phone, Store } from "lucide-react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { VisitorStampWithDetails } from "@/lib/api/visitor-stamp";

interface VisitorStampItemProps {
	stamp: VisitorStampWithDetails;
}

export function VisitorStampItem({ stamp }: VisitorStampItemProps) {
	const hasContact = stamp.visitor_email || stamp.visitor_phone;

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="w-full">
					<h3 className="font-bold text-lg leading-tight">{stamp.visitor_name}</h3>
				</ItemTitle>
				{hasContact && (
					<ItemDescription className="flex w-full flex-col gap-1">
						{stamp.visitor_phone && (
							<div className="flex items-center gap-1.5">
								<Phone className="size-3 shrink-0 text-muted-foreground" />
								<span className="font-medium text-muted-foreground text-sm">
									{stamp.visitor_phone}
								</span>
							</div>
						)}
						{stamp.visitor_email && (
							<div className="flex items-center gap-1.5">
								<Mail className="size-3 shrink-0 text-muted-foreground" />
								<span className="break-all font-medium text-muted-foreground text-sm">
									{stamp.visitor_email}
								</span>
							</div>
						)}
					</ItemDescription>
				)}
			</ItemHeader>
			<ItemContent className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<Store className="size-4 shrink-0 text-muted-foreground" />
					<span className="font-medium text-muted-foreground text-sm">
						{stamp.vendor_name}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Calendar className="size-4 shrink-0 text-muted-foreground" />
					<span className="font-medium text-muted-foreground text-sm">
						{new Date(stamp.created_at).toLocaleString()}
					</span>
				</div>
			</ItemContent>
		</Item>
	);
}
