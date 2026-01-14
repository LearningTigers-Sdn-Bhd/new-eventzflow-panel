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
		title: "Meeting Scheduling",
		category: "Connect",
		description:
			"Let attendees book meetings with exhibitors and sponsors directly.",
	},
	{
		id: "02",
		title: "Host Availability",
		category: "Manage",
		description:
			"Hosts set their available time slots for attendees to book appointments.",
	},
	{
		id: "03",
		title: "Booking Management",
		category: "Track",
		description:
			"Track all bookings with status updates, confirmations, and reminders.",
	},
	{
		id: "04",
		title: "Multiple Sessions",
		category: "Organize",
		description:
			"Create separate matching sessions for different purposes or tracks.",
	},
	{
		id: "05",
		title: "Attendee Details",
		category: "Collect",
		description:
			"Collect attendee information and notes for each booked meeting.",
	},
	{
		id: "06",
		title: "Reports & Export",
		category: "Analyze",
		description:
			"Download booking reports in PDF or Excel format for analysis.",
	},
];

const steps = [
	{
		number: "01",
		title: "Hosts Set Availability",
		description:
			"Exhibitors and sponsors define their available time slots for meetings.",
	},
	{
		number: "02",
		title: "Attendees Book Meetings",
		description:
			"Attendees browse hosts and book appointments at their preferred times.",
	},
	{
		number: "03",
		title: "Meet & Connect",
		description:
			"Both parties receive confirmations and meet at the scheduled time.",
	},
];

const highlights = [
	{ number: "01", text: "Easy booking interface" },
	{ number: "02", text: "Automatic confirmations" },
	{ number: "03", text: "Calendar integration" },
	{ number: "04", text: "Meeting reminders" },
];

const timeSlots = [
	{ time: "09:00 AM", status: "booked", name: "John Smith" },
	{ time: "10:00 AM", status: "available", name: null },
	{ time: "11:00 AM", status: "booked", name: "Sarah Lee" },
	{ time: "02:00 PM", status: "available", name: null },
	{ time: "03:00 PM", status: "booked", name: "Mike Chen" },
];

function BookingInterfaceDemo() {
	return (
		<motion.div
			className="relative border-2 border-black bg-white shadow-2xl w-full max-w-[420px]"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Header */}
			<div className="border-b-2 border-black bg-black px-6 py-4">
				<p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
					Book a Meeting
				</p>
				<p className="mt-1 text-lg font-bold text-white">
					Tech Solutions Inc.
				</p>
			</div>

			{/* Host Info */}
			<div className="flex items-center gap-4 border-b border-black/10 p-4">
				<div className="flex h-12 w-12 items-center justify-center bg-black text-lg font-bold text-white">
					TS
				</div>
				<div>
					<p className="font-bold text-black">David Wong</p>
					<p className="text-sm text-black/60">Sales Director</p>
				</div>
			</div>

			{/* Date Selector */}
			<div className="border-b border-black/10 p-4">
				<p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
					Select Date
				</p>
				<div className="flex gap-2">
					{["Mon 15", "Tue 16", "Wed 17"].map((day, i) => (
						<button
							key={day}
							type="button"
							className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
								i === 1
									? "bg-black text-white"
									: "border border-black/20 text-black hover:border-black"
							}`}
						>
							{day}
						</button>
					))}
				</div>
			</div>

			{/* Time Slots */}
			<div className="p-4">
				<p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
					Available Slots
				</p>
				<div className="space-y-2">
					{timeSlots.map((slot) => (
						<div
							key={slot.time}
							className={`flex items-center justify-between p-3 ${
								slot.status === "available"
									? "border border-black/20 hover:border-black cursor-pointer"
									: "bg-black/5"
							}`}
						>
							<span
								className={`text-sm font-medium ${
									slot.status === "available" ? "text-black" : "text-black/40"
								}`}
							>
								{slot.time}
							</span>
							{slot.status === "available" ? (
								<span className="text-xs font-bold uppercase tracking-widest text-black/60">
									Available
								</span>
							) : (
								<span className="text-xs text-black/40">{slot.name}</span>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Book Button */}
			<div className="border-t-2 border-black p-4">
				<button
					type="button"
					className="w-full bg-black py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/80"
				>
					Book Selected Slot
				</button>
			</div>
		</motion.div>
	);
}

export default function BusinessMatchingPageClient() {
	return (
		<main>
			<ServiceHero
				title="Business"
				titleOutline="Matching"
				tagline="Meeting Scheduling & Networking"
				description="Connect the right people at your event. Facilitate meaningful connections between attendees, exhibitors, and sponsors with easy meeting bookings."
				heroImage="/images/services/hero/BusinessMatching.webp"
			/>
			<ServiceFeaturesSection
				title="Connect The"
				titleSecondLine="Right People."
				subtitle="Powerful business matching tools to facilitate meaningful connections at your event."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Simple booking experience"
				description="Make it easy for attendees to connect with the right people. Hosts set their availability, attendees pick a time, and both parties get instant confirmations."
				highlights={highlights}
				decorativeLabels={{
					top: "Real-time\navailability",
					bottom: "Instant\nbooking",
				}}
			>
				<BookingInterfaceDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to facilitate meaningful connections?"
				description="Help attendees, exhibitors, and sponsors connect with the right people at your event."
			/>
		</main>
	);
}
