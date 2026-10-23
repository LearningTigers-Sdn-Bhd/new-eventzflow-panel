"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type CertificateTemplate,
	updateCertificateTemplate,
} from "@/lib/api/certificate";
import { getRfidEligibilityFields } from "@/lib/api/rfid";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { fieldLabel } from "./send-certificates-panel";

const NO_FIELD = "none";

type AutoSendFilterProps = {
	eventId: string;
	templates: CertificateTemplate[];
};

/** Limits the automatic send to guests whose registration answer matches. */
export function AutoSendFilter({ eventId, templates }: AutoSendFilterProps) {
	const queryClient = useQueryClient();
	const saved = templates[0]?.auto_send_filter ?? {};
	const [key, setKey] = useState(saved.key || NO_FIELD);
	const [values, setValues] = useState<string[]>(saved.values ?? []);
	const [typeIds, setTypeIds] = useState<string[]>(
		(saved.ticket_type_ids ?? []).map(String),
	);

	useEffect(() => {
		setKey(saved.key || NO_FIELD);
		setValues(saved.values ?? []);
		setTypeIds((saved.ticket_type_ids ?? []).map(String));
	}, [saved.key, saved.values, saved.ticket_type_ids]);

	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const { data } = useQuery({
		queryKey: ["event", eventId, "rfid", "eligibility-fields"],
		queryFn: () => getRfidEligibilityFields(eventId),
	});
	const fields = data?.fields ?? [];
	const options = fields.find((f) => f.key === key)?.values ?? [];

	const mutation = useMutation({
		// One filter for the whole event, like the switch: every template follows it.
		mutationFn: (filter: {
			key: string;
			values: string[];
			ticket_type_ids: number[];
		}) =>
			Promise.all(
				templates.map((t) =>
					updateCertificateTemplate(eventId, t.id, {
						auto_send_filter: filter,
					}),
				),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-templates"],
			});
			toast.success("Auto-send filter saved.");
		},
		onError: (e: unknown) =>
			toast.error(e instanceof Error ? e.message : "Failed to save filter"),
	});

	if (fields.length === 0 && ticketTypes.length < 2) return null;

	const save = (
		nextKey: string,
		nextValues: string[],
		nextTypeIds: string[] = typeIds,
	) =>
		mutation.mutate({
			...(nextKey === NO_FIELD
				? { key: "", values: [] }
				: { key: nextKey, values: nextValues }),
			ticket_type_ids: nextTypeIds.map(Number),
		});

	return (
		<div className="space-y-2 border bg-card p-4">
			<Label>Only auto-send to (optional)</Label>
			<p className="text-muted-foreground text-xs">
				Everyone else still submits feedback but is not emailed automatically.
				You can send to them manually.
			</p>
			<div className="grid gap-2 sm:grid-cols-3">
				{ticketTypes.length > 1 && (
					<MultiSelect
						value={typeIds}
						onValueChange={(next) => {
							setTypeIds(next);
							save(key, values, next);
						}}
					>
						<MultiSelectTrigger className="rounded-none">
							<MultiSelectValue placeholder="All ticket types" />
						</MultiSelectTrigger>
						<MultiSelectContent>
							{ticketTypes.map((t) => (
								<MultiSelectItem key={t.id} value={String(t.id)}>
									{t.name}
								</MultiSelectItem>
							))}
						</MultiSelectContent>
					</MultiSelect>
				)}
				{fields.length > 0 && (
					<>
						<Select
							value={key}
							disabled={mutation.isPending}
							onValueChange={(next) => {
								setKey(next);
								setValues([]);
								if (next === NO_FIELD) save(next, []);
							}}
						>
							<SelectTrigger className="w-full rounded-none data-[size=default]:h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NO_FIELD}>Everyone</SelectItem>
								{fields.map((f) => (
									<SelectItem key={f.key} value={f.key}>
										{fieldLabel(f.key)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{key !== NO_FIELD && (
							<MultiSelect
								value={values}
								onValueChange={(next) => {
									setValues(next);
									save(key, next);
								}}
							>
								<MultiSelectTrigger className="rounded-none">
									<MultiSelectValue placeholder="Value (pick one or more)" />
								</MultiSelectTrigger>
								<MultiSelectContent>
									{options.map((value) => (
										<MultiSelectItem key={value} value={value}>
											{value}
										</MultiSelectItem>
									))}
								</MultiSelectContent>
							</MultiSelect>
						)}
					</>
				)}
			</div>
		</div>
	);
}
