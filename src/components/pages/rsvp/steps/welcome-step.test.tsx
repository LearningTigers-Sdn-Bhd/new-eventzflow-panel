import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/font/google", () => ({
	Great_Vibes: () => ({ className: "great-vibes" }),
}));

describe("WelcomeStep", () => {
	test("shows the Event Dates label and collapses same-day ranges to one date", async () => {
		const { WelcomeStep } = await import("./welcome-step");

		const html = renderToStaticMarkup(
			<WelcomeStep
				visitorName="Yael Tanner"
				eventTitle="Wedding Reception"
				startDate="2026-03-27T00:00:00.000Z"
				endDate="2026-03-27T23:59:59.000Z"
				onAccept={() => {}}
				onDecline={() => {}}
				isSubmitting={false}
			/>,
		);

		expect(html).toContain("Event Dates");
		expect(html).toContain("27/03/2026");
		expect(html).not.toContain("27/03/2026 - 27/03/2026");
	});
});
