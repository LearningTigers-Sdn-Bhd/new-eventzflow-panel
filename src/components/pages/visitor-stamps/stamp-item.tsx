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
	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-3">
				<ItemTitle className="w-full">
					<h3 className="font-bold text-lg leading-tight">{stamp.visitor_name}</h3>
				</ItemTitle>
				<ItemDescription className="flex w-full justify-start">
					<code className="break-all bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
						{stamp.visitor_public_id}
					</code>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="flex flex-col gap-3">
				{stamp.visitor_email && (
					<div className="flex items-start gap-2">
						<Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<span className="break-all font-medium text-muted-foreground text-sm">
							{stamp.visitor_email}
						</span>
					</div>
				)}
				{stamp.visitor_phone && (
					<div className="flex items-center gap-2">
						<Phone className="size-4 shrink-0 text-muted-foreground" />
						<span className="font-medium text-muted-foreground text-sm">
							{stamp.visitor_phone}
						</span>
					</div>
				)}
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
