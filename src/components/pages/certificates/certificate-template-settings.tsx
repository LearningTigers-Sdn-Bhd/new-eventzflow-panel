"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CertificateTemplate } from "@/lib/api/certificate";
import type { TicketType } from "@/lib/api/ticket-type";

type CertificateTemplateSettingsProps = {
	isEditing: boolean;
	name: string;
	onNameChange: (name: string) => void;
	ticketTypeIds: number[];
	onTicketTypeIdsChange: (ids: number[]) => void;
	ticketTypes: TicketType[];
	otherTemplates: CertificateTemplate[];
};

/** Template name + which ticket types receive it (none = default for the rest). */
export function CertificateTemplateSettings({
	isEditing,
	name,
	onNameChange,
	ticketTypeIds,
	onTicketTypeIdsChange,
	ticketTypes,
	otherTemplates,
}: CertificateTemplateSettingsProps) {
	const takenBy = (id: number) =>
		otherTemplates.find((t) => t.ticket_type_ids.includes(id))?.name;

	if (!isEditing) {
		const names = ticketTypes
			.filter((t) => ticketTypeIds.includes(t.id))
			.map((t) => t.name);
		return (
			<p className="text-muted-foreground text-xs">
				Applies to:{" "}
				<span className="font-medium text-foreground">
					{names.length > 0
						? names.join(", ")
						: "all ticket types without their own template"}
				</span>
			</p>
		);
	}

	const toggle = (id: number, checked: boolean) =>
		onTicketTypeIdsChange(
			checked ? [...ticketTypeIds, id] : ticketTypeIds.filter((x) => x !== id),
		);

	return (
		<div className="space-y-3 border border-dashed p-3">
			<div className="space-y-1">
				<Label htmlFor="certificate-template-name">Template name</Label>
				<Input
					id="certificate-template-name"
					value={name}
					maxLength={100}
					onChange={(e) => onNameChange(e.target.value)}
					className="max-w-sm rounded-none"
				/>
			</div>
			<div className="space-y-2">
				<Label>Send this template to</Label>
				<p className="text-muted-foreground text-xs">
					Leave all unticked to make this the default for every ticket type that
					has no template of its own.
				</p>
				<div className="grid gap-2 sm:grid-cols-2">
					{ticketTypes.map((type) => {
						const taken = takenBy(type.id);
						return (
							<div key={type.id} className="flex items-center gap-2 text-sm">
								<Checkbox
									id={`certificate-ticket-type-${type.id}`}
									checked={ticketTypeIds.includes(type.id)}
									disabled={Boolean(taken)}
									onCheckedChange={(c) => toggle(type.id, c === true)}
								/>
								<Label
									htmlFor={`certificate-ticket-type-${type.id}`}
									className={taken ? "text-muted-foreground" : undefined}
								>
									{type.name}
									{taken && ` (used by ${taken})`}
								</Label>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
