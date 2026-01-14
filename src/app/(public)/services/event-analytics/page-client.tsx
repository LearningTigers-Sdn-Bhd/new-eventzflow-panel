"use client";

import { motion } from "framer-motion";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";
import { SMOOTH_EASE } from "@/lib/constants/animation";

const features = [
	{
		id: "01",
		title: "Real-Time Dashboard",
		category: "Monitor",
		description:
			"Monitor attendance, check-ins, and engagement metrics as they happen.",
	},
	{
		id: "02",
		title: "Attendance Reports",
		category: "Track",
		description:
			"Track who attended, when they arrived, and which sessions they visited.",
	},
	{
		id: "03",
		title: "Scan History",
		category: "Analyze",
		description:
			"See who scanned, when they checked in, and at which location.",
	},
	{
		id: "04",
		title: "Location Analytics",
		category: "Insights",
		description:
			"See traffic patterns across different zones and booths at your event.",
	},
	{
		id: "05",
		title: "Ticket Insights",
		category: "Revenue",
		description:
			"Analyze ticket sales, revenue, and registration trends over time.",
	},
	{
		id: "06",
		title: "Engagement Metrics",
		category: "Measure",
		description:
			"Track interactions and booth visits to measure attendee engagement.",
	},
];

const steps = [
	{
		number: "01",
		title: "Collect Data",
		description:
			"Every check-in, registration, and interaction is automatically tracked and recorded.",
	},
	{
		number: "02",
		title: "View Insights",
		description:
			"Access real-time dashboards showing attendance, traffic, and engagement metrics.",
	},
	{
		number: "03",
		title: "Make Decisions",
		description:
			"Use insights to optimize your event operations and improve attendee experience.",
	},
];

const highlights = [
	{ number: "01", text: "Live attendance tracking" },
	{ number: "02", text: "Visual charts and graphs" },
	{ number: "03", text: "Detailed scan history" },
	{ number: "04", text: "Location-based insights" },
];

function DashboardDemo() {
	return (
		<motion.div
			className="relative border-2 border-black bg-white shadow-2xl w-full max-w-[400px]"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Dashboard Header */}
			<div className="border-b-2 border-black bg-black px-6 py-4">
				<p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
					Event Dashboard
				</p>
				<p className="mt-1 text-lg font-bold text-white">AI Summit 2025</p>
			</div>

			{/* Stats Row */}
			<div className="grid grid-cols-3 border-b border-black/10">
				<div className="border-r border-black/10 p-4 text-center">
					<p className="text-2xl font-black text-black">1,247</p>
					<p className="text-xs font-medium uppercase tracking-widest text-black/40">
						Registered
					</p>
				</div>
				<div className="border-r border-black/10 p-4 text-center">
					<p className="text-2xl font-black text-black">892</p>
					<p className="text-xs font-medium uppercase tracking-widest text-black/40">
						Checked In
					</p>
				</div>
				<div className="p-4 text-center">
					<p className="text-2xl font-black text-black">71%</p>
					<p className="text-xs font-medium uppercase tracking-widest text-black/40">
						Attendance
					</p>
				</div>
			</div>

			{/* Chart Area */}
			<div className="p-6">
				<p className="mb-4 text-xs font-bold uppercase tracking-widest text-black/40">
					Check-ins Today
				</p>
				{/* Simple Bar Chart */}
				<div className="flex items-end justify-between gap-2 h-24">
					{[40, 65, 85, 70, 90, 75, 60].map((height, i) => (
						<motion.div
							key={i}
							className="flex-1 bg-black"
							initial={{ height: 0 }}
							whileInView={{ height: `${height}%` }}
							viewport={{ once: true }}
							transition={{
								duration: 0.6,
								delay: 0.5 + i * 0.1,
								ease: SMOOTH_EASE,
							}}
						/>
					))}
				</div>
				<div className="mt-2 flex justify-between text-[10px] text-black/40">
					<span>9AM</span>
					<span>10AM</span>
					<span>11AM</span>
					<span>12PM</span>
					<span>1PM</span>
					<span>2PM</span>
					<span>3PM</span>
				</div>
			</div>

			{/* Location Stats */}
			<div className="border-t border-black/10 p-6">
				<p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
					Top Locations
				</p>
				<div className="space-y-2">
					{[
						{ name: "Main Hall", count: 342 },
						{ name: "Exhibition A", count: 287 },
						{ name: "Workshop Room", count: 156 },
					].map((loc) => (
						<div key={loc.name} className="flex items-center justify-between">
							<span className="text-sm font-medium text-black">{loc.name}</span>
							<span className="text-sm text-black/60">{loc.count}</span>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}

export default function EventAnalyticsPageClient() {
	return (
		<main>
			<ServiceHero
				title="Event"
				titleOutline="Analytics"
				tagline="Real-time Insights & Reporting"
				description="See real-time data on attendance, engagement, and conversions. Make data-driven decisions with comprehensive analytics and exportable reports."
				heroImage="/images/services/hero/EventAnalytics.webp"
			/>
			<ServiceFeaturesSection
				title="Data-Driven"
				titleSecondLine="Decisions."
				subtitle="Comprehensive analytics tools to help you understand and optimize your event performance."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Your event at a glance"
				description="Get instant visibility into your event performance. Track attendance patterns, identify popular sessions, and make informed decisions with real-time data at your fingertips."
				highlights={highlights}
				decorativeLabels={{
					top: "Real-time\nupdates",
					bottom: "Export\nanytime",
				}}
			>
				<DashboardDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to unlock event insights?"
				description="Make data-driven decisions with comprehensive analytics and exportable reports."
			/>
		</main>
	);
}
