"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPublicEventById } from "@/lib/api/event";
import { getRsvpData } from "@/lib/api/rsvp";
import { submitWish } from "@/lib/api/wishes";

type GuestbookFormProps = {
	slug: string;
	visitorPublicId?: string;
};

const MAX_MESSAGE_LENGTH = 300;

export function GuestbookForm({ slug, visitorPublicId }: GuestbookFormProps) {
	const [guestName, setGuestName] = useState("");
	const [message, setMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);
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
			: "Wedding Guestbook";
	}, [eventInfo?.title]);

	const mutation = useMutation({
		mutationFn: async () =>
			submitWish(slug, {
				guest_name: guestName,
				message,
				visitor_public_id: visitorPublicId,
			}),
		onSuccess: () => {
			setSubmitted(true);
			setMessage("");
			setErrorMessage(null);
		},
		onError: (error: Error) => {
			setSubmitted(false);
			setErrorMessage(error.message || "Unable to send your blessing.");
		},
	});

	const remainingCharacters = useMemo(
		() => MAX_MESSAGE_LENGTH - message.length,
		[message.length],
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitted(false);
		setErrorMessage(null);
		mutation.mutate();
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f8f1e8] px-5 py-10 text-stone-900 sm:px-8 lg:px-12">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(176,138,102,0.35),_transparent_60%)]" />
				<div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#ead8c2]/50 blur-3xl" />
				<div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-[#d9bfa1]/35 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-3xl">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-[11px] text-stone-500 uppercase tracking-[0.35em]">
						Wedding Guestbook
					</p>
					<h1 className="mt-4 font-serif text-4xl text-stone-900 italic sm:text-5xl">
						Share your blessing
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-base text-stone-600 leading-relaxed sm:text-lg">
						Leave a warm wish for {eventInfo?.title ?? "the happy couple"}. After review, it may appear on the wishes wall at the venue.
					</p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
					className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_35px_90px_-40px_rgba(88,57,29,0.5)] backdrop-blur-md sm:p-8 lg:p-10"
				>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<label className="font-semibold text-[11px] text-stone-500 uppercase tracking-[0.28em]" htmlFor="guest-name">
								Your name
							</label>
							<Input
								id="guest-name"
								value={guestName}
								onChange={(event) => setGuestName(event.target.value)}
								placeholder="Mak Long, Uncle Ahmad, Kak Lina..."
								disabled={mutation.isPending}
								className="h-12 rounded-2xl border-stone-200 bg-white px-4 text-base"
								required
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<label className="font-semibold text-[11px] text-stone-500 uppercase tracking-[0.28em]" htmlFor="guest-message">
									Your blessing
								</label>
								<span className="text-xs text-stone-400">
									{message.length} / {MAX_MESSAGE_LENGTH}
								</span>
							</div>
							<Textarea
								id="guest-message"
								value={message}
								onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
								placeholder="May your home always be filled with mercy, laughter, and gentle love."
								disabled={mutation.isPending}
								className="min-h-40 rounded-[1.5rem] border-stone-200 bg-white px-4 py-4 text-base leading-relaxed"
								required
							/>
							<p className="text-sm text-stone-400">
								{remainingCharacters >= 0
									? `${remainingCharacters} characters remaining`
									: "Message is too long"}
							</p>
						</div>

						<AnimatePresence mode="wait">
							{submitted ? (
								<motion.div
									key="success"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
								>
									<div className="flex items-start gap-3">
										<Heart className="mt-0.5 h-4 w-4 fill-current" />
										<p>
											Your blessing has been sent! It may appear on the wedding display screen after review.
										</p>
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>

						{errorMessage ? (
							<div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
								{errorMessage}
							</div>
						) : null}

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-stone-500 leading-relaxed">
								Short, sincere messages work beautifully on the wishes wall.
							</p>
							<Button
								type="submit"
								disabled={mutation.isPending}
								className="h-12 rounded-full bg-stone-900 px-6 text-[11px] text-white uppercase tracking-[0.3em] hover:bg-stone-800"
							>
								{mutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Sending
									</>
								) : (
									<>
										<Send className="h-4 w-4" />
										Send Blessing
									</>
								)}
							</Button>
						</div>
					</form>
				</motion.div>
			</div>
		</div>
	);
}
