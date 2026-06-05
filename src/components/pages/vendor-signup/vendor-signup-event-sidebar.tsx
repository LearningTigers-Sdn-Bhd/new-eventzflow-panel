"use client";

import { BadgeCheck, Calendar, Store, Users } from "lucide-react";

interface EventInfo {
	title?: string;
	start_date?: string | null;
	end_date?: string | null;
	description?: string | null;
}

interface GroupInfo {
	id: number;
	name: string;
}

interface VendorSignupEventSidebarProps {
	event?: EventInfo;
	group?: GroupInfo | null;
	vendorType?: "Exhibitor" | "Merchant";
	useExhibitorKit?: boolean;
}

export function VendorSignupEventSidebar({
	event,
	group,
	vendorType,
	useExhibitorKit,
}: VendorSignupEventSidebarProps) {
	const formatEventDate = (
		startDate: string | null | undefined,
		endDate: string | null | undefined,
	) => {
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
					<p className="font-medium text-primary-foreground/70 text-sm">
						EventzFlow
					</p>
					<h1 className="mt-1 font-bold text-2xl tracking-tight">
						Vendor Registration
					</h1>
				</div>

				{/* Event Title Section */}
				<div className="mb-8">
					<p className="mb-2 font-medium text-primary-foreground/60 text-xs uppercase tracking-wider">
						You're joining
					</p>
					<h2 className="font-bold text-3xl leading-tight lg:text-4xl">
						{event?.title || "Event"}
					</h2>
				</div>

				{/* Event Info */}
				<div className="divide-y divide-primary-foreground/20 rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
					{eventDate && (
						<div className="flex items-start gap-3 p-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
								<Calendar className="h-5 w-5" />
							</div>
							<div>
								<p className="font-medium text-primary-foreground/60 text-xs">
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
								<p className="font-medium text-primary-foreground/60 text-xs">
									About
								</p>
								<p className="line-clamp-3 text-primary-foreground/90 text-sm leading-relaxed">
									{event.description}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Vendor type & Group info */}
				{(vendorType || group) && (
					<div className="mt-6 space-y-3">
						{vendorType && (
							<div className="rounded-none border border-primary-foreground/30 bg-primary-foreground/15 p-4">
								<div className="flex items-start gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
										<BadgeCheck className="h-4 w-4" />
									</div>
									<div>
										<p className="font-medium text-primary-foreground/60 text-xs">
											Joining as
										</p>
										<p className="font-semibold">{vendorType}</p>
										{useExhibitorKit && (
											<p className="mt-1 text-primary-foreground/70 text-xs">
												You'll need to fill in exhibitor kit details
											</p>
										)}
									</div>
								</div>
							</div>
						)}
						{group && (
							<div className="rounded-none border border-primary-foreground/30 bg-primary-foreground/15 p-4">
								<div className="flex items-start gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-primary-foreground/20 bg-primary-foreground/10">
										<Users className="h-4 w-4" />
									</div>
									<div>
										<p className="font-medium text-primary-foreground/60 text-xs">
											Assigned to group
										</p>
										<p className="font-semibold">{group.name}</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Highlight box */}
				<div className="mt-6 rounded-none border border-primary-foreground/20 bg-primary-foreground/10 p-4">
					<p className="text-primary-foreground/90 text-sm leading-relaxed">
						Complete your registration to access the vendor dashboard and start
						managing your booth.
					</p>
				</div>
			</div>

			{/* Footer */}
			<div className="relative z-10 mt-8 hidden lg:block">
				<p className="text-primary-foreground/50 text-xs">
					© {new Date().getFullYear()} EventzFlow. All rights reserved.
				</p>
			</div>
		</div>
	);
}
