import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { isNoSidebarRoute } from "@/components/sidebars/registry/orchestrator-config";
import type { RfidDisplayActivity } from "@/lib/api/rfid";
import { ArrivalDisplay } from "./arrival-display";

const activity: RfidDisplayActivity[] = Array.from(
	{ length: 45 },
	(_, index) => ({
		id: `${index + 1}-in`,
		ticket_name: `Guest ${index + 1}`,
		direction: "in",
		occurred_at: "2026-10-01T02:15:00Z",
	}),
);

test("shows 10 main arrivals and the next 30 in three columns, with entry times", () => {
	const html = renderToStaticMarkup(
		<ArrivalDisplay title="Test event" activity={activity} status="live" />,
	);
	expect((html.match(/data-arrival="main"/g) ?? []).length).toBe(10);
	expect((html.match(/data-arrival="previous"/g) ?? []).length).toBe(30);
	expect(
		(html.match(/aria-label="Previous arrivals column/g) ?? []).length,
	).toBe(3);
	expect(html).toContain("Guest 40");
	expect(html).not.toContain("Guest 41");
	expect(html).toContain("10:15 AM");
	expect(html.indexOf("Guest 10")).toBeLessThan(html.indexOf("Guest 11"));
});

test("handles empty, unnamed and disconnected arrivals without inventing guests", () => {
	const empty = renderToStaticMarkup(
		<ArrivalDisplay title="Test event" activity={[]} status="loading" />,
	);
	expect(empty).toContain("Connecting to the gate");
	expect(empty).not.toContain("data-arrival=");
	const html = renderToStaticMarkup(
		<ArrivalDisplay
			title="Test event"
			activity={[{ ...activity[0], ticket_name: null }]}
			status="offline"
		/>,
	);
	expect(html).toContain("Guest");
	expect(html).toContain("Reconnecting");
	expect((html.match(/data-arrival=/g) ?? []).length).toBe(1);
});

test("the display hides dashboard navigation while the RFID dashboard keeps it", () => {
	expect(isNoSidebarRoute("/event/12/rfid/display")).toBe(true);
	expect(isNoSidebarRoute("/event/12/rfid")).toBe(false);
});

test("spotlights only the newest guest and uses the event logo", () => {
	const html = renderToStaticMarkup(
		<ArrivalDisplay
			title="Test event"
			logoUrl="https://example.invalid/event-logo.png"
			activity={activity}
			status="live"
		/>,
	);
	expect((html.match(/data-spotlight="true"/g) ?? []).length).toBe(1);
	expect(html).toContain("event-logo.png");
	expect(html).not.toContain("Welcome,");
});

test("out and both modes label the direction and use the activity time", () => {
	const departures = [
		{
			...activity[0],
			id: "1-out",
			direction: "out" as const,
			occurred_at: "2026-10-01T03:45:00Z",
		},
	];
	const out = renderToStaticMarkup(
		<ArrivalDisplay
			title="Test event"
			activity={departures}
			mode="out"
			status="live"
		/>,
	);
	expect(out).toContain("Latest departures");
	expect(out).toContain("11:45 AM");
	expect(out).toContain("OUT");
	expect(out).not.toContain("Welcome");
	const both = renderToStaticMarkup(
		<ArrivalDisplay
			title="Test event"
			activity={[...departures, activity[0]]}
			mode="both"
			status="live"
		/>,
	);
	expect(both).toContain("Latest activity");
	expect(both).toContain("IN");
	expect(both).toContain("OUT");
});
