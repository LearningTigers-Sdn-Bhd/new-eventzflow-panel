"use client";

import { motion } from "framer-motion";
import type React from "react";

const capabilities = [
	{
		title: "WHATSAPP BOT REGISTRATION",
		description:
			"Let attendees register via WhatsApp with automated confirmations and reminders.",
	},
	{
		title: "QR CODE CHECK-IN",
		description:
			"Fast, contactless entry with real-time attendance tracking.",
	},
	{
		title: "INSTANT BADGE PRINTING",
		description:
			"Print professional badges on-demand as attendees check in.",
	},
	{
		title: "BUSINESS MATCHING",
		description:
			"Connect the right people with AI-powered meeting recommendations.",
	},
	{
		title: "LUCKY DRAW SYSTEM",
		description:
			"Engage your audience with interactive lucky draws and giveaways.",
	},
	{
		title: "EXHIBITOR MANAGEMENT",
		description:
			"Give exhibitors their own portal to manage leads and booth details.",
	},
	{
		title: "VOUCHER REDEMPTION",
		description:
			"Distribute and track digital vouchers for sponsors and attendees.",
	},
	{
		title: "ANALYTICS DASHBOARD",
		description:
			"See real-time data on attendance, engagement, and conversions.",
	},
	{
		title: "VISITOR TRACKING",
		description:
			"Track booth visits and session attendance with RFID or QR scanning.",
	},
];

const CapabilitiesSection: React.FC = () => {
	return (
		<section className="bg-black px-6 py-30 md:px-12">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-20 flex items-end justify-between">
					<div className="max-w-2xl">
						<h2 className="mb-6 font-black text-6xl tracking-tighter text-white md:text-8xl">
							OUR
							<br />
							CAPABILITIES
						</h2>
						<p className="text-xl text-white/60">
							Everything you need to run seamless events, all in one platform.
						</p>
					</div>
					<div className="hidden border-b border-white/40 pb-2 font-bold text-xs tracking-widest text-white/40 md:block">
						01 — 09 / FEATURES
					</div>
				</div>

				{/* Capabilities Grid */}
				<div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
					{capabilities.map((capability, i) => {
						const isWhiteCard = i % 2 === 1;
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{
									y: -12,
									transition: { duration: 0.3, ease: "easeOut" },
								}}
								viewport={{ once: true }}
								transition={{
									duration: 0.8,
									delay: i * 0.05,
									ease: [0.16, 1, 0.3, 1],
								}}
								className={`group relative flex min-h-[280px] flex-col justify-between border p-10 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl ${
									isWhiteCard
										? "border-black/20 bg-white hover:border-black"
										: "border-white/20 bg-black hover:border-white"
								}`}
							>
								<div className="relative z-10">
									<span
										className={`font-bold text-xs tracking-widest ${
											isWhiteCard ? "text-black/40" : "text-white/40"
										}`}
									>
										0{i + 1}
									</span>
									<h3
										className={`mt-6 font-black text-2xl leading-tight tracking-tight ${
											isWhiteCard ? "text-black" : "text-white"
										}`}
									>
										{capability.title}
									</h3>
								</div>
								<p
									className={`relative z-10 text-sm leading-relaxed ${
										isWhiteCard ? "text-black/60" : "text-white/60"
									}`}
								>
									{capability.description}
								</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default CapabilitiesSection;
