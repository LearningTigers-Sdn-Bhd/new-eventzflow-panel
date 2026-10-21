"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ServiceCTASection from "@/components/pages/services/ServiceCTASection";
import ServiceFeaturesSection from "@/components/pages/services/ServiceFeaturesSection";
import ServiceHero from "@/components/pages/services/ServiceHero";
import ServiceHowItWorksSection from "@/components/pages/services/ServiceHowItWorksSection";
import ServiceShowcaseSection from "@/components/pages/services/ServiceShowcaseSection";

const features = [
	{
		id: "01",
		title: "Visual Floor Plan",
		category: "Layout",
		description:
			"Upload your venue floor plan and place tables, stages and objects on top of it.",
	},
	{
		id: "02",
		title: "Drag & Drop Seating",
		category: "Seating",
		description:
			"Drag guests from your attendee list straight onto a table. Move or unseat in one click.",
	},
	{
		id: "03",
		title: "Auto Distribution",
		category: "Automation",
		description:
			"Let the system spread unseated guests across tables with open seats.",
	},
	{
		id: "04",
		title: "Group Seating",
		category: "Groups",
		description:
			"Create groups such as families or delegations and seat everyone together.",
	},
	{
		id: "05",
		title: "VIP Table Locking",
		category: "Control",
		description:
			"Lock a table so assignments cannot be changed by accident on the day.",
	},
	{
		id: "06",
		title: "Arrival Tracking",
		category: "On-site",
		description:
			"Mark guests as arrived and add assignment notes for your ushers and crew.",
	},
];

const steps = [
	{
		number: "01",
		title: "Build Your Layout",
		description:
			"Upload the venue plan and add tables, stages and custom objects with the exact capacity you need.",
	},
	{
		number: "02",
		title: "Seat Your Guests",
		description:
			"Drag guests onto tables, seat whole groups at once, or auto-distribute the rest.",
	},
	{
		number: "03",
		title: "Run The Event",
		description:
			"Guests find their table from their own phone while your crew tracks arrivals live.",
	},
];

const highlights = [
	{ number: "01", text: "Drag & drop assignments" },
	{ number: "02", text: "Seat whole groups together" },
	{ number: "03", text: "Locked VIP tables" },
	{ number: "04", text: "Guests find their own table" },
];

const guests = ["Aisha R.", "Daniel T.", "Mei Ling", "Hafiz A."];
const TABLE_SEATS = 6;

function SeatingDemo() {
	const [seated, setSeated] = useState(2);
	const next = guests[seated - 2];

	return (
		<motion.div
			className="flex w-full max-w-[420px] flex-col items-center"
			whileHover={{ scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<div className="relative mb-6 flex aspect-square w-full items-center justify-center border-2 border-black bg-muted/60">
				<div className="relative h-56 w-56">
					<div className="absolute inset-[72px] flex items-center justify-center rounded-full border-2 border-black bg-white font-black text-lg">
						T1
					</div>
					{Array.from({ length: TABLE_SEATS }, (_, i) => {
						const angle = (i / TABLE_SEATS) * 2 * Math.PI - Math.PI / 2;
						const filled = i < seated;
						return (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed seat positions
								key={i}
								style={{
									left: `calc(50% + ${Math.cos(angle) * 100}px - 16px)`,
									top: `calc(50% + ${Math.sin(angle) * 100}px - 16px)`,
								}}
								className={`absolute h-8 w-8 rounded-full border-2 border-black transition-colors ${
									filled ? "bg-black" : "bg-white"
								}`}
							/>
						);
					})}
				</div>
				<p className="absolute bottom-4 font-bold text-xs uppercase tracking-widest">
					{seated}/{TABLE_SEATS} seated
				</p>
			</div>
			<button
				type="button"
				disabled={seated >= TABLE_SEATS}
				onClick={() => setSeated((n) => Math.min(n + 1, TABLE_SEATS))}
				className="w-full bg-black px-4 py-3 font-bold text-sm text-white uppercase tracking-wider transition-opacity disabled:opacity-40"
			>
				{next ? `Seat ${next}` : "Table full"}
			</button>
			{seated > 2 && (
				<button
					type="button"
					onClick={() => setSeated(2)}
					className="mt-2 text-black/60 text-xs uppercase tracking-widest hover:text-black"
				>
					Reset
				</button>
			)}
		</motion.div>
	);
}

export default function TableSeatingPageClient() {
	return (
		<main>
			<ServiceHero
				title="Table"
				titleOutline="Seating"
				tagline="Seating Plans Made Simple"
				description="Design your floor plan, seat every guest by drag and drop, and keep VIP and group seating under control from planning to the night itself."
				heroImage="/images/services/hero/TableSeatingBanquet.webp"
			/>
			<ServiceFeaturesSection
				title="Every Guest"
				titleSecondLine="In Place."
				subtitle="Seating tools built for galas, dinners and conferences, from the first draft to the last late arrival."
				features={features}
			/>
			<ServiceHowItWorksSection title="Three simple steps" steps={steps} />
			<ServiceShowcaseSection
				label="Try It"
				title="Seat guests in seconds"
				description="Build the plan once, then fill it by dragging guests onto tables. Groups stay together, VIP tables stay locked, and changes show up for your whole team straight away."
				highlights={highlights}
				decorativeLabels={{
					top: "Drag &\ndrop",
					bottom: "Live\nseating",
				}}
			>
				<SeatingDemo />
			</ServiceShowcaseSection>
			<ServiceCTASection
				title="Ready to simplify your seating?"
				description="Plan the room, seat your guests and handle last-minute changes without a spreadsheet."
			/>
		</main>
	);
}
