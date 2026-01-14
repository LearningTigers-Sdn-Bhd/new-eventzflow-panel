"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type React from "react";

const capabilities = [
	{
		id: "01",
		title: "WhatsApp Based Registration",
		subtitle: "Signature Capability",
		description:
			"Seamless event registration. Enable attendees to sign up, receive tickets, and get real-time updates instantly through WhatsApp.",
		isMain: true,
	},
	{
		id: "02",
		title: "QR Code Check-In",
		subtitle: "Entry System",
		description: "Fast contactless entry with real-time tracking.",
		isBlue: false,
	},
	{
		id: "03",
		title: "Instant Badge Printing",
		subtitle: "On-Demand",
		description: "Instant badge printing on-demand.",
		isBlue: true,
	},
	{
		id: "04",
		title: "Business Matching",
		subtitle: "Networking",
		description: "Connect attendees based on interests and business goals.",
		isBlue: false,
	},
	{
		id: "05",
		title: "Lucky Draw",
		subtitle: "Engagement",
		description: "Engage your audience with interactive lucky draw and giveaways.",
		isBlue: true,
	},
	{
		id: "06",
		title: "Exhibitor Management",
		subtitle: "Management",
		description: "Manage your exhibitors and leads with ease.",
		isBlue: false,
	},
	{
		id: "07",
		title: "Voucher Redemption",
		subtitle: "Digital Value",
		description: "Distribute and track vouchers with ease.",
		isBlue: true,
	},
	{
		id: "08",
		title: "Analytics Dashboard",
		subtitle: "Insights",
		description: "Real-time analytics and insights to optimize your event.",
		isBlue: false,
	},
];

const Stripes = () => (
	<div
		className="h-full w-full"
		style={{
			backgroundImage:
				"linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
			backgroundSize: "20px 20px",
			opacity: 0.15,
		}}
	/>
);

const CapabilitiesSection: React.FC = () => {
	return (
		<section id="capabilities" className="bg-blue-background py-12 md:py-24">
			<div className="mx-auto max-w-[1600px] px-4 md:px-8">
				<div className="flex flex-col lg:flex-row">
					{/* ------------------- SIDEBAR ------------------- */}
					<div className="relative flex w-full flex-col border-black border-4 lg:border-0 lg:w-48 lg:border-r-4">
						{/* Top Thick Line (Accent) */}
						<div className="h-4 w-32 bg-black" />

						{/* Rotated Text */}
						<div className="flex h-full items-center justify-center p-6 lg:items-start lg:justify-center lg:p-0 lg:pt-[500px]">
							<h2 className="whitespace-nowrap font-black text-4xl sm:text-5xl tracking-tighter text-black lg:origin-center lg:-rotate-90 lg:text-8xl xl:text-9xl">
								OUR SOLUTIONS
							</h2>
						</div>

						{/* Diagonal Stripes (Bottom) */}
						<div className="mt-auto h-32 w-full border-t-4 border-black lg:h-64">
							<Stripes />
						</div>
					</div>

					{/* ------------------- MAIN GRID ------------------- */}
					<div className="flex-1">
						{/* Top Border for the whole grid area */}
						<div className="hidden h-4 w-full border-b-4 border-black lg:block" />

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{capabilities.map((item, i) => {
								const isMain = item.isMain;
								// @ts-ignore
								const isBlue = item.isBlue;

								// Layout Logic:
								// Card 01 (Main) spans 2x2
								// Others are 1x1
								const spanClass = isMain
									? "md:col-span-2 md:row-span-2"
									: "col-span-1 row-span-1";

								// Borders:
								const borderClass =
									"border-b-4 border-r-4 border-l-4 lg:border-l-0 border-black";

								// Background Logic
								const bgClass = isBlue ? "bg-brand-blue" : "bg-white";

								return (
									<motion.div
										key={item.id}
										initial={{ opacity: 0 }}
										whileInView={{ opacity: 1 }}
										viewport={{ once: true }}
										transition={{ delay: i * 0.1, duration: 0.5 }}
										className={`group relative flex flex-col justify-between p-6 ${bgClass} ${spanClass} ${borderClass}`}
									>
										{/* --- HEADER PART --- */}
										<div className="relative z-10 flex items-start justify-between">
											<div>
												<span
													className={`block font-black text-6xl sm:text-7xl tracking-tighter text-black md:text-8xl transition-colors duration-300 ${!isBlue && !isMain ? "group-hover:text-brand-green" : ""}`}
												>
													{item.id}
												</span>
												<h3 className="mt-2 font-bold text-lg sm:text-xl uppercase leading-none tracking-tight text-black md:text-2xl">
													{item.title}
												</h3>
											</div>

											{/* Technical Label (Top Right) */}
											<div
												className={`hidden text-right font-mono text-xs uppercase md:block ${isBlue ? "text-black/60" : "text-gray-500"}`}
											>
												{item.subtitle}
											</div>
										</div>

										{/* --- SEPARATOR --- */}
										{!isMain && (
											<div
												className={`my-6 h-1 w-full ${isBlue ? "bg-black/20" : "bg-black"}`}
											/>
										)}

										{/* --- CONTENT PART --- */}
										<div className="relative mt-auto">
											{isMain ? (
												// Main Card Content (The "Red Block" equivalent)
												<div className="mt-8 relative h-64 w-full overflow-hidden bg-brand-green md:h-96">
													{/* Decorative "Cuts" or Shapes */}
													<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

													<div className="relative flex h-full flex-col justify-end p-6 md:p-10">
														<MessageCircle className="mb-4 h-12 w-12 text-white" />
														<p className="max-w-lg font-bold text-xl sm:text-2xl text-white md:text-4xl leading-tight">
															{item.description}
														</p>
														<div className="mt-6 flex items-center gap-2 font-mono text-sm uppercase text-white/80">
															<div className="h-2 w-2 bg-white animate-pulse" />
															Flagship Solution
														</div>
													</div>
												</div>
											) : (
												// Standard Card Content
												<div className="flex flex-col gap-4">
													<p
														className={`font-medium text-sm md:text-base leading-relaxed ${isBlue ? "text-black/80" : "text-gray-500"}`}
													>
														{item.description}
													</p>

													{/* Reference Footer */}
													<div
														className={`mt-4 flex items-end justify-between border-t pt-4 ${isBlue ? "border-black/10" : "border-gray-200"}`}
													>
														<span
															className={`font-mono text-[10px] uppercase ${isBlue ? "text-black/50" : "text-gray-400"}`}
														>
															SOLUTION. {item.id}
														</span>
														<ArrowUpRight
															className={`h-6 w-6 text-black transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${!isBlue ? "group-hover:text-brand-green" : ""}`}
														/>
													</div>
												</div>
											)}
										</div>
									</motion.div>
								);
							})}

							{/* Filler/Decorative Block to close the grid if needed */}
							<div className="border-b-4 border-r-4 border-l-4 lg:border-l-0 border-black bg-gray-50 p-6 flex flex-col justify-end">
								<span className="font-black text-9xl text-brand-blue/20">
									///
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CapabilitiesSection;
