"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Smartphone,
	CheckCircle,
	Users,
	Shield,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

const images = [
	"https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
];

const features = [
	{
		icon: Smartphone,
		title: "No App Required",
		description: "Attendees use WhatsApp—a platform they already have. No downloads or installations needed for registration.",
	},
	{
		icon: CheckCircle,
		title: "Instant Registration",
		description: "Register through conversational WhatsApp flows with automated confirmations and QR code delivery straight to their phone.",
	},
	{
		icon: Users,
		title: "Automated Campaigns",
		description: "Send event reminders, updates, promotional messages, and registration links automatically via WhatsApp.",
	},
	{
		icon: Shield,
		title: "Secure & Verified",
		description: "Phone number verification ensures authentic registrations with automated QR code delivery for entry validation.",
	},
];

const MobileCheckInSection: React.FC = () => {
	const [currentImage, setCurrentImage] = useState(0);

	const nextImage = () => {
		setCurrentImage((prev) => (prev + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
	};

	return (
		<section className="relative overflow-hidden bg-muted/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
			{/* Professional background elements */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
			<div className="pointer-events-none absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
			<div className="pointer-events-none absolute bottom-1/4 right-0 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-3xl" />
			
			<div className="relative mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-8 flex flex-col gap-4 text-center sm:mb-12 sm:gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:text-left">
					<div>
				<motion.span
					className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground sm:px-4 sm:py-2 sm:text-xs"
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					<Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
					<span className="whitespace-nowrap">WhatsApp Registration</span>
				</motion.span>
				<motion.h2
					className="mt-3 text-2xl font-semibold text-foreground sm:mt-4 sm:text-3xl lg:text-4xl"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.05 }}
				>
					Register attendees via WhatsApp automation
				</motion.h2>
			</div>
			<motion.p
				className="px-2 text-sm text-muted-foreground sm:text-base lg:max-w-xl lg:text-lg"
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: 0.08 }}
			>
				Let attendees register using WhatsApp—the platform they already use every day.
				No apps to download, no passwords to remember. Just simple, conversational registration
				with instant QR code delivery through WhatsApp automation.
			</motion.p>
				</div>

				<div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Image Carousel */}
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
							{/* Main Image */}
							<div className="relative aspect-[4/3]">
								<AnimatePresence mode="wait">
							<motion.img
								key={currentImage}
								src={images[currentImage]}
								alt={`WhatsApp registration solution ${currentImage + 1}`}
								className="h-full w-full object-cover"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
							/>
								</AnimatePresence>

								{/* Navigation Arrows */}
								<button
									onClick={prevImage}
									className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
									aria-label="Previous image"
								>
									<ChevronLeft className="h-6 w-6 text-foreground" />
								</button>
								<button
									onClick={nextImage}
									className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
									aria-label="Next image"
								>
									<ChevronRight className="h-6 w-6 text-foreground" />
								</button>
							</div>

							{/* Thumbnail Strip */}
							<div className="flex gap-1.5 border-t border-border bg-muted/50 p-2 sm:gap-2 sm:p-3">
								{images.map((img, index) => (
									<button
										key={index}
										onClick={() => setCurrentImage(index)}
										className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all sm:h-14 sm:w-20 sm:rounded-lg ${
											currentImage === index
												? "border-emerald-500 ring-2 ring-emerald-500/20"
												: "border-border opacity-60 hover:opacity-100"
										}`}
									>
										<img
											src={img}
											alt={`Thumbnail ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								))}
							</div>
						</div>
					</motion.div>

					{/* Content */}
					<motion.div
						className="flex flex-col justify-center"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<div className="space-y-2.5 sm:space-y-3">
							{features.map((feature, index) => {
								const Icon = feature.icon;
								return (
									<motion.div
										key={feature.title}
										className="group flex gap-2.5 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 sm:gap-3 sm:rounded-xl sm:p-3.5"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.08 }}
									>
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10 transition-all group-hover:from-emerald-500/20 group-hover:to-blue-500/20 sm:h-9 sm:w-9">
											<Icon className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
										</div>
										<div className="min-w-0">
											<h3 className="text-sm font-semibold text-foreground sm:text-base">
												{feature.title}
											</h3>
											<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
												{feature.description}
											</p>
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default MobileCheckInSection;

