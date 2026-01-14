"use client";

import Phone from "@/components/devices/Phone";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";

const features = [
	{
		id: "01",
		title: "No App Store",
		category: "Access",
		description:
			"Skip the app store entirely. Access everything directly from your web browser.",
	},
	{
		id: "02",
		title: "Add to Home Screen",
		category: "Install",
		description:
			"Install the web app to your home screen for quick access - just like a native app.",
	},
	{
		id: "03",
		title: "Cross-Platform",
		category: "Universal",
		description:
			"Works on any device - iPhone, Android, tablet, or desktop. One link for everyone.",
	},
	{
		id: "04",
		title: "Lightweight",
		category: "Efficient",
		description:
			"No storage space wasted. The web app runs efficiently without eating up your phone memory.",
	},
	{
		id: "05",
		title: "Instant Access",
		category: "Fast",
		description:
			"Just open the link and start using. No downloads, no waiting, no hassle.",
	},
	{
		id: "06",
		title: "Shareable Link",
		category: "Simple",
		description:
			"Share a single URL with all attendees. No platform-specific instructions needed.",
	},
];

const steps = [
	{
		number: "01",
		title: "Open the Link",
		description:
			"Access EventzFlow directly from any web browser - no app store needed.",
	},
	{
		number: "02",
		title: "Add to Home Screen",
		description:
			"Optionally add the web app to your home screen for quick access anytime.",
	},
	{
		number: "03",
		title: "Use All Features",
		description:
			"Enjoy the full platform experience - manage events, check-ins, and more.",
	},
];

const highlights = [
	{ number: "01", text: "Works on any device" },
	{ number: "02", text: "No app store needed" },
	{ number: "03", text: "Add to home screen" },
	{ number: "04", text: "Instant access" },
];

function PWADemo() {
	return (
		<Phone>
			{/* Browser Bar */}
			<div className="border-b border-white/10 bg-[#1a1a1a] px-4 py-2">
				<div className="flex items-center gap-2">
					<div className="flex gap-1">
						<div className="h-2 w-2 rounded-full bg-red-400/80" />
						<div className="h-2 w-2 rounded-full bg-yellow-400/80" />
						<div className="h-2 w-2 rounded-full bg-green-400/80" />
					</div>
					<div className="flex-1 rounded bg-white/10 px-3 py-1">
						<p className="truncate text-[10px] text-white/60">
							eventzflow.com
						</p>
					</div>
				</div>
			</div>

			{/* App Content */}
			<div className="flex flex-1 flex-col bg-gradient-to-b from-[#0a1014] to-black">
				<div className="flex flex-1 flex-col items-center justify-center px-5 py-6">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white">
						<span className="text-2xl font-bold text-black">E</span>
					</div>
					<p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50">
						Welcome to
					</p>
					<p className="mt-1 text-center text-xl font-bold text-white">
						EventzFlow
					</p>
				</div>

				{/* Add to Home Screen Prompt */}
				<div className="border-t border-white/10 bg-[#0a1014] p-4">
					<div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
							<span className="text-base">📲</span>
						</div>
						<div className="flex-1">
							<p className="font-bold text-xs text-white">
								Add to Home Screen
							</p>
							<p className="text-[10px] text-white/50">For quick access</p>
						</div>
					</div>

					<div className="mt-3 grid grid-cols-3 gap-2">
						<div className="rounded border border-white/10 bg-white/5 p-2 text-center">
							<span className="text-sm">📋</span>
							<p className="mt-1 text-[8px] text-white/50">Events</p>
						</div>
						<div className="rounded border border-white/10 bg-white/5 p-2 text-center">
							<span className="text-sm">✓</span>
							<p className="mt-1 text-[8px] text-white/50">Check-in</p>
						</div>
						<div className="rounded border border-white/10 bg-white/5 p-2 text-center">
							<span className="text-sm">📊</span>
							<p className="mt-1 text-[8px] text-white/50">Reports</p>
						</div>
					</div>

					<p className="mt-3 text-center text-[9px] text-white/30">
						Full features • No download
					</p>
				</div>
			</div>
		</Phone>
	);
}

export default function ApplessWebPortalPageClient() {
	return (
		<main>
			<ServiceHero
				title="Appless"
				titleOutline="Portal"
				tagline="No App Download Needed"
				description="EventzFlow works directly in your browser as a Progressive Web App. Access all features instantly - no app store, no downloads, no waiting."
				heroImage="/images/services/hero/ApplessWebPortal.webp"
			/>
			<ServiceFeaturesSection
				title="App Experience"
				titleSecondLine="Without The App."
				subtitle="Access all EventzFlow features directly from your browser. No downloads, no updates, no storage space needed."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Mobile-first experience"
				description="EventzFlow runs directly in your browser - no app downloads required. Just open the link and you have full access to all features. Add it to your home screen for an app-like experience."
				highlights={highlights}
				decorativeLabels={{
					top: "Web\nbased",
					bottom: "PWA\nready",
				}}
			>
				<PWADemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to go app-free?"
				description="Give attendees instant access to your event - no downloads, no friction, just a simple web link."
			/>
		</main>
	);
}
