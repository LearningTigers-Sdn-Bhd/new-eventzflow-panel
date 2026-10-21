import type { Metadata } from "next";
import TableSeatingPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Table Seating Management - EventzFlow",
	description:
		"Plan floor layouts, seat guests by drag and drop, and keep VIP and group seating organised. Table seating management for galas, dinners and conferences.",
	openGraph: {
		title: "Table Seating Management - EventzFlow",
		description:
			"Plan floor layouts, seat guests by drag and drop, and keep VIP and group seating organised.",
		url: "https://eventzflow.com/services/table-seating",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function TableSeatingPage() {
	return <TableSeatingPageClient />;
}
