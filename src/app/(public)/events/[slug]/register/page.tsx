"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isValid, parseISO } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import { use, useEffect } from "react";
import { RegistrationOptionCards } from "@/components/pages/public-registration/RegistrationOptionCards";
import { getPublicEventById } from "@/lib/api/event/endpoints";
import { getPublicRegistrationForms } from "@/lib/api/public-registration";
import { buildPublicRegistrationLandingTitle } from "@/lib/public-registration/title";
import { API_BASE_URL } from "@/utils/rest-api";

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

function parseEventDate(value: string | null | undefined) {
	if (!value) return null;
	const date = parseISO(value);
	return isValid(date) ? date : null;
}

function formatEventDateRange(
	startDate: string | null | undefined,
	endDate: string | null | undefined,
) {
	const start = parseEventDate(startDate);
	const end = parseEventDate(endDate);

	if (start && end) {
		if (isSameDay(start, end)) {
			return format(start, "EEEE, d MMMM yyyy");
		}

		const sameYear = format(start, "yyyy") === format(end, "yyyy");
		if (sameYear) {
			return `${format(start, "d MMM")} - ${format(end, "d MMM yyyy")}`;
		}

		return `${format(start, "d MMM yyyy")} - ${format(end, "d MMM yyyy")}`;
	}

	if (start) {
		return `Starts ${format(start, "EEEE, d MMMM yyyy")}`;
	}

	if (end) {
		return `Until ${format(end, "EEEE, d MMMM yyyy")}`;
	}

	return null;
}

export default function EventRegistrationLandingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = use(params);

	const eventQuery = useQuery({
		queryKey: ["public-event", slug],
		queryFn: () => getPublicEventById(slug),
	});

	const formsQuery = useQuery({
		queryKey: ["public-registration-forms", slug],
		queryFn: () => getPublicRegistrationForms(slug),
	});

	const eventTitle = eventQuery.data?.title?.trim() || "This Event";
	const eventDate = formatEventDateRange(
		eventQuery.data?.start_date,
		eventQuery.data?.end_date,
	);

	useEffect(() => {
		document.title = buildPublicRegistrationLandingTitle(
			eventQuery.data?.title,
		);
	}, [eventQuery.data?.title]);

	return (
		<section className="relative min-h-screen overflow-hidden bg-white-background">
			{/* Background texture layers */}
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-[linear-gradient(155deg,#f8faf9_0%,#ffffff_38%,#f4f6f5_100%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(120%_72%_at_16%_0%,rgba(34,197,94,0.08),transparent_54%),radial-gradient(90%_60%_at_100%_100%,rgba(15,23,42,0.08),transparent_60%)]" />
				<div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),transparent)]" />
				<div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:58px_58px]" />
			</div>

			{/* Left vertical accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, ease: SMOOTH_EASE }}
				className="absolute top-0 left-6 hidden h-[60%] w-[3px] origin-top bg-brand-green md:left-12 md:block lg:left-16"
			/>

			<main className="relative z-10 mx-auto max-w-[100rem] px-6 py-20 lg:px-16 lg:py-32">
				{/* Logo — top right corner */}
				{eventQuery.data?.logo_url && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="absolute top-8 right-6 lg:top-12 lg:right-16"
					>
						<Image
							src={`${API_BASE_URL}${eventQuery.data.logo_url}`}
							alt={`${eventTitle} logo`}
							width={160}
							height={80}
							className="h-16 w-auto object-contain"
							unoptimized
						/>
					</motion.div>
				)}

				{/* Header Section */}
				<div className="mb-16 md:mb-24">
					{/* Eyebrow */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: SMOOTH_EASE }}
						className="mb-6 font-medium text-black/60 text-xs uppercase tracking-[0.4em]"
					>
						Event Registration
					</motion.p>

					{/* Main headline */}
					<motion.h1
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.2, ease: SMOOTH_EASE }}
						className="font-black text-[clamp(2.5rem,6vw,5rem)] text-black leading-[0.95] tracking-tighter"
					>
						REGISTER FOR
						<br />
						<span className="text-brand-green">{eventTitle}</span>
					</motion.h1>

					{/* Description */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.5, ease: SMOOTH_EASE }}
						className="mt-8 max-w-3xl"
					>
						<div className="mb-6 h-px w-full bg-brand-green" />
						{eventDate && (
							<p className="mb-3 font-semibold text-black/70 text-sm uppercase tracking-[0.18em]">
								Event Date: {eventDate}
							</p>
						)}
						<p className="text-black/70 text-lg leading-relaxed">
							Pick the registration option that fits you best, then complete
							your details to secure your spot.
						</p>
					</motion.div>
				</div>

				{/* Content */}
				<div className="relative border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.7)_45%,rgba(255,255,255,0.88)_100%)] p-4 md:p-6 lg:p-8">
					{formsQuery.isLoading ? (
						<div className="py-20 text-center">
							<div className="inline-flex items-center gap-3 text-black/60">
								<div className="h-5 w-5 animate-spin border-2 border-black/20 border-t-brand-green" />
								<span className="text-sm uppercase tracking-wider">
									Loading registration options...
								</span>
							</div>
						</div>
					) : formsQuery.isError ? (
						<div className="border border-black/20 bg-red-50 p-6 text-red-800 text-sm">
							Unable to load registration options for this event.
						</div>
					) : formsQuery.data && formsQuery.data.length > 0 ? (
						<RegistrationOptionCards eventSlug={slug} forms={formsQuery.data} />
					) : (
						<div className="border border-black/20 p-10 py-20 text-center text-black/60">
							<p className="text-lg">
								No registration forms are available for this event.
							</p>
						</div>
					)}
				</div>

				{/* Bottom note */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
					className="mt-20 border-black/10 border-t pt-8"
				>
					<p className="text-center text-black/50 text-sm uppercase tracking-wider">
						Need help? Contact our support team for assistance
					</p>
				</motion.div>
			</main>

			{/* Bottom right accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, delay: 0.3, ease: SMOOTH_EASE }}
				className="absolute right-[10%] bottom-0 hidden h-[30%] w-px origin-bottom bg-black/10 lg:block"
			/>
		</section>
	);
}
