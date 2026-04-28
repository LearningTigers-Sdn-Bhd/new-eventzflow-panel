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
			<div className="min-h-screen flex items-center justify-center bg-[#FDFCF6]">
				<LoadingState
					title="Preparing your invitation..."
					description="Hang tight, we're getting everything ready."
				/>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#FDFCF6] px-6">
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
		<div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FDFCF6] font-sans text-zinc-900">
			
			{/* LEFT PANEL: Hero Branding */}
			<div className="relative w-full lg:w-[45%] xl:w-[40%] bg-black text-white p-6 sm:p-12 lg:p-24 flex flex-col justify-between overflow-hidden shrink-0">
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
				<div className="absolute left-6 top-0 hidden h-[40%] lg:h-[60%] w-[3px] bg-brand-green md:block md:left-12 lg:left-16" />

				<div className="relative z-20 space-y-8 lg:space-y-12">
					<div className="inline-block">
						<Image 
							src="/logo/LogoLight.png" 
							alt="EventzFlow" 
							width={160} 
							height={46} 
							className="h-8 lg:h-10 w-auto object-contain"
						/>
					</div>

					<div className="space-y-4 lg:space-y-6">
						<p className="text-white/60 text-[10px] lg:text-xs font-bold uppercase tracking-[0.4em]">
							Official Invitation
						</p>
						<h1 className="text-3xl sm:text-5xl xl:text-7xl font-serif font-medium leading-[1.05] tracking-tight uppercase text-white drop-shadow-2xl">
							{data.data.event_title}
						</h1>
					</div>
				</div>

				<div className="relative z-20 pt-12 lg:pt-0">
					<div className="h-px w-16 lg:w-24 bg-brand-green mb-4 lg:mb-6" />
					<p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
						&copy; {new Date().getFullYear()} EVENTZFLOW
					</p>
				</div>
			</div>

			{/* RIGHT PANEL: RSVP Content */}
			<div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#FAF9F6] min-h-screen lg:min-h-0">
				<div className="w-full max-w-2xl space-y-10 lg:space-y-16">
					
					{/* Header Section */}
					<div className="flex flex-col items-center text-center space-y-6 lg:space-y-8">
						<div className="relative">
							<div className="size-20 lg:size-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5 animate-in zoom-in duration-700">
								{isConfirmed ? (
									<Check className="size-8 lg:size-10 text-brand-green" strokeWidth={2.5} />
								) : isDeclined || isExpired ? (
									<X className="size-8 lg:size-10 text-zinc-300" strokeWidth={2.5} />
								) : (
									<Mail className="size-8 lg:size-10 text-brand-green" strokeWidth={1.5} />
								)}
							</div>
						</div>

						<div className="space-y-3 lg:space-y-4">
							<div className="flex items-center justify-center gap-4 lg:gap-6">
								<div className="h-px w-8 lg:w-12 bg-black/5" />
								<p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
									{isConfirmed ? "Confirmed" : isDeclined ? "Declined" : isExpired ? "Expired" : "Response Required"}
								</p>
								<div className="h-px w-8 lg:w-12 bg-black/5" />
							</div>
							
							<h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-zinc-900 leading-tight tracking-tight px-2">
								{isConfirmed 
									? "You're All Set" 
									: isDeclined 
									? "RSVP Declined" 
									: isExpired 
									? "Link Expired" 
									: `Welcome, ${data.data.attendee_name.split(' ')[0]}`}
							</h2>
						</div>
					</div>

					{/* Body Content */}
					<div className="space-y-8 lg:space-y-12">
						<div className="text-center space-y-8 lg:space-y-12">
							{isConfirmed ? (
								<p className="text-base lg:text-lg text-zinc-500 leading-relaxed max-w-md mx-auto">
									Your attendance for <span className="font-bold text-zinc-900">{data.data.attendee_name}</span> is confirmed. 
									Your digital ticket is being sent to <span className="text-zinc-900 font-medium underline underline-offset-8 decoration-brand-green/30">{data.data.attendee_email}</span>.
								</p>
							) : isDeclined ? (
								<p className="text-base lg:text-lg text-zinc-500 leading-relaxed max-w-md mx-auto">
									You have declined the invitation for {data.data.attendee_name}. If this was a mistake, please reach out to the event organizers.
								</p>
							) : isExpired ? (
								<p className="text-base lg:text-lg text-zinc-500 leading-relaxed max-w-md mx-auto">
									The RSVP deadline has passed. Please contact the organizer if you still wish to attend.
								</p>
							) : (
								<div className="space-y-10 lg:space-y-12">
									<p className="text-lg lg:text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed px-4">
										Your application for the <span className="font-bold text-zinc-900">{data.data.event_title}</span> has been approved. 
										Please confirm your attendance below.
									</p>
									
									{/* Attendee Details Table - Refined as per request */}
									<div className="max-w-md mx-auto w-full px-4 sm:px-0">
										<div className="w-full border border-zinc-200 py-2">
											<table className="w-full text-sm">
												<tbody className="divide-y divide-zinc-100">
													<tr>
														<td className="py-4 px-6 text-left font-black uppercase tracking-widest text-zinc-900 text-[10px] w-1/3">Name</td>
														<td className="py-4 px-6 text-right font-bold text-zinc-900">{data.data.attendee_name}</td>
													</tr>
													<tr>
														<td className="py-4 px-6 text-left font-black uppercase tracking-widest text-zinc-900 text-[10px]">Email</td>
														<td className="py-4 px-6 text-right font-bold text-zinc-900">{data.data.attendee_email || "-"}</td>
													</tr>
													<tr>
														<td className="py-4 px-6 text-left font-black uppercase tracking-widest text-zinc-900 text-[10px]">Phone</td>
														<td className="py-4 px-6 text-right font-bold text-zinc-900">{data.data.attendee_phone || "-"}</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>

									{data.data.rsvp_expires_at && (
										<div className="flex items-center justify-center gap-2 text-amber-600">
											<Clock className="size-4" />
											<p className="text-[10px] font-bold uppercase tracking-[0.2em]">
												Respond by {formatDateTime(data.data.rsvp_expires_at)}
											</p>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Actions - Refined same size and responsive */}
						{!isLocked && (
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center pt-4 sm:pt-8 w-full max-w-lg mx-auto px-4 sm:px-0">
								<Button
									variant="outline"
									size="lg"
									className="h-12 sm:h-14 lg:h-16 w-full sm:flex-1 px-4 text-xs sm:text-[11px] lg:text-[10px] font-extrabold uppercase tracking-[0.08em] sm:tracking-[0.14em] lg:tracking-[0.2em] text-zinc-900 border-zinc-300 hover:bg-zinc-50 rounded-none transition-all whitespace-normal text-center leading-tight"
									onClick={() => declineMutation.mutate()}
									disabled={confirmMutation.isPending || declineMutation.isPending}
								>
									{declineMutation.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										"I cannot attend"
									)}
								</Button>
								<Button
									size="lg"
									className="h-12 sm:h-14 lg:h-16 w-full sm:flex-1 px-4 bg-brand-green hover:bg-brand-green-dark text-white text-xs sm:text-[11px] lg:text-[10px] font-extrabold uppercase tracking-[0.08em] sm:tracking-[0.14em] lg:tracking-[0.2em] rounded-none transition-all sm:hover:scale-[1.03] shadow-xl shadow-brand-green/20 whitespace-normal text-center leading-tight"
									onClick={() => confirmMutation.mutate()}
									disabled={confirmMutation.isPending || declineMutation.isPending}
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

					<div className="text-center pt-8 lg:pt-12">
						<div className="h-px w-12 bg-black/5 mx-auto mb-6" />
						<p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.5em]">
							Powered by EventzFlow
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
