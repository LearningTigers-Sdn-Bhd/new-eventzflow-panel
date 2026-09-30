"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { FeedbackFilters } from "@/lib/api/feedback-form";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { DEFAULT_FILTERS, hasActiveFilters } from "./filters";

/** Filters shared by every tab and by the exports. `actions` sits at the far right. */
export function FeedbackFilterBar({
	eventId,
	filters,
	onChange,
	actions,
}: {
	eventId: string;
	filters: FeedbackFilters;
	onChange: (next: FeedbackFilters) => void;
	actions?: ReactNode;
}) {
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	return (
		<div className="flex flex-wrap items-end gap-3 border border-dashed bg-accent/40 p-3 sm:p-4">
			<div className="space-y-1">
				<Label htmlFor="feedback-filter-type" className="text-xs">
					Ticket type
				</Label>
				<Select
					value={filters.ticketTypeId ?? "all"}
					onValueChange={(value) =>
						onChange({ ...filters, ticketTypeId: value })
					}
				>
					<SelectTrigger
						id="feedback-filter-type"
						className="h-9 w-44 rounded-none bg-background text-sm"
					>
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="all" className="rounded-none">
							All ticket types
						</SelectItem>
						{ticketTypes.map((ticketType) => (
							<SelectItem
								key={ticketType.id}
								value={String(ticketType.id)}
								className="rounded-none"
							>
								{ticketType.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1">
				<Label htmlFor="feedback-filter-from" className="text-xs">
					Submitted from
				</Label>
				<Input
					id="feedback-filter-from"
					type="date"
					value={filters.from ?? ""}
					max={filters.to || undefined}
					onChange={(e) => onChange({ ...filters, from: e.target.value })}
					className="h-9 w-40 rounded-none bg-background"
				/>
			</div>
			<div className="space-y-1">
				<Label htmlFor="feedback-filter-to" className="text-xs">
					to
				</Label>
				<Input
					id="feedback-filter-to"
					type="date"
					value={filters.to ?? ""}
					min={filters.from || undefined}
					onChange={(e) => onChange({ ...filters, to: e.target.value })}
					className="h-9 w-40 rounded-none bg-background"
				/>
			</div>
			{hasActiveFilters(filters) && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-9 rounded-none text-muted-foreground"
					onClick={() => onChange(DEFAULT_FILTERS)}
				>
					<X className="size-4" />
					Clear filters
				</Button>
			)}
			{actions && <div className="ml-auto">{actions}</div>}
		</div>
	);
}
