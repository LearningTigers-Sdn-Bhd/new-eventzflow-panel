"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	BarChart3,
	Database,
	Presentation,
	QrCode,
	Rocket,
	Scan,
	Store,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";

const ExhibitionStall: React.FC = () => {
	// EventzFlow Brand Colors (matching HeroSection)
	const colors = {
		primary: "#22C55E", // EventzFlow Green
		blue: "#3B82F6", // EventzFlow Blue
		lightGreen: "#4ADE80", // Light Green accent
	};

	const features = [
		{
			icon: QrCode,
			title: "Distinctive QR Code Per Booth",
			description:
				"Each exhibition booth receives its own unique QR code, enabling seamless visitor engagement and effortless interaction with exhibitors",
			color: "from-blue-500 to-cyan-500",
		},
		{
			icon: Scan,
			title: "Quick Access to Product Details",
			description:
				"Attendees scan booth QR codes for immediate access to comprehensive product specifications, digital brochures, and marketing content",
			color: "from-green-500 to-emerald-500",
		},
		{
			icon: Users,
			title: "Intelligent Lead Collection",
			description:
				"Visitor contact details are seamlessly captured when scanning QR codes, allowing exhibitors to build qualified prospect lists efficiently",
			color: "from-purple-500 to-pink-500",
		},
		{
			icon: BarChart3,
			title: "Live Exhibition Insights",
			description:
				"Access real-time metrics including booth visits, scan activity, peak engagement periods, and detailed visitor interaction patterns",
			color: "from-orange-500 to-red-500",
		},
	];

	const useCases = [
		{
			title: "Trade Shows & Expos",
			description:
				"Perfect for large-scale exhibitions where exhibitors need to capture and manage visitor leads efficiently",
			icon: Store,
			stats: "500+ Exhibitors",
		},
		{
			title: "Product Launches",
			description:
				"Enable brands to capture interested customer data during product demonstration events",
			icon: Rocket,
			stats: "1000+ Leads",
		},
		{
			title: "Industry Conferences",
			description:
				"Combine event ticketing with exhibitor stall management for seamless conference exhibitions",
			icon: Presentation,
			stats: "200+ Booths",
		},
	];

	return (
		<section
			id="exhibition-stall"
			className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
		>
			{/* Background Effects */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute top-1/4 right-10 h-96 w-96 rounded-full bg-gradient-to-r from-primary/15 to-ring/15 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-1/4 left-10 h-80 w-80 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.4, 0.6, 0.4],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</div>

			<div className="relative z-10 mx-auto max-w-7xl">
				{/* Section Header */}
				<motion.div
					className="mb-12 text-center sm:mb-16"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.4 }}
				>
					<motion.div
						className="mb-4 inline-flex items-center space-x-2 rounded-full border bg-background/60 px-3 py-2 shadow-2xl backdrop-blur-md sm:mb-6 sm:px-4 sm:py-2"
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<QrCode className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
						<span className="font-medium text-foreground text-xs tracking-wide sm:text-sm">
							Smart QR Exhibition System
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 px-4 font-bold text-2xl text-foreground leading-tight sm:mb-6 sm:px-0 sm:text-3xl md:text-4xl lg:text-5xl"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.4, delay: 0.15 }}
					>
						Turn Every Exhibition Visit Into
						<br />
						<span
							className="bg-clip-text text-transparent"
							style={{
								backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`,
							}}
						>
							Qualified Leads with Smart QR
						</span>
					</motion.h2>

					<motion.p
						className="mx-auto max-w-3xl px-4 text-base text-muted-foreground leading-relaxed sm:px-0 sm:text-lg lg:text-xl"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.4, delay: 0.2 }}
					>
						Say goodbye to manual contact collection! Empower your booth with
						<span style={{ color: colors.primary }} className="font-semibold">
							{" "}
							intelligent QR technology
						</span>{" "}
						- visitors get instant access to your product catalogs and
						promotional content while you automatically capture every lead
						without lifting a finger
					</motion.p>
				</motion.div>

				{/* Features Grid */}
				<motion.div
					className="mb-12 grid grid-cols-1 gap-4 sm:mb-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					{features.map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<motion.div
								key={index}
								className="group rounded-xl border bg-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary sm:p-6"
								initial={{ opacity: 0, y: 20, scale: 0.95 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: false, amount: 0.05 }}
								transition={{
									duration: 0.25,
									delay: 0.15 + index * 0.03,
									type: "spring",
									stiffness: 120,
								}}
								whileHover={{
									scale: 1.02,
									y: -5,
									transition: { duration: 0.2 },
								}}
							>
								<div
									className={`h-12 w-12 bg-gradient-to-br ${feature.color} mb-4 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110`}
								>
									<IconComponent className="h-6 w-6 text-foreground" />
								</div>
								<h3 className="mb-2 font-bold text-foreground text-lg transition-colors duration-300 group-hover:text-primary">
									{feature.title}
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{feature.description}
								</p>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Use Cases */}
				<motion.div
					className="mb-12 sm:mb-16"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.4, delay: 0.3 }}
				>
					<h3 className="mb-8 text-center font-bold text-2xl text-foreground sm:text-3xl">
						Perfect For Every
						<span
							className="bg-clip-text text-transparent"
							style={{
								backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`,
							}}
						>
							{" "}
							Exhibition Type
						</span>
					</h3>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						{useCases.map((useCase, index) => {
							const IconComponent = useCase.icon;
							return (
								<motion.div
									key={index}
									className="rounded-xl border bg-gradient-to-br from-background/80 to-background/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: false, amount: 0.05 }}
									transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
									whileHover={{ scale: 1.05, y: -5 }}
								>
									<div className="mb-4 flex items-center justify-between">
										<IconComponent className="h-10 w-10 text-primary" />
										<span className="font-bold text-primary text-sm">
											{useCase.stats}
										</span>
									</div>
									<h4 className="mb-2 font-bold text-foreground text-xl">
										{useCase.title}
									</h4>
									<p className="text-muted-foreground text-sm">
										{useCase.description}
									</p>
								</motion.div>
							);
						})}
					</div>
				</motion.div>

				{/* Stats */}
				<motion.div
					className="mb-12 grid grid-cols-2 gap-4 sm:mb-16 sm:gap-6 md:grid-cols-4"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.3, delay: 0.4 }}
				>
					{[
						{ icon: Scan, value: "Instant", label: "Product Info Access" },
						{ icon: Database, value: "Auto", label: "Lead Capture" },
						{ icon: BarChart3, value: "Real-time", label: "Analytics" },
						{ icon: QrCode, value: "Digital", label: "Catalogs" },
					].map((stat, index) => {
						const IconComponent = stat.icon;
						return (
							<motion.div
								key={index}
								className="rounded-xl border bg-background/40 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-background/60"
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: false, amount: 0.05 }}
								transition={{ duration: 0.25, delay: 0.45 + index * 0.03 }}
								whileHover={{ scale: 1.05 }}
							>
								<IconComponent className="mx-auto mb-2 h-6 w-6 text-primary" />
								<div className="mb-1 font-bold text-2xl text-foreground">
									{stat.value}
								</div>
								<div className="text-muted-foreground text-sm">
									{stat.label}
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				{/* CTA */}
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.4, delay: 0.5 }}
				>
					<Link href={"/auth?mode=login" as Route}>
						<motion.button
							className="group mx-auto flex items-center justify-center space-x-3 rounded-xl px-8 py-4 font-semibold text-lg text-primary-foreground transition-all duration-300 hover:shadow-2xl"
							style={{
								background: `linear-gradient(135deg, ${colors.primary}, ${colors.blue})`,
								boxShadow: `0 10px 40px ${colors.primary}40`,
							}}
							whileHover={{
								scale: 1.05,
								y: -2,
								boxShadow: `0 20px 60px ${colors.primary}60`,
							}}
							whileTap={{ scale: 0.95 }}
						>
							<QrCode className="h-6 w-6" />
							<span>Get Started</span>
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</motion.button>
					</Link>
					<p className="mt-4 text-muted-foreground text-sm">
						✓ Instant product info sharing ✓ Automatic lead capture ✓ Digital
						catalogs
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default ExhibitionStall;
