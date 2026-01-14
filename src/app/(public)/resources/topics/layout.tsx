import { ResourcesListHero } from "@/components/pages/resources/public/topics/resources-list-hero";

export default function ResourcesTopicsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen bg-white">
			{/* Scroll anchor for navigation */}
			<div id="top" className="absolute top-0" />
			{/* Hero persists across topic changes */}
			<ResourcesListHero />
			{children}
		</main>
	);
}
