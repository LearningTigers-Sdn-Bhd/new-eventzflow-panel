import { describe, expect, test } from "bun:test";
import { buildPublicRegistrationSteps } from "./steps";

describe("buildPublicRegistrationSteps", () => {
	test("includes complete step only after payment success", () => {
		const beforePayment = buildPublicRegistrationSteps({
			hasMultipleTicketTypes: true,
			paymentSuccess: false,
		});

		expect(beforePayment.map((step) => step.label)).toEqual([
			"Ticket Type",
			"Email",
			"Details",
			"Confirm",
			"Payment",
		]);

		const afterPayment = buildPublicRegistrationSteps({
			hasMultipleTicketTypes: true,
			paymentSuccess: true,
		});

		expect(afterPayment.map((step) => step.label)).toEqual([
			"Ticket Type",
			"Email",
			"Details",
			"Confirm",
			"Payment",
			"Complete",
		]);
	});

	test("hides ticket type step when only one ticket type", () => {
		const steps = buildPublicRegistrationSteps({
			hasMultipleTicketTypes: false,
			paymentSuccess: true,
		});

		expect(steps.map((step) => step.id)).toEqual([2, 3, 4, 5, 6]);
	});
});
