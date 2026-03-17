"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2, Send } from "lucide-react";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPublicEventById } from "@/lib/api/event";
import { getRsvpData } from "@/lib/api/rsvp";
import { submitWish } from "@/lib/api/wishes";
import type { Wish } from "@/lib/api/wishes/response";
import { API_BASE_URL } from "@/utils/rest-api";
import { getGuestbookSubmissionFeedback } from "./guestbook-feedback";

const greatVibes = Great_Vibes({
	subsets: ["latin"],
	weight: ["400"],
});

type GuestbookFormProps = {
	slug: string;
	visitorPublicId?: string;
};

const MAX_MESSAGE_LENGTH = 300;

const PAGE_TRANSITION = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
};

export function GuestbookForm({ slug, visitorPublicId }: GuestbookFormProps) {
	const [guestName, setGuestName] = useState("");
	const [message, setMessage] = useState("");
	const [submittedStatus, setSubmittedStatus] = useState<Wish["status"] | null>(
		null,
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { data: eventInfo } = useQuery({
		queryKey: ["public-event", slug],
		queryFn: () => getPublicEventById(slug),
		enabled: !!slug,
		retry: 2,
	});

	const { data: invitation } = useQuery({
		queryKey: ["guestbook-invitation", slug, visitorPublicId],
		queryFn: () => getRsvpData(slug, visitorPublicId ?? ""),
		enabled: !!slug && !!visitorPublicId,
		retry: false,
	});

	useEffect(() => {
		if (invitation?.visitor.full_name) {
			setGuestName((current) => current || invitation.visitor.full_name);
		}
	}, [invitation?.visitor.full_name]);

	useEffect(() => {
		document.title = eventInfo?.title
			? `Guestbook - ${eventInfo.title}`
			: "Event Guestbook";
	}, [eventInfo?.title]);

	const mutation = useMutation({
		mutationFn: async () =>
			submitWish(slug, {
				guest_name: guestName,
				message,
				visitor_public_id: visitorPublicId,
			}),
		onSuccess: ({ wish }) => {
			setSubmittedStatus(wish.status);
			setMessage("");
			setGuestName("");
			setErrorMessage(null);
		},
		onError: (error: Error) => {
			setSubmittedStatus(null);
			setErrorMessage(error.message || "Unable to send your blessing.");
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmittedStatus(null);
		setErrorMessage(null);
		mutation.mutate();
	};

	const eventTitle = eventInfo?.title?.trim() || "This Event";
	const submissionFeedback = submittedStatus
		? getGuestbookSubmissionFeedback(submittedStatus)
		: null;

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-rsvp-canvas px-6 py-12 sm:px-4 sm:py-16 lg:py-20">
			{/* Subtle Decorative Background Elements */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-rsvp-mist opacity-40 blur-[100px]" />
				<div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-rsvp-mist opacity-40 blur-[100px]" />
			</div>

			{/* Corner Floral Decorations */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
				{/* Top Left */}
				<div className="absolute top-0 left-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/top-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-left-top"
					/>
				</div>
				{/* Top Right */}
				<div className="absolute top-0 right-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/top-right-flower.webp"
						alt=""
						fill
						loading="eager"
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-right-top"
					/>
				</div>
				{/* Bottom Left */}
				<div className="absolute bottom-0 left-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/bottom-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-left-bottom"
					/>
				</div>
				{/* Bottom Right */}
				<div className="absolute right-0 bottom-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/bottom-right-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-right-bottom"
					/>
				</div>
			</div>

			<div className="relative z-10 w-full max-w-2xl">
				{/* Logo */}
				{eventInfo?.logo_url && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="mb-8 flex justify-center"
					>
						<Image
							src={`${API_BASE_URL}${eventInfo.logo_url}`}
							alt={`${eventTitle} logo`}
							width={160}
							height={80}
							className="h-16 w-auto object-contain"
							unoptimized
						/>
					</motion.div>
				)}

				<motion.div
					variants={PAGE_TRANSITION}
					initial="initial"
					animate="animate"
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="overflow-hidden rounded-[2rem] border border-stone-100 bg-white/80 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] backdrop-blur-md sm:bg-white/90 sm:p-12 lg:p-16"
				>
					<div className="mb-10 flex flex-col items-center text-center sm:mb-12">
						<p className="mb-3 font-medium text-[10px] text-stone-500 uppercase tracking-[0.4em] sm:text-[11px]">
							Guestbook
						</p>
						<h1
							className={`${greatVibes.className} mb-4 text-5xl text-stone-800 leading-none sm:text-6xl lg:text-7xl`}
						>
							Share Your Wishes
						</h1>

						<div className="relative w-full max-w-[12rem] py-4">
							<div
								className="absolute inset-0 flex items-center"
								aria-hidden="true"
							>
								<div className="w-full border-stone-200 border-t" />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-transparent px-3 text-stone-400">
									<div className="h-1.5 w-1.5 rotate-45 border border-stone-400 bg-white" />
								</span>
							</div>
						</div>

						<p className="mt-4 max-w-md font-normal font-serif text-sm text-stone-600 italic leading-relaxed sm:text-base sm:text-lg">
							"Leave a warm wish or message. After review, it may appear on the
							wishes wall at the venue."
						</p>
					</div>

					<form className="mx-auto max-w-lg space-y-8" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<label
								className="font-semibold text-[10px] text-stone-500 uppercase tracking-[0.2em] sm:text-[11px]"
								htmlFor="guest-name"
							>
								Your Name
							</label>
							<Input
								id="guest-name"
								value={guestName}
								onChange={(event) => setGuestName(event.target.value)}
								placeholder="John Doe"
								disabled={mutation.isPending}
								className="h-14 rounded-xl border-stone-200 bg-white/60 px-5 text-base text-stone-800 transition-colors placeholder:text-stone-300 focus-visible:border-stone-400 focus-visible:ring-stone-400"
								required
							/>
							<p className="text-[11px] text-stone-400 italic">
								Prefer to use your nickname or short name — it looks nicer on
								the wishes wall.
							</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<label
									className="font-semibold text-[10px] text-stone-500 uppercase tracking-[0.2em] sm:text-[11px]"
									htmlFor="guest-message"
								>
									Your Message
								</label>
								<span className="font-medium text-[10px] text-stone-400 uppercase tracking-widest">
									{message.length} / {MAX_MESSAGE_LENGTH}
								</span>
							</div>
							<Textarea
								id="guest-message"
								value={message}
								onChange={(event) =>
									setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
								}
								placeholder="Write your beautiful wishes here..."
								disabled={mutation.isPending}
								className="min-h-[160px] resize-y rounded-xl border-stone-200 bg-white/60 px-5 py-4 text-base text-stone-800 leading-relaxed transition-colors placeholder:text-stone-300 focus-visible:border-stone-400 focus-visible:ring-stone-400"
								required
							/>
						</div>

						<AnimatePresence mode="wait">
							{submissionFeedback ? (
								<motion.div
									key={submittedStatus}
									initial={{ opacity: 0, height: 0, marginTop: 0 }}
									animate={{ opacity: 1, height: "auto", marginTop: 16 }}
									exit={{ opacity: 0, height: 0, marginTop: 0 }}
									className="overflow-hidden"
								>
									<div
										className={`rounded-xl border p-5 ${submissionFeedback.accentClassName}`}
									>
										<div className="flex items-start gap-3">
											<Heart className="mt-0.5 h-5 w-5 shrink-0 fill-current" />
											<div className="space-y-1">
												<p className="font-semibold text-sm sm:text-base">
													{submissionFeedback.title}
												</p>
												<p className="font-serif text-sm italic leading-relaxed sm:text-base">
													{submissionFeedback.body}
												</p>
											</div>
										</div>
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>

						{errorMessage ? (
							<div className="rounded-xl border border-red-100 bg-red-50/50 p-5 font-serif text-red-800 text-sm italic sm:text-base">
								{errorMessage}
							</div>
						) : null}

						<div className="flex justify-center pt-4">
							<Button
								type="submit"
								disabled={mutation.isPending}
								className="h-14 w-full rounded-full bg-rsvp-ink px-10 font-bold text-[11px] text-white uppercase tracking-widest shadow-stone-200 shadow-xl transition-all hover:bg-black active:scale-[0.98] sm:w-auto sm:px-14"
							>
								{mutation.isPending ? (
									<div className="flex items-center gap-3">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Sending</span>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<Send className="h-4 w-4" />
										<span>Send Blessing</span>
									</div>
								)}
							</Button>
						</div>
					</form>
				</motion.div>

				{/* Bottom note */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 0.5 }}
					className="mt-12 text-center"
				>
					<p className="font-medium text-[10px] text-stone-400 uppercase tracking-widest">
						Powered by Eventzflow
					</p>
				</motion.div>
			</div>
		</div>
	);
}
