interface BuildPublicRegistrationStepsOptions {
	hasMultipleTicketTypes: boolean;
	paymentSuccess: boolean;
}

export interface PublicRegistrationStep {
	id: 1 | 2 | 3 | 4 | 5 | 6;
	label: string;
}

export function buildPublicRegistrationSteps({
	hasMultipleTicketTypes,
	paymentSuccess,
}: BuildPublicRegistrationStepsOptions): PublicRegistrationStep[] {
	const steps: PublicRegistrationStep[] = [];

	if (hasMultipleTicketTypes) {
		steps.push({ id: 1, label: "Ticket Type" });
	}

	steps.push(
		{ id: 2, label: "Email" },
		{ id: 3, label: "Details" },
		{ id: 4, label: "Confirm" },
		{ id: 5, label: "Payment" },
	);

	if (paymentSuccess) {
		steps.push({ id: 6, label: "Complete" });
	}

	return steps;
}
