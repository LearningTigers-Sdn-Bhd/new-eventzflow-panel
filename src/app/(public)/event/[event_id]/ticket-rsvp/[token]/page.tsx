"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Loader2, Mail, User, X } from "lucide-react";
import Image from "next/image";
import { use } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	confirmTicketRsvp,
	declineTicketRsvp,
	getTicketRsvp,
} from "@/lib/api/ticket-rsvp";
import { formatDateTime } from "@/lib/date-utils";

export default function TicketRsvpPage({
	params,
}: {
	params: Promise<{ event_id: string; token: string }>;
}) {
	const { event_id, token } = use(params);
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["public-ticket-rsvp", event_id, token],
		queryFn: () => getTicketRsvp({ eventId: event_id, token }),
	});

	const confirmMutation = useMutation({
		mutationFn: () => confirmTicketRsvp({ eventId: event_id, token }),
		onSuccess: () => {
			toast.success("RSVP confirmed. Your QR ticket will be sent by email.");
			queryClient.invalidateQueries({
				queryKey: ["public-ticket-rsvp", event_id, token],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to confirm RSVP");
		},
	});

	const declineMutation = useMutation({
		mutationFn: () => declineTicketRsvp({ eventId: event_id, token }),
		onSuccess: () => {
			toast.success("RSVP declined");
			queryClient.invalidateQueries({
				queryKey: ["public-ticket-rsvp", event_id, token],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to decline RSVP");
		},
	});

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#FDFCF6]">
				<LoadingState
					title="Preparing your invitation..."
					description="Hang tight, we're getting everything ready."
				/>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#FDFCF6] px-6">
				<ErrorState
					title="Invitation Not Found"
					description="This link might be broken or the invitation has been withdrawn."
				/>
			</div>
		);
	}

	const rsvpStatus = data.data.rsvp_status;
	const isConfirmed = rsvpStatus === "confirmed";
	const isDeclined = rsvpStatus === "declined";
	const isExpired = rsvpStatus === "expired";
	const isLocked = isConfirmed || isDeclined || isExpired;

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#FDFCF6] font-sans text-zinc-900 lg:flex-row">
			{/* LEFT PANEL: Hero Branding */}
			<div className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-black p-6 text-white sm:p-12 lg:w-[45%] lg:p-24 xl:w-[40%]">
				{/* Landing Page Style Background */}
				<div className="absolute inset-0">
					<Image
						src="/images/homepage/HeroSection.webp"
						alt="Event background"
						fill
						sizes="(max-width: 1023px) 100vw, 45vw"
						priority
						className="object-cover opacity-50"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
				</div>

				{/* Vertical Accent Line */}
				<div className="absolute top-0 left-6 hidden h-[40%] w-[3px] bg-brand-green md:left-12 md:block lg:left-16 lg:h-[60%]" />

				<div className="relative z-20 space-y-8 lg:space-y-12">
					<div className="inline-block">
						<Image
							src="/logo/LogoLight.png"
							alt="EventzFlow"
							width={160}
							height={46}
							className="h-8 w-auto object-contain lg:h-10"
						/>
					</div>

					<div className="space-y-4 lg:space-y-6">
						<p className="font-bold text-[10px] text-white/60 uppercase tracking-[0.4em] lg:text-xs">
							Official Invitation
						</p>
						<h1 className="font-medium font-serif text-3xl text-white uppercase leading-[1.05] tracking-tight drop-shadow-2xl sm:text-5xl xl:text-7xl">
							{data.data.event_title}
						</h1>
					</div>
				</div>

				<div className="relative z-20 pt-12 lg:pt-0">
					<div className="mb-4 h-px w-16 bg-brand-green lg:mb-6 lg:w-24" />
					<p className="font-bold text-[10px] text-white/40 uppercase tracking-[0.4em]">
						&copy; {new Date().getFullYear()} EVENTZFLOW
					</p>
				</div>
			</div>

			{/* RIGHT PANEL: RSVP Content */}
			<div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#FAF9F6] p-6 sm:p-12 lg:min-h-0 lg:p-24">
				<div className="w-full max-w-2xl space-y-10 lg:space-y-16">
					{/* Header Section */}
					<div className="flex flex-col items-center space-y-6 text-center lg:space-y-8">
						<div className="relative">
							<div className="zoom-in flex size-20 animate-in items-center justify-center rounded-full border border-black/5 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] duration-700 lg:size-24">
								{isConfirmed ? (
									<Check
										className="size-8 text-brand-green lg:size-10"
										strokeWidth={2.5}
									/>
								) : isDeclined || isExpired ? (
									<X
										className="size-8 text-zinc-300 lg:size-10"
										strokeWidth={2.5}
									/>
								) : (
									<Mail
										className="size-8 text-brand-green lg:size-10"
										strokeWidth={1.5}
									/>
								)}
							</div>
						</div>

						<div className="space-y-3 lg:space-y-4">
							<div className="flex items-center justify-center gap-4 lg:gap-6">
								<div className="h-px w-8 bg-black/5 lg:w-12" />
								<p className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.3em]">
									{isConfirmed
										? "Confirmed"
										: isDeclined
											? "Declined"
											: isExpired
												? "Expired"
												: "Response Required"}
								</p>
								<div className="h-px w-8 bg-black/5 lg:w-12" />
							</div>

							<h2 className="px-2 font-serif text-4xl text-zinc-900 leading-tight tracking-tight sm:text-6xl lg:text-7xl">
								{isConfirmed
									? "You're All Set"
									: isDeclined
										? "RSVP Declined"
										: isExpired
											? "Link Expired"
											: `Welcome, ${data.data.attendee_name.split(" ")[0]}`}
							</h2>
						</div>
					</div>

					{/* Body Content */}
					<div className="space-y-8 lg:space-y-12">
						<div className="space-y-8 text-center lg:space-y-12">
							{isConfirmed ? (
								<p className="mx-auto max-w-md text-base text-zinc-500 leading-relaxed lg:text-lg">
									Your attendance for{" "}
									<span className="font-bold text-zinc-900">
										{data.data.attendee_name}
									</span>{" "}
									is confirmed. Your digital ticket is being sent to{" "}
									<span className="font-medium text-zinc-900 underline decoration-brand-green/30 underline-offset-8">
										{data.data.attendee_email}
									</span>
									.
								</p>
							) : isDeclined ? (
								<p className="mx-auto max-w-md text-base text-zinc-500 leading-relaxed lg:text-lg">
									You have declined the invitation for {data.data.attendee_name}
									. If this was a mistake, please reach out to the event
									organizers.
								</p>
							) : isExpired ? (
								<p className="mx-auto max-w-md text-base text-zinc-500 leading-relaxed lg:text-lg">
									The RSVP deadline has passed. Please contact the organizer if
									you still wish to attend.
								</p>
							) : (
								<div className="space-y-10 lg:space-y-12">
									<p className="mx-auto max-w-lg px-4 text-lg text-zinc-500 leading-relaxed lg:text-xl">
										Your application for the{" "}
										<span className="font-bold text-zinc-900">
											{data.data.event_title}
										</span>{" "}
										has been approved. Please confirm your attendance below.
									</p>

									{/* Attendee Details Table - Refined as per request */}
									<div className="mx-auto w-full max-w-md px-4 sm:px-0">
										<div className="w-full border border-zinc-200 py-2">
											<table className="w-full text-sm">
												<tbody className="divide-y divide-zinc-100">
													<tr>
														<td className="w-1/3 px-6 py-4 text-left font-black text-[10px] text-zinc-900 uppercase tracking-widest">
															Name
														</td>
														<td className="px-6 py-4 text-right font-bold text-zinc-900">
															{data.data.attendee_name}
														</td>
													</tr>
													<tr>
														<td className="px-6 py-4 text-left font-black text-[10px] text-zinc-900 uppercase tracking-widest">
															Email
														</td>
														<td className="px-6 py-4 text-right font-bold text-zinc-900">
															{data.data.attendee_email || "-"}
														</td>
													</tr>
													<tr>
														<td className="px-6 py-4 text-left font-black text-[10px] text-zinc-900 uppercase tracking-widest">
															Phone
														</td>
														<td className="px-6 py-4 text-right font-bold text-zinc-900">
															{data.data.attendee_phone || "-"}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>

									{data.data.rsvp_expires_at && (
										<div className="flex items-center justify-center gap-2 text-amber-600">
											<Clock className="size-4" />
											<p className="font-bold text-[10px] uppercase tracking-[0.2em]">
												Respond by {formatDateTime(data.data.rsvp_expires_at)}
											</p>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Actions - Refined same size and responsive */}
						{!isLocked && (
							<div className="mx-auto flex w-full max-w-lg flex-col justify-center gap-3 px-4 pt-4 sm:flex-row sm:gap-4 sm:px-0 sm:pt-8 lg:gap-6">
								<Button
									variant="outline"
									size="lg"
									className="h-12 w-full whitespace-normal rounded-none border-zinc-300 px-4 text-center font-extrabold text-xs text-zinc-900 uppercase leading-tight tracking-[0.08em] transition-all hover:bg-zinc-50 sm:h-14 sm:flex-1 sm:text-[11px] sm:tracking-[0.14em] lg:h-16 lg:text-[10px] lg:tracking-[0.2em]"
									onClick={() => declineMutation.mutate()}
									disabled={
										confirmMutation.isPending || declineMutation.isPending
									}
								>
									{declineMutation.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										"I cannot attend"
									)}
								</Button>
								<Button
									size="lg"
									className="h-12 w-full whitespace-normal rounded-none bg-brand-green px-4 text-center font-extrabold text-white text-xs uppercase leading-tight tracking-[0.08em] shadow-brand-green/20 shadow-xl transition-all hover:bg-brand-green-dark sm:h-14 sm:flex-1 sm:text-[11px] sm:tracking-[0.14em] sm:hover:scale-[1.03] lg:h-16 lg:text-[10px] lg:tracking-[0.2em]"
									onClick={() => confirmMutation.mutate()}
									disabled={
										confirmMutation.isPending || declineMutation.isPending
									}
								>
									{confirmMutation.isPending ? (
										<Loader2 className="mr-2 size-5 animate-spin" />
									) : (
										"Confirm My Attendance"
									)}
								</Button>
							</div>
						)}
					</div>

					<div className="pt-8 text-center lg:pt-12">
						<div className="mx-auto mb-6 h-px w-12 bg-black/5" />
						<p className="font-black text-[9px] text-zinc-500 uppercase tracking-[0.5em]">
							Powered by EventzFlow
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
