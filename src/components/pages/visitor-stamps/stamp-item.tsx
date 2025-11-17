"use client";

import { Calendar, Mail, Phone, Store, User } from "lucide-react";
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
	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between">
					<h3 className="text-balance font-bold text-xl">{stamp.visitor_name}</h3>
				</ItemTitle>
				<ItemDescription className="flex w-full justify-start gap-2">
					<code className="bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
						{stamp.visitor_public_id}
					</code>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="grid grid-cols-2 gap-2 md:flex md:flex-col">
				{stamp.visitor_email && (
					<div className="flex items-center gap-2">
						<Mail className="size-4 text-muted-foreground" />
						<h4 className="font-medium text-muted-foreground text-sm">
							{stamp.visitor_email}
						</h4>
					</div>
				)}
				{stamp.visitor_phone && (
					<div className="flex items-center gap-2">
						<Phone className="size-4 text-muted-foreground" />
						<h4 className="font-medium text-muted-foreground text-sm">
							{stamp.visitor_phone}
						</h4>
					</div>
				)}
				<div className="flex items-center gap-2">
					<Store className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{stamp.vendor_name}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Calendar className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{new Date(stamp.created_at).toLocaleString().split(",")[0]}
					</h4>
				</div>
			</ItemContent>
		</Item>
	);
}
