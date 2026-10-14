import { EventFeatureGuard } from "@/components/pages/event/event-feature-guard";

export default function PeopleCounterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<EventFeatureGuard feature="use_people_counter" name="People Counter">
			{children}
		</EventFeatureGuard>
	);
}
