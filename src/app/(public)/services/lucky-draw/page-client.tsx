"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";

const features = [
	{
		id: "01",
		title: "Multiple Draw Styles",
		category: "Styles",
		description:
			"Choose from spinning wheel, slot machine, or mystery box animations.",
	},
	{
		id: "02",
		title: "Custom Themes",
		category: "Themes",
		description:
			"Pick from wireframe, colorful, or cartoon themes to match your event.",
	},
	{
		id: "03",
		title: "Multiple Sessions",
		category: "Sessions",
		description:
			"Run separate draw sessions for different prizes or event segments.",
	},
	{
		id: "04",
		title: "Gift Management",
		category: "Prizes",
		description:
			"Set up multiple prizes with custom winner counts for each gift.",
	},
	{
		id: "05",
		title: "Participant Control",
		category: "Control",
		description:
			"Draw from registered attendees or visitors with exclusion options.",
	},
	{
		id: "06",
		title: "Custom Branding",
		category: "Brand",
		description:
			"Add your logo and custom backgrounds to match your event theme.",
	},
];

const steps = [
	{
		number: "01",
		title: "Set Up Prizes",
		description:
			"Create your lucky draw session and add prizes with winner counts for each gift.",
	},
	{
		number: "02",
		title: "Choose Your Style",
		description:
			"Pick a draw animation — spinning wheel, slot machine, or mystery box.",
	},
	{
		number: "03",
		title: "Draw Winners",
		description:
			"Run the draw live at your event and celebrate with your winners.",
	},
];

const highlights = [
	{ number: "01", text: "Animated draw experience" },
	{ number: "02", text: "Multiple prize tiers" },
	{ number: "03", text: "Live winner announcements" },
	{ number: "04", text: "Full customization options" },
];

const drawStyles = [
	{
		id: "wheel",
		name: "Spinning Wheel",
		description: "Classic prize wheel",
		image: "/images/services/lucky-draw/wheel.webp",
	},
	{
		id: "slot",
		name: "Slot Machine",
		description: "Vegas-style slots",
		image: "/images/services/lucky-draw/slot.webp",
	},
	{
		id: "box",
		name: "Mystery Box",
		description: "Surprise reveal",
		image: "/images/services/lucky-draw/box.webp",
	},
];

function DrawStylesDemo() {
	const [selectedStyle, setSelectedStyle] = useState(drawStyles[0]);

	return (
		<motion.div
			className="flex w-full flex-col items-center"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			{/* Preview Image */}
			<div className="relative mb-6 aspect-square w-full max-w-[400px] overflow-hidden border-2 border-black bg-muted/60">
				<Image
					src={selectedStyle.image}
					alt={selectedStyle.name}
					fill
					priority
					sizes="(max-width: 768px) 100vw, 400px"
					className="object-contain p-4"
				/>
			</div>

			{/* Style Selector */}
			<div className="grid w-full max-w-[500px] grid-cols-3 gap-2">
				{drawStyles.map((style) => (
					<button
						key={style.id}
						type="button"
						onClick={() => setSelectedStyle(style)}
						className={`px-4 py-3 text-center font-bold text-sm uppercase tracking-wider transition-all ${
							selectedStyle.id === style.id
								? "bg-black text-white"
								: "border border-black/20 bg-white text-black hover:border-black"
						}`}
					>
						{style.name}
					</button>
				))}
			</div>
		</motion.div>
	);
}

export default function LuckyDrawPageClient() {
	return (
		<main>
			<ServiceHero
				title="Lucky"
				titleOutline="Draw"
				tagline="Interactive Giveaways & Prizes"
				description="Engage your audience with exciting lucky draws and giveaways. Run multiple sessions, track winners, and create memorable moments at your event."
				heroImage="/images/services/hero/LuckyDraw.webp"
			/>
			<ServiceFeaturesSection
				title="Create Exciting"
				titleSecondLine="Moments."
				subtitle="Powerful lucky draw tools to engage your audience and create memorable giveaway experiences."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Live Demo"
				title="Exciting draw animations"
				description="Choose from three exciting draw styles to match your event vibe. Each animation is designed to build anticipation and create memorable moments for your attendees."
				highlights={highlights}
				decorativeLabels={{
					top: "Multiple\nstyles",
					bottom: "Live\ndraws",
				}}
			>
				<DrawStylesDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to add excitement to your event?"
				description="Engage your audience with exciting lucky draws and giveaways that create memorable moments."
			/>
		</main>
	);
}
