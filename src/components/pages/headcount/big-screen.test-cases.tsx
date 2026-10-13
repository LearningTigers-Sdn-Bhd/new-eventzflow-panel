import assert from "node:assert/strict";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { renderToStaticMarkup } from "react-dom/server";
import type { PublicDisplay } from "@/lib/api/event/hall";
import { BigScreen } from "./big-screen";

const overall: PublicDisplay = {
	eventTitle: "Big Expo",
	level: null,
	configured: true,
	insideNow: 200,
	capacity: 320,
	hallsCounted: 2,
	hallsTotal: 3,
	levels: [
		{ floor: "Level 1", insideNow: 172, capacity: 200 },
		{ floor: "Level 2", insideNow: 28, capacity: 120 },
	],
	halls: [
		{
			name: "Main Hall",
			floor: "Level 1",
			status: "ok",
			insideNow: 172,
			capacity: 200,
		},
		{
			name: "Hall B",
			floor: "Level 2",
			status: "ok",
			insideNow: 28,
			capacity: 120,
		},
		{
			name: "Hall C",
			floor: "Level 2",
			status: "unlinked",
			insideNow: null,
			capacity: null,
		},
	],
	generatedAt: "2026-10-13T10:00:00+08:00",
};

function renderScreen(level: string | null = null, scoped?: PublicDisplay) {
	const client = new QueryClient();
	client.setQueryData(["public-people-counter-display", "expo", null], overall);
	if (scoped)
		client.setQueryData(
			["public-people-counter-display", "expo", level],
			scoped,
		);
	return renderToStaticMarkup(
		<NuqsTestingAdapter searchParams={level === null ? "" : { level }}>
			<QueryClientProvider client={client}>
				<BigScreen slug="expo" />
			</QueryClientProvider>
		</NuqsTestingAdapter>,
	);
}

// Overall response includes every level and discloses partial counter coverage.
{
	const html = renderScreen();
	assert(html.includes("Overall"));
	assert(html.includes("2 of 3 halls counting"));
	assert(html.includes("Main Hall"));
	assert(html.includes("Hall B"));
}

// The exact URL level chooses its own query cache and response.
{
	const html = renderScreen("Level 2", {
		...overall,
		level: "Level 2",
		insideNow: 28,
		capacity: 120,
		hallsCounted: 1,
		hallsTotal: 2,
		levels: [overall.levels[1]],
		halls: overall.halls.slice(1),
	});
	assert(html.includes("Level 2"));
	assert(html.includes("1 of 2 halls counting"));
	assert(html.includes("Hall B"));
	assert(html.includes("Hall C"));
	assert(!html.includes("Main Hall"));
	assert(!html.includes("Level 1"));
}

// An unknown or differently cased level must not fall back to overall numbers.
{
	const html = renderScreen("level 2");
	assert(html.includes("Loading"));
	assert(!html.includes("Main Hall"));
}
