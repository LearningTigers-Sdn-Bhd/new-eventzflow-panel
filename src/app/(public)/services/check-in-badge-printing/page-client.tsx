"use client";

import { motion } from "framer-motion";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";

const features = [
	{
		id: "01",
		title: "QR Code Scanning",
		category: "Speed",
		description:
			"Fast contactless check-in by scanning attendee QR codes with any device.",
	},
	{
		id: "02",
		title: "Badge Printing",
		category: "Professional",
		description:
			"Print professional name badges on-demand as attendees check in at your event.",
	},
	{
		id: "03",
		title: "Multi-Device Support",
		category: "Flexible",
		description:
			"Check in attendees from phones, tablets, or laptops — use any device you have.",
	},
	{
		id: "04",
		title: "Real-Time Tracking",
		category: "Monitor",
		description:
			"Monitor attendance in real-time with live dashboards and instant notifications.",
	},
	{
		id: "05",
		title: "Custom Badge Designs",
		category: "Brand",
		description:
			"Design badges with your branding, logos, and custom fields for each ticket type.",
	},
	{
		id: "06",
		title: "Walk-In Registration",
		category: "Adapt",
		description:
			"Register and check in walk-in attendees on the spot with instant badge printing.",
	},
];

const steps = [
	{
		number: "01",
		title: "Set Up Check-In",
		description:
			"Configure your check-in stations with badge templates and scanning preferences.",
	},
	{
		number: "02",
		title: "Attendees Arrive",
		description:
			"Scan QR codes or search by name. Badges print automatically upon check-in.",
	},
	{
		number: "03",
		title: "Track Everything",
		description:
			"Monitor attendance in real-time and get instant insights from your dashboard.",
	},
];

const highlights = [
	{ number: "01", text: "Under 3 seconds per check-in" },
	{ number: "02", text: "Works with any device camera" },
	{ number: "03", text: "Badges print automatically" },
	{ number: "04", text: "Real-time attendance sync" },
];

