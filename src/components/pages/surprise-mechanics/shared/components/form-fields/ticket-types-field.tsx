"use client";

import type { FieldApi } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { getEventTicketTypes } from "@/lib/api/ticket-type/endpoints";

interface TicketTypesFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any
	>;
	label: string;
	description: string;
	isPending?: boolean;
}

/**
 * Picks any of the event's ticket types. Value is an array of ticket type ids
 * as strings; an empty array means none picked.
 */
export function TicketTypesField({
	field,
	label,
	description,
	isPending = false,
}: TicketTypesFieldProps) {
	const eventId = useParams().event_id as string;
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["ticket-types", eventId],
		queryFn: () => getEventTicketTypes({ eventId }),
		enabled: !!eventId,
	});

	// Visitor events have no ticket types, so there is nothing to exclude
	if (ticketTypes.length === 0) return null;

	const options = ticketTypes.map((t) => ({
		value: String(t.id),
		label: t.name,
	}));
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<MultiSelect
				value={field.state.value as string[]}
				onValueChange={(value) => field.handleChange(value)}
			>
				<MultiSelectTrigger
					id={field.name}
					className="rounded-none"
					disabled={isPending}
				>
					<MultiSelectValue
						placeholder="None, every ticket type can win"
						options={options}
						maxDisplay={3}
					/>
				</MultiSelectTrigger>
				<MultiSelectContent className="w-[260px]">
					{options.map((o) => (
						<MultiSelectItem key={o.value} value={o.value}>
							{o.label}
						</MultiSelectItem>
					))}
				</MultiSelectContent>
			</MultiSelect>
			<FieldDescription>{description}</FieldDescription>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
