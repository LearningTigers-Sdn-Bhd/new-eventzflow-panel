"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isValid, parseISO } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";
import { RegistrationOptionCards } from "@/components/pages/public-registration/RegistrationOptionCards";
import { getPublicEventById } from "@/lib/api/event/endpoints";
import { getPublicPassBundle, getPublicRegistrationForms } from "@/lib/api/public-registration";
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

function formatEventTimeRange(
	startDate: string | null | undefined,
	endDate: string | null | undefined,
) {
	const start = parseEventDate(startDate);
	const end = parseEventDate(endDate);

	if (start && end) {
		return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
	}

	if (start) {
		return format(start, "h:mm a");
	}

	if (end) {
		return format(end, "h:mm a");
	}

	return null;
}

export default function EventRegistrationLandingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = use(params);
	const searchParams = useSearchParams();
	const router = useRouter();
	const bundleToken = searchParams.get("bundle");

	const bundleQuery = useQuery({
		queryKey: ["public-pass-bundle", slug, bundleToken],
		queryFn: () => getPublicPassBundle(slug, bundleToken!),
		enabled: Boolean(bundleToken),
		retry: false,
	});

	useEffect(() => {
		if (!bundleToken || !bundleQuery.data) return;
		const formSlug = bundleQuery.data.registration_form.slug;
		router.replace(
			`/events/${encodeURIComponent(slug)}/register/${encodeURIComponent(formSlug)}?bundle=${encodeURIComponent(bundleToken)}`,
		);
	}, [bundleToken, bundleQuery.data, slug, router]);

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
	const eventTime = formatEventTimeRange(
		eventQuery.data?.start_date,
		eventQuery.data?.end_date,
	);
	const venue = eventQuery.data?.venue_name?.trim() || null;
	const eventDescription =
		eventQuery.data?.description?.trim() ||
		"Please select your preferred registration option below to begin. Ensure all information provided is accurate to secure your attendance.";

	useEffect(() => {
		document.title = buildPublicRegistrationLandingTitle(
			eventQuery.data?.title,
		);
	}, [eventQuery.data?.title]);

	if (bundleToken && bundleQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50/50">
				<div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-brand-green" />
			</div>
		);
	}

	if (bundleToken && bundleQuery.isError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
				<div className="border-2 border-black bg-white p-8 text-center max-w-md w-full">
					<h2 className="mb-3 font-black text-2xl text-black tracking-tighter">
						INVALID BUNDLE LINK
					</h2>
					<p className="text-black/60">
						This bundle link is invalid, expired, or has reached its limit.
					</p>
				</div>
			</div>
		);
	}

	return (
		<section className="relative min-h-screen overflow-hidden bg-slate-50/50">
			{/* Background texture layers */}
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-green/5 blur-[120px]" />
				<div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
				<div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,rgba(15,23,42,1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,1)_1px,transparent_1px)] [background-size:40px_40px]" />
			</div>

			<main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
				{/* Top Navigation / Logo area */}
				<div className="mb-12 flex items-center justify-between">
					{eventQuery.data?.logo_url ? (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						>
							<Image
								src={`${API_BASE_URL}${eventQuery.data.logo_url}`}
								alt={`${eventTitle} logo`}
								width={160}
								height={80}
								className="h-12 w-auto object-contain"
								unoptimized
							/>
						</motion.div>
					) : (
						<div />
					)}
				</div>

				{/* Hero Section */}
				<div className="mb-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
					<div className="order-2 lg:order-1 lg:col-span-7">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, ease: SMOOTH_EASE }}
						>
							<h1 className="mb-8 font-black text-4xl text-slate-900 leading-[1.1] tracking-tight sm:text-6xl">
								Welcome to
								<br />
								<span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
									{eventTitle}
								</span>
							</h1>

							<div className="mb-8 space-y-1 text-slate-700 text-sm sm:text-base">
								{eventDate ? (
									<p>
										<span className="font-semibold text-slate-900">Date:</span>{" "}
										{eventDate}
									</p>
								) : null}
								{eventTime ? (
									<p>
										<span className="font-semibold text-slate-900">Time:</span>{" "}
										{eventTime}
									</p>
								) : null}
								{venue ? (
									<p>
										<span className="font-semibold text-slate-900">Venue:</span>{" "}
										{venue}
									</p>
								) : null}
							</div>

							<p className="max-w-2xl whitespace-pre-line text-justify text-lg text-slate-600 leading-relaxed sm:text-xl">
								{eventDescription}
							</p>
						</motion.div>
					</div>

					{eventQuery.data?.poster_url && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 1, delay: 0.2, ease: SMOOTH_EASE }}
							className="order-1 lg:order-2 lg:col-span-5"
						>
							<div className="group relative">
								<div className="absolute -inset-1 bg-gradient-to-r from-brand-green/20 to-blue-500/20 opacity-25 transition duration-1000 group-hover:opacity-50 group-hover:duration-200" />
								<div className="relative overflow-hidden border border-slate-200 bg-white shadow-2xl">
									<Image
										src={`${API_BASE_URL}${eventQuery.data.poster_url}`}
										alt={`${eventTitle} poster`}
										width={800}
										height={1000}
										className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
										unoptimized
									/>
								</div>
							</div>
						</motion.div>
					)}
				</div>

				{/* Options Section */}
				<div className="relative">
					<div className="mb-10 flex items-center gap-4">
						<h2 className="whitespace-nowrap font-bold text-slate-900 text-sm uppercase tracking-widest">
							Registration Options
						</h2>
						<div className="h-px w-full bg-slate-200" />
					</div>

					{formsQuery.isLoading ? (
						<div className="flex justify-center py-20">
							<div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-brand-green" />
						</div>
					) : formsQuery.isError ? (
						<div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
							<p className="font-medium text-red-600">
								Unable to load registration options.
							</p>
							<p className="mt-1 text-red-400 text-sm">
								Please refresh the page or contact support.
							</p>
						</div>
					) : formsQuery.data && formsQuery.data.length > 0 ? (
						<RegistrationOptionCards eventSlug={slug} forms={formsQuery.data} />
					) : (
						<div className="rounded-3xl border-2 border-slate-200 border-dashed bg-white/50 p-20 text-center">
							<p className="text-lg text-slate-500">
								No registration forms are currently available.
							</p>
						</div>
					)}
				</div>

				{/* Footer Area */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 0.8 }}
					className="mt-24 border-slate-200 border-t pt-12 text-center"
				>
					<p className="font-bold text-slate-400 text-xs uppercase tracking-widest">
						Powered by Eventzflow
					</p>
				</motion.div>
			</main>
		</section>
	);
}
