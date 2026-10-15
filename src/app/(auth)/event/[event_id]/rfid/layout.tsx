import { EventFeatureGuard } from "@/components/pages/event/event-feature-guard";

export default function RfidLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<EventFeatureGuard feature="use_rfid" name="RFID">
			{children}
		</EventFeatureGuard>
	);
}
