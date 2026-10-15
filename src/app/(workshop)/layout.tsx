import type { Metadata } from "next";
import { WorkshopAuthGate } from "@/components/plan/workshop-auth-gate";

export const metadata: Metadata = {
	title: {
		template: "%s | EventzFlow Panel",
		default: "Seating Plan | EventzFlow Panel",
	},
};

export default function WorkshopLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <WorkshopAuthGate>{children}</WorkshopAuthGate>;
}
