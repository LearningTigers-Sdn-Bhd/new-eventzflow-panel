import type { Metadata } from "next";
import HomeSection from "@/components/pages/home/home-section";

export const metadata: Metadata = {
	title: "EventzFlow",
	description: "EventzFlow is a platform for event management",
};

export default function Home() {
	return (
		<div className="w-full">
			<HomeSection />
		</div>
	);
}