function BadgeDemo() {
	return (
		<motion.div
			className="relative bg-white border-2 border-black shadow-2xl w-full max-w-[380px]"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Badge Header */}
			<div className="bg-black px-6 py-4">
				<p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
					SME Expo 2025
				</p>
				<p className="mt-1 text-lg font-bold text-white">
					Sabah International Convention Centre
				</p>
			</div>

			{/* Badge Content */}
			<div className="p-6">
				{/* Avatar */}
				<div className="mb-4 flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center bg-black text-2xl font-bold text-white">
						JS
					</div>
					<div>
						<p className="text-2xl font-black text-black">John Smith</p>
						<p className="text-sm text-black/60">Executive</p>
					</div>
				</div>

				{/* Details */}
				<div className="space-y-2 border-t border-black/10 pt-4">
					<div className="flex justify-between">
						<span className="text-xs font-medium uppercase tracking-widest text-black/40">
							Company
						</span>
						<span className="text-sm font-medium text-black">Tech Corp</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs font-medium uppercase tracking-widest text-black/40">
							Ticket
						</span>
						<span className="text-sm font-medium text-black">VIP Pass</span>
					</div>
				</div>

				{/* QR Code */}
				<div className="mt-6 flex justify-center">
					<div className="bg-black/5 p-3">
						<svg
							width="80"
							height="80"
							viewBox="0 0 29 29"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0 0h7v7H0zM8 0h1v1H8zM10 0h1v1h-1zM12 0h2v1h-2zM15 0h1v2h-1zM17 0h5v1h-1v1h-1V1h-1v1h-1V1h-1zM22 0h7v7h-7zM1 1v5h5V1zM9 1h1v1H9zM11 1h1v2h1V2h2v1h-1v1h-2v1h-1V4h1V3h-1zM16 1v1h-1v1h2V2h1v2h-2v1h1v1h-2v1h1v1h-1v1h2V8h2v1h-1v2h1v-1h2V9h-2V8h1V7h-1V6h2V5h-1V4h1V3h-2V2h1V1h-3v1h-1v1h-1zM23 1v5h5V1zM2 2v3h3V2zM18 2h1v1h-1zM23 2v3h3V2zM10 3h1v1h-1zM9 4v1H8v2h1V6h1v1h2v1h-1v1H9V8h1V7H9V6H8v1H7v1h1v1H7v2H6v-2H5v1H4v2H3v1h1v-1h2v1h1v1H6v1h2v1H7v2H6v-1H4v1H3v1h1v1H3v1h2v1H4v-1H3v-1H2v1H1v1H0v-2h1v-1h1v-2h1v1H2v1h1v-2h1v1h1v2h1v-2H5v-1h1v-2H5v-1H4v-2H3v1H2v-2H1v-1H0V8h1V7h1V6h1v1h2V6H4v1h1V6h1v1h2V6h1zM20 4h1v1h-1zM21 5v1h-2v1h2v1h-3V7h1V6h1V5zM27 5h1v1h-1zM11 6h1v1h-1zM3 7v1H2V7zM5 7h1v2H5zM26 7h2v2h-2zM14 8h1v1h-1zM6 9h1v1H6zM23 9h1v2h1v-1h1v1h-1v1h2v1h-3v-1h-1v1h-1v-1h1v-2h-1v1h-1v-1h1V9h1zM27 9v3h-1v-1h-1v-1h2zM3 10v1H2v-1zM9 10h2v1h1v-1h1v2h-1v-1h-1v1H9v1h1v-1h2v2h-2v1h3v1h-1v1h1v1h-1v2h1v-1h2v1h1v-1h1v1h1v2h-1v-1h-3v2h1v1h1v1h-1v-1h-2v1h1v1H9v1h1v1H9v1h2v-2h1v2h-1v1h2v-2h1v1h2v1h-1v1h4v-1h-1v-1h-1v-2h-1v1h-2v-2h2v-1h2v2h-1v2h2v-1h2v-1h-1v-2h-1v1h-2v-2h1v-1h-1v-2h1v1h2v-2h-1v-1h1v-1h-2v-1h-1v-1h-1v-1h1v-1h-2v1h-1v-2h2v-1h-2v1h-2v-1h1V9h-2v1h-1V9h-2v1h1v1h-2v1h1v1h1v1h-1v-1h-2v-1h1v-2h-1v1H9v1h1v-1h2v1h-2v1h-1zM4 11h1v1H4zM6 11h1v1H6zM27 12h2v1h-1v1h-1zM10 13h1v1h-1zM0 14h1v1H0zM2 14h2v1H2zM5 14h2v2H6v-1H5zM1 15h1v1H1zM4 15h1v2H4zM18 15h1v1h-1zM28 15h1v3h-1zM0 16h1v2H0zM2 16h1v1H2zM22 16h2v1h-2zM25 16h1v1h-1zM1 17h1v1H1zM21 17h1v2h-2v-1h1zM24 17h1v1h-1zM26 17h1v1h-1zM6 18v1H5v1h2v-1h1v1H7v1h2v-1h1v1H9v2h1v-1h1v-1h-1v-1h2v-1h-1v-1h-1v-1H9v1H8v-1H7v1H6zM18 18h1v1h1v-1h2v1h-1v1h-1v2h-1v-1h-2v1h1v1h-2v-1h1v-2h2v-1h-1zM3 19h1v1H3zM23 19h1v1h-1zM25 19h2v1h-2zM15 20h1v1h-1zM24 20h1v1h-1zM1 21h2v1H1zM4 21h1v1H4zM0 22h1v7H0zM7 22h1v1H7zM14 22h1v2h-1zM22 22h7v7h-7zM1 23h1v1H1zM3 23h3v1h1v1H6v2H5v-1H4v-1H3v2H2v-3h1zM15 23h1v1h-1zM23 23v5h5v-5zM7 24h1v2H7zM1 25h1v2H1zM24 24v3h3v-3zM8 26h4v1h1v-1h1v1h-5v1h5v1h-6zM2 27h3v1H2zM0 28h1v1H0zM7 28h1v1H7z"
								fill="black"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Session Info */}
			<div className="border-t-2 border-black bg-black/5 px-6 py-3">
				<div className="flex items-center justify-center gap-2">
					<span className="text-xs font-bold uppercase tracking-widest text-black/60">
						Day 1 - AI Summit
					</span>
				</div>
			</div>
		</motion.div>
	);
}

export default function CheckInBadgePrintingPageClient() {
	return (
		<main>
			<ServiceHero
				title="Check-In"
				titleOutline="& Badges"
				tagline="On-site Kiosk & Instant Printing"
				description="Fast, contactless entry with real-time attendance tracking. Print professional badges on-demand as attendees check in at your event."
				heroImage="/images/services/hero/CheckInBadgePrinting.webp"
			/>
			<ServiceFeaturesSection
				title="Smooth Check-In"
				titleSecondLine="Every Time."
				subtitle="Everything you need for fast, professional event check-in and badge printing."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Seamless check-in experience"
				description="Scan attendee QR codes and print professional badges in seconds. Our check-in system handles high-volume events with ease, keeping queues moving and attendees happy."
				highlights={highlights}
				decorativeLabels={{
					top: "Scan QR\nin seconds",
					bottom: "Print badge\ninstantly",
				}}
			>
				<BadgeDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to streamline your event check-in?"
				description="Join hundreds of event organizers who trust EventzFlow for fast, professional check-in and badge printing."
			/>
		</main>
	);
}
