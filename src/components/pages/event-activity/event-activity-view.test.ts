import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const viewSource = readFileSync(
	new URL("./event-activity-view.tsx", import.meta.url),
	"utf8",
);
const tableSource = readFileSync(
	new URL("./activity-log-table.tsx", import.meta.url),
	"utf8",
);
const columnsSource = readFileSync(
	new URL("./activity-log-columns.tsx", import.meta.url),
	"utf8",
);

describe("event activity page", () => {
	test("does not render a duplicate inner activity heading", () => {
		expect(viewSource).not.toContain("Activity Log");
	});

	test("registers a rounded-none refresh action in the event header", () => {
		expect(tableSource).toContain("useEventActionsStore");
		expect(tableSource).toContain("RefreshCw");
		expect(tableSource).toContain("refetch");
		expect(tableSource).toContain('className="rounded-none"');
	});

	test("formats activity timestamps as stacked date and time", () => {
		expect(columnsSource).toContain('header: "Date & Time"');
		expect(columnsSource).toContain(
			'format(new Date(row.original.created_at), "h:mm:ss a")',
		);
		expect(columnsSource).toContain(
			'format(new Date(row.original.created_at), "dd MMM yyyy")',
		);
		expect(columnsSource).toContain("flex flex-col");
	});

	test("uses server pagination with large-list safeguards", () => {
		expect(tableSource).toContain("usePersistedState");
		expect(tableSource).toContain("useDebounce");
		expect(tableSource).toContain("DEFAULT_PAGE_SIZE = 10");
		expect(tableSource).toContain("per_page: pageSize");
		expect(tableSource).toContain("placeholderData: (previous) => previous");
		expect(tableSource).toContain("PAGE_SIZE_OPTIONS = [10, 25, 100]");
		expect(tableSource).toContain("pageSizeOptions={PAGE_SIZE_OPTIONS}");
	});

	test("shows attendee details before the technical ticket id", () => {
		expect(tableSource).toContain("resource.attendee");
		expect(tableSource).toContain("resource.attendee.email");
		expect(tableSource).toContain("Ticket ID");
	});
});
