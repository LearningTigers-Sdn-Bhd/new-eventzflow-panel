"use client";

import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { getEventRegistrationForms } from "@/lib/api/registration-form";

// ponytail: mirrors VehicleRegistrationRules::FORM_RULES keys on the backend,
// which re-validates the pick anyway.
const VEHICLE_FORM_SLUG =
	/^(expedition-.+|competition|competitor-support|official-crew)$/;

interface VehicleGroupFieldProps {
	eventId: string;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}

export function VehicleGroupField({
	eventId,
	value,
	onChange,
	disabled,
}: VehicleGroupFieldProps) {
	const id = useId();
	const { data: forms = [] } = useQuery({
		queryKey: ["event", eventId, "registration-forms"],
		queryFn: () => getEventRegistrationForms({ eventId }),
	});

	return (
		<SelectLabel
			label="Expedition Group"
			htmlFor={id}
			description="With a new car plate, only this person moves. With the same plate, the whole car moves (only if no one else is in it)."
			value={value.toString()}
			onChange={(v) => onChange(Number(v))}
			disabled={disabled}
			options={forms
				.filter((f) => VEHICLE_FORM_SLUG.test(f.slug))
				.map((f) => ({ value: f.id.toString(), label: f.name }))}
		/>
	);
}
