"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";

const features = [
	{
		id: "01",
		title: "IR People Counters",
		category: "Hardware",
		description:
			"Infrared counters at your doors count every entry and exit, even in low light.",
	},
	{
		id: "02",
		title: "Live Headcount",
		category: "Realtime",
		description:
			"See how many people are inside right now, by event, level and hall.",
	},
	{
		id: "03",
		title: "Capacity Alerts",
		category: "Safety",
		description:
			"Get warned as a hall nears capacity, with a clear flag once it is full.",
	},
	{
		id: "04",
		title: "Big Screen Display",
		category: "On-site",
		description:
			"Show live occupancy at the door so staff and visitors know when to wait.",
	},
	{
		id: "05",
		title: "Footfall Trends",
		category: "Analytics",
		description:
			"Review hourly traffic, peak times and day-by-day totals to plan better next time.",
	},
	{
		id: "06",
		title: "Excel & PDF Reports",
		category: "Reports",
		description:
			"Export traffic summaries for sponsors, venues and your own post-event review.",
	},
];

const steps = [
	{
		number: "01",
		title: "Install Counters",
		description:
			"We place IR counters at your entrances. No wiring into your registration system needed.",
	},
	{
		number: "02",
		title: "Link To Your Event",
		description:
			"Connect the counters to your event and map them to halls and levels in EventzFlow.",
	},
	{
		number: "03",
		title: "Watch It Live",
		description:
			"Track occupancy in real time, then export footfall reports when the event ends.",
	},
];

const highlights = [
	{ number: "01", text: "Entries, exits & occupancy" },
	{ number: "02", text: "Per hall and per level" },
	{ number: "03", text: "Capacity warnings" },
	{ number: "04", text: "Hourly footfall reports" },
];

const CAPACITY = 500;

function LiveCounterDemo() {
	const [inside, setInside] = useState(412);

	useEffect(() => {
		const id = setInterval(() => {
			setInside((n) =>
				Math.max(
					0,
					Math.min(CAPACITY + 20, n + Math.round(Math.random() * 12 - 4)),
				),
			);
		}, 1500);
		return () => clearInterval(id);
	}, []);

	const pct = Math.min(100, Math.round((inside / CAPACITY) * 100));
	const state = inside > CAPACITY ? "Full" : pct >= 90 ? "Nearly full" : "Open";

	return (
		<motion.div
			className="w-full max-w-[420px] border-2 border-black bg-white p-8"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<div className="mb-6 flex items-center justify-between">
				<p className="font-bold text-xs uppercase tracking-[0.3em]">
					Main Hall
				</p>
				<span className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
					<span className="h-2 w-2 animate-pulse rounded-full bg-black" />
					Live
				</span>
			</div>
			<p className="font-black text-7xl tabular-nums tracking-tighter">
				{inside}
			</p>
			<p className="mb-6 text-black/60 text-sm uppercase tracking-widest">
				Inside now / {CAPACITY} capacity
			</p>
			<div className="mb-3 h-3 w-full border border-black">
				<div
					className="h-full bg-black transition-all duration-700"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<p className="font-bold text-sm uppercase tracking-wider">{state}</p>
			<p className="mt-6 text-black/40 text-xs">
				Sample figures for illustration.
			</p>
		</motion.div>
	);
}

export default function PeopleCountingPageClient() {
	return (
		<main>
			<ServiceHero
				title="People"
				titleOutline="Counting"
				tagline="Real-Time Headcount & Footfall"
				description="Know exactly how many people are in your venue at any moment. IR counters at your doors feed live occupancy, capacity alerts and footfall analytics into EventzFlow."
				heroImage="/images/services/hero/PeopleCountingEntrance.webp"
			/>
			<ServiceFeaturesSection
				title="Count Every"
				titleSecondLine="Visitor."
				subtitle="Accurate door counts turned into live occupancy, crowd safety and post-event insight."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Preview"
				title="Occupancy at a glance"
				description="Every entry and exit updates the hall's headcount as it happens. Watch capacity fill up, warn your team before a hall overflows, and put the numbers on a big screen at the door."
				highlights={highlights}
				decorativeLabels={{
					top: "Live\nheadcount",
					bottom: "Capacity\nalerts",
				}}
			>
				<LiveCounterDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to see who is in the room?"
				description="Add live headcount and footfall analytics to your next event with IR people counters."
			/>
		</main>
	);
}
