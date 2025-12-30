"use client";

import { Calendar, Clock, Mail, Phone, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import { VisitorActionsMenu } from "./event-visitor-action-menu";

interface VisitorItemProps {
	visitor: Visitor;
	labelsData?: Record<string, string>;
}

export function VisitorItem({ visitor, labelsData }: VisitorItemProps) {
	const date = new Date(visitor.created_at);
	const hasCustomLabels = labelsData && Object.keys(labelsData).length > 0;

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="flex min-h-12 w-full flex-col items-start justify-start">
					<h3 className="truncate text-wrap font-bold text-xl">
						{visitor.full_name}
					</h3>
					<code className="mt-1 truncate rounded bg-muted px-2 py-0.5 font-mono text-xs">
						{visitor.public_id}
					</code>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex flex-col gap-2">
				<div className="grid grid-cols-2 gap-2">
					<div className="col-span-2 flex w-full items-center justify-start gap-2">
						<Mail className="size-4 text-muted-foreground" />
						<span
							className={cn(
								"truncate font-medium text-sm",
								!visitor.email && "text-muted-foreground italic",
							)}
						>
							{visitor.email || "Not provided"}
						</span>
					</div>
					{visitor.phone && (
						<div className="col-span-2 flex w-full items-center justify-start gap-2">
							<Phone className="size-4 text-muted-foreground" />
							<span className="truncate font-medium text-sm">
								{visitor.phone}
							</span>
						</div>
					)}
					<div className="flex items-center justify-start gap-2">
						<Calendar className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{date.toLocaleDateString()}
						</span>
					</div>
					<div className="flex items-center justify-start gap-2">
						<Clock className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{date.toLocaleTimeString()}
						</span>
					</div>
				</div>
				{hasCustomLabels && (
					<div className="space-y-2 border-t pt-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
							Additional Information
						</h4>
						<div className="grid grid-cols-1 gap-2">
							{Object.entries(labelsData).map(([key, labelName]) => {
								const rawValue = visitor.custom_fields_data?.[key];
								const value = typeof rawValue === "string" ? rawValue : "";
								return (
									<div key={key} className="space-y-0.5">
										<p className="font-medium text-muted-foreground text-xs">
											{labelName}
										</p>
										<p
											className={cn(
												"font-medium text-sm",
												!value && "text-muted-foreground italic",
											)}
										>
											{value || "Not provided"}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</ItemContent>
			<ItemFooter className="flex w-full items-center justify-between gap-2">
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm" className="rounded-none">
							<QrCode className="mr-2 h-4 w-4" />
							View QR
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Visitor QR Code</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col items-center space-y-4 py-4">
							<QRCode value={visitor.public_id} size={256} />
							<div className="text-center">
								<p className="font-medium">{visitor.full_name}</p>
								<p className="text-muted-foreground text-sm">
									{visitor.public_id}
								</p>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<ItemActions>
					<VisitorActionsMenu visitor={visitor} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
