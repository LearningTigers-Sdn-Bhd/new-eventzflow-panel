"use client";

import { motion } from "framer-motion";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";

const features = [
	{
		id: "01",
		title: "Easy Registration",
		category: "Capture",
		description:
			"Add attendees manually or through your event portal with all the details you need.",
	},
	{
		id: "02",
		title: "Flexible Forms",
		category: "Customize",
		description:
			"Collect the specific information you need with customizable registration fields.",
	},
	{
		id: "03",
		title: "Unique QR Codes",
		category: "Identify",
		description:
			"Each attendee gets a personal QR code for quick check-in and identification.",
	},
	{
		id: "04",
		title: "Spreadsheet Import",
		category: "Scale",
		description:
			"Upload your guest list from Excel or CSV files to add hundreds of attendees at once.",
	},
	{
		id: "05",
		title: "Booth Visits",
		category: "Track",
		description:
			"Track which exhibitor booths your attendees visited during the event.",
	},
	{
		id: "06",
		title: "Complete Profiles",
		category: "Manage",
		description:
			"View all attendee information including contact details and event activity.",
	},
];

const steps = [
	{
		number: "01",
		title: "Register Attendees",
		description:
			"Import attendee lists or let them register through WhatsApp automation with custom fields.",
	},
	{
		number: "02",
		title: "Track Participation",
		description:
			"Monitor check-ins, session attendance, and exhibitor interactions in real-time.",
	},
	{
		number: "03",
		title: "Manage Profiles",
		description:
			"Access complete attendee information and activity history from a central dashboard.",
	},
];

const highlights = [
	{ number: "01", text: "Custom registration fields" },
	{ number: "02", text: "Unique QR codes per attendee" },
	{ number: "03", text: "Booth visit tracking" },
	{ number: "04", text: "Bulk import support" },
];

function AttendeeProfileDemo() {
	return (
		<motion.div
			className="relative w-full max-w-[420px] border-2 border-black bg-white shadow-2xl"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Header */}
			<div className="border-black border-b-2 bg-black px-6 py-4">
				<p className="font-bold text-white/60 text-xs uppercase tracking-[0.3em]">
					Attendee Profile
				</p>
				<p className="mt-1 font-bold text-lg text-white">Tech Summit 2025</p>
			</div>

			{/* Attendee Info */}
			<div className="flex items-center gap-4 border-black/10 border-b p-4">
				<div className="flex h-14 w-14 items-center justify-center bg-black font-bold text-white text-xl">
					JD
				</div>
				<div>
					<p className="font-bold text-black">Jane Doe</p>
					<p className="text-black/60 text-sm">Senior Developer</p>
					<p className="text-black/40 text-xs">Acme Corporation</p>
				</div>
			</div>

			{/* Contact Details */}
			<div className="p-4">
				<p className="mb-3 font-bold text-black/40 text-xs uppercase tracking-widest">
					Contact Details
				</p>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Email</span>
						<span className="font-medium text-black text-sm">
							jane@acme.com
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Phone</span>
						<span className="font-medium text-black text-sm">
							+60 12-345 6789
						</span>
					</div>
				</div>
			</div>

			{/* Custom Fields */}
			<div className="border-black/10 border-t p-4">
				<p className="mb-3 font-bold text-black/40 text-xs uppercase tracking-widest">
					Additional Info
				</p>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Company</span>
						<span className="font-medium text-black text-sm">
							Acme Corporation
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Role</span>
						<span className="font-medium text-black text-sm">Speaker</span>
					</div>
				</div>
			</div>

			{/* Status Badge */}
			<div className="border-black border-t-2 p-4">
				<div className="flex items-center justify-between">
					<span className="font-medium text-black text-sm">Status</span>
					<span className="bg-black px-3 py-1 font-bold text-white text-xs uppercase tracking-widest">
						Checked In
					</span>
				</div>
			</div>
		</motion.div>
	);
}

export default function AttendeeManagementPageClient() {
	return (
		<main>
			<ServiceHero
				title="Attendee"
				titleOutline="Management"
				tagline="Complete Visitor & Guest Control"
				description="Manage your event attendees with ease. Register guests, import from spreadsheets, and access complete profiles with custom fields and unique QR codes."
				heroImage="/images/services/hero/AttendeeManagement.webp"
			/>
			<ServiceFeaturesSection
				title="Manage Attendees"
				titleSecondLine="Effortlessly."
				subtitle="Comprehensive attendee management tools designed to help you track, organize, and engage with every guest."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Complete attendee profiles"
				description="Access complete attendee information at a glance. View contact details, custom fields, and registration status all from a central dashboard."
				highlights={highlights}
				decorativeLabels={{
					top: "Complete\nprofiles",
					bottom: "Custom\nfields",
				}}
			>
				<AttendeeProfileDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to streamline your attendee management?"
				description="Manage registrations, track check-ins, and access complete attendee profiles from one central dashboard."
			/>
		</main>
	);
}
