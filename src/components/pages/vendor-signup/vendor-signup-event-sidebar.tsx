"use client";

import { Calendar, Store } from "lucide-react";

interface EventInfo {
	title?: string;
	start_date?: string | null;
	end_date?: string | null;
	description?: string | null;
}

interface VendorSignupEventSidebarProps {
	event?: EventInfo;
}

export function VendorSignupEventSidebar({
	event,
}: VendorSignupEventSidebarProps) {
	const formatEventDate = (startDate: string | null | undefined, endDate: string | null | undefined) => {
		if (!startDate) return null;
		const start = new Date(startDate).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		if (!endDate || endDate === startDate) return start;
		const end = new Date(endDate).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		return { start, end };
	};

	const eventDate = formatEventDate(event?.start_date, event?.end_date);

	return (
		<div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-[400px] lg:p-10 xl:w-[480px]">
			{/* Decorative circles */}
			<div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full border border-primary-foreground/20 bg-primary-foreground/10" />
			<div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-primary-foreground/10 bg-primary-foreground/5" />
			<div className="pointer-events-none absolute top-1/2 right-10 h-24 w-24 rounded-full border border-primary-foreground/20 bg-primary-foreground/10" />

			<div className="relative z-10">
				{/* Brand */}
				<div className="mb-10">
					<p className="text-sm font-medium text-primary-foreground/70">EventzFlow</p>
					<h1 className="mt-1 font-bold text-2xl tracking-tight">
						Vendor Registration
					</h1>
				</div>

				{/* Event Title Section */}
				<div className="mb-8">
					<p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
						You're joining
					</p>
					<h2 className="font-bold text-3xl leading-tight lg:text-4xl">
						{event?.title || "Event"}
					</h2>
				</div>

				{/* Event Info */}
				<div className="rounded-none border border-primary-foreground/20 bg-primary-foreground/10 divide-y divide-primary-foreground/20">
					{eventDate && (
						<div className="flex items-start gap-3 p-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
								<Calendar className="h-5 w-5" />
							</div>
							<div>
								<p className="text-xs font-medium text-primary-foreground/60">
									Date
								</p>
								{typeof eventDate === "string" ? (
									<p className="font-medium">{eventDate}</p>
								) : (
									<p className="font-medium">
										{eventDate.start} — {eventDate.end}
									</p>
								)}
							</div>
						</div>
					)}

					{event?.description && (
						<div className="flex items-start gap-3 p-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
								<Store className="h-5 w-5" />
							</div>
							<div>
								<p className="text-xs font-medium text-primary-foreground/60">
									About
								</p>
								<p className="line-clamp-3 text-sm leading-relaxed text-primary-foreground/90">
									{event.description}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Highlight box */}
				<div className="mt-6 rounded-none border border-primary-foreground/20 bg-primary-foreground/10 p-4">
					<p className="text-sm leading-relaxed text-primary-foreground/90">
						Complete your registration to access the vendor dashboard and start managing your booth.
					</p>
				</div>
			</div>

			{/* Footer */}
			<div className="relative z-10 mt-8 hidden lg:block">
				<p className="text-xs text-primary-foreground/50">
					© {new Date().getFullYear()} EventzFlow. All rights reserved.
				</p>
			</div>
		</div>
	);
}
