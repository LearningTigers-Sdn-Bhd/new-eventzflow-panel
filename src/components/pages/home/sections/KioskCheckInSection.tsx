"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Mail,
	Phone,
	Printer,
	QrCode,
	UserCheck,
	Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

const images = [
	"https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&h=600&fit=crop",
	"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
];

const features = [
	{
		icon: QrCode,
		title: "QR Code Scanning",
		description:
			"Lightning-fast check-in with QR code validation. Scan and print badges in under 3 seconds.",
	},
	{
		icon: Mail,
		title: "Email or Phone Lookup",
		description:
			"Attendees can check in by entering their email or phone number for instant verification.",
	},
	{
		icon: Printer,
		title: "Instant Badge Printing",
		description:
			"Professional badges with custom branding, attendee names, and details printed in seconds.",
	},
];

const KioskCheckInSection: React.FC = () => {
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
			<div className="pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
			<div className="pointer-events-none absolute right-0 bottom-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-3xl" />

			<div className="relative mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-8 flex flex-col gap-4 text-center sm:mb-12 sm:gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:text-left">
					<div>
						<motion.span
							className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 font-semibold text-[10px] text-accent-foreground uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs"
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
						>
							<QrCode className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							<span className="whitespace-nowrap">
								Effortless On-Site Check-In
							</span>
						</motion.span>
						<motion.h2
							className="mt-3 font-semibold text-2xl text-foreground sm:mt-4 sm:text-3xl lg:text-4xl"
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.05 }}
						>
							Eliminate queues with instant QR or email/phone check-in
						</motion.h2>
					</div>
					<motion.p
						className="px-2 text-muted-foreground text-sm sm:text-base lg:max-w-xl lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						Pre-registered attendees breeze through with QR codes, while
						walk-ins self-check-in using email or phone lookup. Professional
						badges print in 3 seconds—no lines, no delays, just seamless entry
						that keeps your event moving.
					</motion.p>
				</div>

				<div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Content */}
					<motion.div
						className="flex flex-col justify-center"
						initial={{ opacity: 0, x: -20 }}
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
										className="group flex gap-2.5 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-emerald-500/5 hover:shadow-md sm:gap-3 sm:rounded-xl sm:p-3.5"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.08 }}
									>
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10 transition-all group-hover:from-emerald-500/20 group-hover:to-blue-500/20 sm:h-9 sm:w-9">
											<Icon className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
										</div>
										<div className="min-w-0">
											<h3 className="font-semibold text-foreground text-sm sm:text-base">
												{feature.title}
											</h3>
											<p className="mt-0.5 text-muted-foreground text-xs leading-relaxed sm:text-sm">
												{feature.description}
											</p>
										</div>
									</motion.div>
								);
							})}
						</div>

						{/* Bottom CTA Info */}
						<motion.div
							className="mt-5 rounded-lg border border-border bg-card p-3.5 sm:mt-6 sm:rounded-xl sm:p-4"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.5 }}
						>
							<div className="flex items-start gap-2.5 sm:gap-3">
								<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
									<UserCheck className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
								</div>
								<div className="min-w-0">
									<h4 className="font-semibold text-foreground text-sm sm:text-base">
										Flexible Check-In Options
									</h4>
									<p className="mt-1 text-muted-foreground text-xs sm:text-sm">
										Pre-registered attendees use QR codes, while walk-ins can
										check in with their email or phone number—no
										pre-registration required.
									</p>
								</div>
							</div>
						</motion.div>
					</motion.div>

					{/* Image Carousel */}
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 20 }}
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
										alt={`On-site check-in solution ${currentImage + 1}`}
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
									className="-translate-y-1/2 absolute top-1/2 left-4 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
									aria-label="Previous image"
								>
									<ChevronLeft className="h-6 w-6 text-foreground" />
								</button>
								<button
									onClick={nextImage}
									className="-translate-y-1/2 absolute top-1/2 right-4 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
									aria-label="Next image"
								>
									<ChevronRight className="h-6 w-6 text-foreground" />
								</button>
							</div>

							{/* Thumbnail Strip */}
							<div className="flex gap-1.5 border-border border-t bg-muted/50 p-2 sm:gap-2 sm:p-3">
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
				</div>
			</div>
		</section>
	);
};

export default KioskCheckInSection;
