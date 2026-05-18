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
		title: "Exhibitor Profiles",
		category: "Profiles",
		description:
			"Each exhibitor gets a complete profile with company details, logo, and contact information.",
	},
	{
		id: "02",
		title: "Booth Setup",
		category: "Configure",
		description:
			"Configure booth numbers, types, fascia names, and dimensions for every exhibitor.",
	},
	{
		id: "03",
		title: "Team Members",
		category: "Manage",
		description:
			"Exhibitors can add their team members with configurable limits per booth.",
	},
	{
		id: "04",
		title: "Easy Invitations",
		category: "Invite",
		description:
			"Generate invite links so exhibitors can self-register and set up their own profiles.",
	},
	{
		id: "05",
		title: "Exhibitor Dashboard",
		category: "Portal",
		description:
			"Give exhibitors their own portal to view stats and manage their booth information.",
	},
	{
		id: "06",
		title: "Visitor Stamps",
		category: "Track",
		description:
			"Track which attendees visited each booth with digital stamp collection.",
	},
];

const steps = [
	{
		number: "01",
		title: "Invite Exhibitors",
		description:
			"Generate invite links and share them with exhibitors to self-register for your event.",
	},
	{
		number: "02",
		title: "Setup Booths",
		description:
			"Exhibitors complete their profiles, booth details, and add team members.",
	},
	{
		number: "03",
		title: "Track Engagement",
		description:
			"Monitor booth visits and exhibitor activity through the dashboard.",
	},
];

const highlights = [
	{ number: "01", text: "Self-registration via invite link" },
	{ number: "02", text: "Complete booth information" },
	{ number: "03", text: "Team member management" },
	{ number: "04", text: "Visitor stamp tracking" },
];

function ExhibitorPortalDemo() {
	return (
		<motion.div
			className="relative w-full max-w-[420px] border-2 border-black bg-white shadow-2xl"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Header */}
			<div className="border-black border-b-2 bg-black px-6 py-4">
				<p className="font-bold text-white/60 text-xs uppercase tracking-[0.3em]">
					Exhibitor Portal
				</p>
				<p className="mt-1 font-bold text-lg text-white">Tech Expo 2025</p>
			</div>

			{/* Company Info */}
			<div className="flex items-center gap-4 border-black/10 border-b p-4">
				<div className="flex h-14 w-14 items-center justify-center bg-black font-bold text-white text-xl">
					TS
				</div>
				<div>
					<p className="font-bold text-black">Tech Solutions Inc.</p>
					<p className="text-black/60 text-sm">Software & Cloud</p>
				</div>
			</div>

			{/* Booth Details */}
			<div className="border-black/10 border-b p-4">
				<p className="mb-3 font-bold text-black/40 text-xs uppercase tracking-widest">
					Booth Information
				</p>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Booth No.</span>
						<span className="font-medium text-black text-sm">A-101</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Type</span>
						<span className="font-medium text-black text-sm">Shell Scheme</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-black/60 text-sm">Fascia</span>
						<span className="font-medium text-black text-sm">
							Tech Solutions
						</span>
					</div>
				</div>
			</div>

			{/* Team Members */}
			<div className="p-4">
				<p className="mb-3 font-bold text-black/40 text-xs uppercase tracking-widest">
					Team Members (3/5)
				</p>
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center bg-black font-bold text-white text-xs">
							JD
						</div>
						<span className="text-black text-sm">John Doe</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center bg-black font-bold text-white text-xs">
							SL
						</div>
						<span className="text-black text-sm">Sarah Lee</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center bg-black font-bold text-white text-xs">
							MC
						</div>
						<span className="text-black text-sm">Mike Chen</span>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="border-black border-t-2 p-4">
				<div className="flex items-center justify-between">
					<span className="font-medium text-black text-sm">Booth Visits</span>
					<span className="bg-black px-3 py-1 font-bold text-white text-xs uppercase tracking-widest">
						127 Stamps
					</span>
				</div>
			</div>
		</motion.div>
	);
}

export default function ExhibitorManagementPageClient() {
	return (
		<main>
			<ServiceHero
				title="Exhibitor"
				titleOutline="Management"
				tagline="Booth Portal & Team Management"
				description="Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement at your event."
				heroImage="/images/services/hero/ExhibitorManagement.webp"
			/>
			<ServiceFeaturesSection
				title="Empower Your"
				titleSecondLine="Exhibitors."
				subtitle="Complete exhibitor management tools to help exhibitors set up booths, manage teams, and track engagement."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Exhibitor booth portal"
				description="Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement. Self-service setup means less work for organizers."
				highlights={highlights}
				decorativeLabels={{
					top: "Booth\ndetails",
					bottom: "Team\nmembers",
				}}
			>
				<ExhibitorPortalDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to empower your exhibitors?"
				description="Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement."
			/>
		</main>
	);
}
