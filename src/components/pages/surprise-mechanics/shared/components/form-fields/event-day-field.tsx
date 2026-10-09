"use client";

import type { FieldApi } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { useParams } from "next/navigation";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getEventById } from "@/lib/api/event";

const ANY_DAY = "any";

interface EventDayFieldProps {
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
 * Picks one of the event's days. Value is "YYYY-MM-DD", or "" for any day.
 */
export function EventDayField({
	field,
	label,
	description,
	isPending = false,
}: EventDayFieldProps) {
	const eventId = useParams().event_id as string;
	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	// Date part only: the API sends local-midnight ISO strings, so slicing avoids a timezone shift
	const days =
		event?.start_date && event?.end_date
			? eachDayOfInterval({
					start: parseISO(event.start_date.slice(0, 10)),
					end: parseISO(event.end_date.slice(0, 10)),
				})
			: [];

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				value={field.state.value || ANY_DAY}
				onValueChange={(value) =>
					field.handleChange(value === ANY_DAY ? "" : value)
				}
				disabled={isPending || days.length === 0}
			>
				<SelectTrigger className="w-full rounded-none">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ANY_DAY}>Any day</SelectItem>
					{days.map((day, i) => (
						<SelectItem
							key={day.toISOString()}
							value={format(day, "yyyy-MM-dd")}
						>
							Day {i + 1} · {format(day, "d MMM yyyy")}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldDescription>{description}</FieldDescription>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
