"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Check, Heart, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
	type FeedbackQuestion,
	getPublicFeedbackForm,
	submitFeedback,
} from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";
import {
	type FeedbackAnswerValues,
	evaluatePageNavigation,
	findReachableQuestions,
	missingRequired,
	toAnswerPayload,
} from "./feedback-answers";

type PublicFeedbackFormProps = {
	slug: string;
	ticketPublicId?: string;
};

export function PublicFeedbackForm({
	slug,
	ticketPublicId,
}: PublicFeedbackFormProps) {
	const [values, setValues] = useState<FeedbackAnswerValues>({});
	const [missingIds, setMissingIds] = useState<number[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [pageHistory, setPageHistory] = useState<number[]>([1]);
	const reduceMotion = useReducedMotion();

	const {
		data: form,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["public-feedback-form", slug, ticketPublicId],
		queryFn: () => getPublicFeedbackForm(slug, ticketPublicId),
		retry: false,
	});

	const questions = useMemo(() => form?.questions ?? [], [form?.questions]);
	const pagesMetadata = useMemo(() => form?.pages_metadata ?? [], [form?.pages_metadata]);
	const displayMode = form?.display_mode ?? "pages";

	const activePages = useMemo(() => {
		const pages = [...new Set(questions.map((q) => q.page_number ?? 1))].sort(
			(a, b) => a - b,
		);
		return pages.length > 0 ? pages : [1];
	}, [questions]);

	const isMultiPage = activePages.length > 1;

	// Keep currentPage valid when activePages change
	useEffect(() => {
		if (activePages.length > 0 && !activePages.includes(currentPage)) {
			setCurrentPage(activePages[0]);
			setPageHistory([activePages[0]]);
		}
	}, [activePages, currentPage]);

	useEffect(() => {
		if (form?.title) document.title = form.title;
	}, [form?.title]);

	const reachableQuestions = useMemo(
		() => findReachableQuestions(questions, values),
		[questions, values],
	);

	const mutation = useMutation({
		mutationFn: () => {
			if (!form) throw new Error("Form not loaded");
			return submitFeedback({
				form_id: form.id,
				ticket_public_id: ticketPublicId,
				answers: toAnswerPayload(reachableQuestions, values),
			});
		},
		onSuccess: () => {
			if (reduceMotion) return;
			confetti({
				particleCount: 140,
				spread: 80,
				origin: { y: 0.6 },
				colors: ["#23C460", "#CFF5DD", "#7BE0A3", "#FFFFFF"],
			});
		},
	});

	const setValue = (id: number, value: string | string[]) => {
		setValues((v) => ({ ...v, [id]: value }));
		setMissingIds((ids) => ids.filter((x) => x !== id));
	};

	// No ?ticket= means the organizer's preview link: show the form, collect nothing.
	const isPreview = !ticketPublicId;

	const currentQuestions = useMemo(
		() => questions.filter((q) => (q.page_number ?? 1) === currentPage),
		[questions, currentPage],
	);

	const nextNav = useMemo(() => {
		return evaluatePageNavigation(
			currentPage,
			currentQuestions,
			values,
			activePages,
			questions,
		);
	}, [currentPage, currentQuestions, values, activePages, questions]);

	const handleNextPage = () => {
		const missing = missingRequired(currentQuestions, values).map((q) => q.id);
		setMissingIds(missing);
		if (missing.length > 0) {
			const first = document.getElementById(`question-${missing[0]}`);
			first?.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "center",
			});
			first?.querySelector<HTMLElement>("input, textarea, button")?.focus({
				preventScroll: true,
			});
			return;
		}

		const nav = evaluatePageNavigation(
			currentPage,
			currentQuestions,
			values,
			activePages,
			questions,
		);
		if (nav.action === "submit") {
			if (!isPreview) mutation.mutate();
			return;
		}

		setPageHistory((prev) => [...prev, nav.targetPage]);
		setCurrentPage(nav.targetPage);
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
	};

	const handlePreviousPage = () => {
		if (pageHistory.length <= 1) return;
		const nextHistory = [...pageHistory];
		nextHistory.pop();
		const prevPage = nextHistory[nextHistory.length - 1];
		setPageHistory(nextHistory);
		setCurrentPage(prevPage);
		setMissingIds([]);
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!form || isPreview) return;

		if (displayMode === "pages" && isMultiPage) {
			const currentMissing = missingRequired(currentQuestions, values).map(
				(q) => q.id,
			);
			if (currentMissing.length > 0) {
				setMissingIds(currentMissing);
				const first = document.getElementById(`question-${currentMissing[0]}`);
				first?.scrollIntoView({
					behavior: reduceMotion ? "auto" : "smooth",
					block: "center",
				});
				first?.querySelector<HTMLElement>("input, textarea, button")?.focus({
					preventScroll: true,
				});
				return;
			}
		}

		const missing = missingRequired(reachableQuestions, values).map((q) => q.id);
		setMissingIds(missing);
		if (missing.length === 0) {
			mutation.mutate();
			return;
		}

		// Find page of first missing question if in pages mode
		const firstMissingQ = reachableQuestions.find((q) => q.id === missing[0]);
		if (
			displayMode === "pages" &&
			firstMissingQ &&
			firstMissingQ.page_number &&
			firstMissingQ.page_number !== currentPage
		) {
			setCurrentPage(firstMissingQ.page_number);
			setPageHistory((prev) => [...prev, firstMissingQ.page_number!]);
		}

		const first = document.getElementById(`question-${missing[0]}`);
		first?.scrollIntoView({
			behavior: reduceMotion ? "auto" : "smooth",
			block: "center",
		});
		first?.querySelector<HTMLElement>("input, textarea, button")?.focus({
			preventScroll: true,
		});
	};

	if (isLoading) {
		return (
			<Backdrop>
				<div
					role="status"
					className="flex flex-col items-center gap-3 text-white/80"
				>
					<Loader2 className="size-8 animate-spin" />
					<span className="text-sm">Loading feedback form…</span>
				</div>
			</Backdrop>
		);
	}

	// Closed, inactive or unknown form: keep the ticket, swap in a closing note.
	const closed = isError || !form;
	// ponytail: matches the backend's RecordNotUnique message; the flag covers the normal path.
	const alreadySubmitted =
		!closed &&
		(form.already_submitted === true ||
			(mutation.isError &&
				/already been submitted/i.test(mutation.error.message)));
	const notice = closed
		? {
				heading: "Feedback has closed",
				title: "Thank you for being part of the event",
				body: "This feedback form is no longer taking responses. The organiser may have closed it, or the link has changed. If you still have something to share, reach out to the event organiser directly.",
			}
		: alreadySubmitted
			? {
					heading: form.title,
					title: "You've already shared your feedback",
					body: "We've got your answers for this ticket, so there's nothing more to do. Thanks for helping the organiser make the next event better.",
				}
			: null;
	const answeredCount = reachableQuestions.filter((q) => {
		const v = values[q.id];
		return Array.isArray(v) ? v.length > 0 : Boolean(v?.trim());
	}).length;

	const currentPageMeta = pagesMetadata.find(
		(p) => p.page_number === currentPage,
	);

	return (
		<Backdrop>
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 40, rotate: -1.5 }}
				animate={{ opacity: 1, y: 0, rotate: 0 }}
				transition={{ type: "spring", stiffness: 90, damping: 16 }}
				className="relative mx-auto w-full max-w-2xl drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)] lg:max-w-4xl"
			>
				{/* Ticket stub */}
				<header
					style={notchMask("100%")}
					className="relative flex items-start justify-between gap-6 bg-[#CFF5DD] px-6 pt-7 pb-8 sm:px-10 sm:pt-9"
				>
					<div
						className={cn("min-w-0 space-y-2", notice && "flex-1 text-center")}
					>
						<h1 className="font-bold text-3xl text-[#0F3D2E] leading-tight tracking-tight sm:text-4xl">
							{notice ? notice.heading : form?.title}
						</h1>
						{!notice && form?.description && (
							<p className="max-w-prose whitespace-pre-line text-[#4E6358]">
								{form?.description}
							</p>
						)}
					</div>
					{!notice && !mutation.isSuccess && reachableQuestions.length > 0 && (
						<ProgressRing
							answered={answeredCount}
							total={reachableQuestions.length}
						/>
					)}
				</header>

				{/* Perforated tear line with side notches */}
				<div aria-hidden className="relative h-0 bg-white">
					<span className="absolute inset-x-6 top-0 border-[#0F3D2E]/25 border-t-2 border-dashed" />
				</div>

				<div
					style={notchMask("0")}
					className="bg-white px-6 pt-8 pb-8 sm:px-10"
				>
					{notice ? (
						<div className="flex flex-col items-center gap-4 py-10 text-center">
							<span className="grid size-16 place-items-center bg-[#CFF5DD] text-[#0F3D2E]">
								{closed ? (
									<Heart className="size-8" strokeWidth={2.5} />
								) : (
									<Check className="size-8" strokeWidth={3} />
								)}
							</span>
							<p className="font-bold text-2xl text-[#0F3D2E]">
								{notice.title}
							</p>
							<p className="max-w-md text-[#4E6358]">{notice.body}</p>
						</div>
					) : mutation.isSuccess ? (
						<motion.div
							initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="flex flex-col items-center gap-3 py-10 text-center"
						>
							<span className="grid size-16 place-items-center rounded-full bg-[#23C460] text-white">
								<Check className="size-8" strokeWidth={3} />
							</span>
							<p className="font-bold text-2xl text-[#0F3D2E]">
								{form?.thank_you_title?.trim() || "Thanks for your feedback"}
							</p>
							<p className="text-[#4E6358]">
								{form?.thank_you_message?.trim() ||
									"Your answers help the organiser make the next event better."}
							</p>
							{mutation.data?.certificate_queued && (
								<p className="font-medium text-[#1E7A45]">
									Your e-certificate is on its way to your inbox.
								</p>
							)}
						</motion.div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit} noValidate>
							{isPreview && (
								<p
									role="status"
									className="border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm"
								>
									<strong>Preview only.</strong> Responses aren't collected from
									this link. Attendees answer through their personal link from
									the thank-you email.
								</p>
							)}

							{displayMode === "pages" && isMultiPage ? (
								<motion.div
									key={currentPage}
									initial={reduceMotion ? false : { opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.2 }}
									className="space-y-6"
								>
									{currentQuestions.map((q) => {
										const globalIndex = questions.findIndex(
											(item) => item.id === q.id,
										);
										return (
											<fieldset
												key={q.id}
												id={`question-${q.id}`}
												className={cn(
													"space-y-3 border-b pb-6 transition-colors",
													missingIds.includes(q.id) && "border-destructive/40",
												)}
											>
												<legend className="mb-1 font-medium text-[#0F3D2E]">
													{globalIndex + 1}. {q.question_text}
													{q.required && (
														<span className="text-destructive"> *</span>
													)}
												</legend>
												{q.hint_text?.trim() && (
													<p className="mb-3 text-muted-foreground text-xs leading-relaxed">
														{q.hint_text.trim()}
													</p>
												)}
												<QuestionInput
													question={q}
													value={values[q.id]}
													onChange={(value) => setValue(q.id, value)}
												/>
												{missingIds.includes(q.id) && (
													<p className="text-destructive text-sm">
														Answer this question to continue.
													</p>
												)}
											</fieldset>
										);
									})}

									{mutation.isError && (
										<p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
											{mutation.error.message}
										</p>
									)}

									<div className="flex items-center justify-between gap-4 pt-4">
										{pageHistory.length > 1 ? (
											<Button
												type="button"
												variant="outline"
												className="h-11 rounded-none border-[#0F3D2E]/25 px-5 text-[#0F3D2E] hover:bg-[#CFF5DD]/40"
												onClick={handlePreviousPage}
											>
												<ArrowLeft className="mr-2 size-4" />
												Previous
											</Button>
										) : (
											<div />
										)}

										{nextNav.action === "page" ? (
											<Button
												type="button"
												className="h-11 rounded-none bg-[#0F3D2E] px-6 text-white hover:bg-[#1E7A45]"
												onClick={handleNextPage}
											>
												Next page
												<ArrowRight className="ml-2 size-4" />
											</Button>
										) : (
											<Button
												type="submit"
												className="h-12 rounded-none bg-[#0F3D2E] px-8 text-base text-white hover:bg-[#1E7A45]"
												disabled={mutation.isPending || isPreview}
											>
												{mutation.isPending && (
													<Loader2 className="mr-2 size-4 animate-spin" />
												)}
												{isPreview
													? "Submitting disabled in preview"
													: "Send feedback"}
											</Button>
										)}
									</div>
								</motion.div>
							) : (
								<div className="space-y-6">
									{activePages.map((pageNumber) => {
										const pageMeta = pagesMetadata.find(
											(p) => p.page_number === pageNumber,
										);
										const pageQuestions = questions.filter(
											(q) => (q.page_number ?? 1) === pageNumber,
										);
										if (pageQuestions.length === 0) return null;
										return (
											<div key={pageNumber} className="space-y-6">
												{isMultiPage && (
													<div className="border-b border-[#0F3D2E]/15 pb-2 pt-4 first:pt-0">
														<span className="bg-[#CFF5DD] px-2.5 py-0.5 font-bold text-[#0F3D2E] text-xs uppercase tracking-wide">
															Page {pageNumber}
														</span>
													</div>
												)}
												{pageQuestions.map((q) => {
													const globalIndex = questions.findIndex(
														(item) => item.id === q.id,
													);
													return (
														<fieldset
															key={q.id}
															id={`question-${q.id}`}
															className={cn(
																"space-y-3 border-b pb-6 transition-colors",
																missingIds.includes(q.id) &&
																	"border-destructive/40",
															)}
														>
															<legend className="mb-1 font-medium text-[#0F3D2E]">
																{globalIndex + 1}. {q.question_text}
																{q.required && (
																	<span className="text-destructive"> *</span>
																)}
															</legend>
															{q.hint_text?.trim() && (
																<p className="mb-3 text-muted-foreground text-xs leading-relaxed">
																	{q.hint_text.trim()}
																</p>
															)}
															<QuestionInput
																question={q}
																value={values[q.id]}
																onChange={(value) => setValue(q.id, value)}
															/>
															{missingIds.includes(q.id) && (
																<p className="text-destructive text-sm">
																	Answer this question to submit.
																</p>
															)}
														</fieldset>
													);
												})}
											</div>
										);
									})}

									{mutation.isError && (
										<p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
											{mutation.error.message}
										</p>
									)}

									<Button
										type="submit"
										className="h-12 w-full rounded-none bg-[#0F3D2E] px-8 text-base text-white hover:bg-[#1E7A45] sm:ml-auto sm:flex sm:w-auto"
										disabled={mutation.isPending || isPreview}
									>
										{mutation.isPending && (
											<Loader2 className="mr-2 size-4 animate-spin" />
										)}
										{isPreview
											? "Submitting disabled in preview"
											: "Send feedback"}
									</Button>
								</div>
							)}
						</form>
					)}
				</div>
			</motion.div>
		</Backdrop>
	);
}

/** Event photo backdrop shared by the loading and ticket states. */
function Backdrop({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black px-4 py-10 sm:py-16">
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<Image
					src="/images/homepage/HeroSection.webp"
					alt=""
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
			</div>
			<div className="relative w-full">{children}</div>
			<p className="relative mt-8 text-center text-sm text-white/60">
				Powered by{" "}
				<a href="/" className="font-medium text-white hover:underline">
					EventzFlow
				</a>
			</p>
		</div>
	);
}

/** Cuts half-circle ticket notches into both side edges at the given y. */
function notchMask(y: string): React.CSSProperties {
	const hole = (x: string) =>
		`radial-gradient(circle 16px at ${x} ${y}, #0000 15.5px, #000 16px) ${x === "0" ? "left" : "right"} / 51% 100% no-repeat`;
	const mask = `${hole("0")}, ${hole("100%")}`;
	return { mask, WebkitMask: mask };
}

function ProgressRing({
	answered,
	total,
}: {
	answered: number;
	total: number;
}) {
	const radius = 22;
	const circumference = 2 * Math.PI * radius;
	return (
		<div
			className="relative grid size-16 shrink-0 place-items-center"
			role="img"
			aria-label={`${answered} of ${total} questions answered`}
		>
			<svg
				viewBox="0 0 52 52"
				aria-hidden="true"
				className="absolute inset-0 -rotate-90"
			>
				<circle
					cx="26"
					cy="26"
					r={radius}
					fill="none"
					stroke="#0F3D2E"
					strokeOpacity={0.12}
					strokeWidth={4}
				/>
				<circle
					cx="26"
					cy="26"
					r={radius}
					fill="none"
					stroke="#23C460"
					strokeWidth={4}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * (1 - answered / total)}
					className="transition-[stroke-dashoffset] duration-500"
				/>
			</svg>
			<span className="font-semibold text-[#0F3D2E] text-sm tabular-nums">
				{answered}/{total}
			</span>
		</div>
	);
}

function QuestionInput({
	question,
	value,
	onChange,
}: {
	question: FeedbackQuestion;
	value: string | string[] | undefined;
	onChange: (value: string | string[]) => void;
}) {
	const id = `q-${question.id}`;

	switch (question.question_type) {
		case "rating": {
			const options = question.options;
			const hasPerScoreLabels = Boolean(
				options &&
					options.length === 5 &&
					(options[1]?.trim() || options[2]?.trim() || options[3]?.trim()),
			);
			const lowLabel = options?.[0]?.trim() || "Strongly disagree";
			const highLabel =
				options && options.length === 5
					? options[4]?.trim() || "Strongly agree"
					: options?.[1]?.trim() || "Strongly agree";

			return (
				<div className="w-full space-y-3">
					<div className="mx-auto flex max-w-sm justify-between gap-1 sm:gap-2">
						{[1, 2, 3, 4, 5].map((n) => {
							const stepLabel = options?.[n - 1]?.trim();
							return (
								<label
									key={n}
									className="group flex flex-1 cursor-pointer flex-col items-center gap-1.5 text-center"
								>
									<span className="font-semibold text-foreground text-sm tabular-nums">
										{n}
									</span>
									<input
										type="radio"
										name={id}
										value={n}
										checked={value === String(n)}
										onChange={() => onChange(String(n))}
										className="peer sr-only"
										aria-label={`${n} of 5${stepLabel ? `: ${stepLabel}` : ""}`}
									/>
									<span className="size-7 rounded-full border-2 border-muted-foreground/30 transition-all hover:scale-105 hover:border-[#23C460] peer-checked:border-[#23C460] peer-checked:bg-[#23C460] peer-checked:shadow-[inset_0_0_0_3.5px_var(--background)] peer-focus-visible:outline-2 peer-focus-visible:outline-ring" />
									{hasPerScoreLabels && stepLabel && (
										<span className="line-clamp-2 max-w-[4.5rem] text-[11px] leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
											{stepLabel}
										</span>
									)}
								</label>
							);
						})}
					</div>
					{!hasPerScoreLabels && (
						<div className="mx-auto flex max-w-sm justify-between text-muted-foreground text-xs sm:text-sm">
							<span>{lowLabel}</span>
							<span>{highLabel}</span>
						</div>
					)}
				</div>
			);
		}
		case "text":
			return (
				<Textarea
					id={id}
					className="rounded-none"
					placeholder={question.placeholder || undefined}
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case "yes_no":
		case "single_choice": {
			const options =
				question.question_type === "yes_no"
					? [
							{ value: "yes", label: "Yes" },
							{ value: "no", label: "No" },
						]
					: (question.options ?? []).map((o) => ({ value: o, label: o }));
			return (
				<RadioGroup value={(value as string) ?? ""} onValueChange={onChange}>
					{options.map((o, i) => (
						<div key={o.value} className="flex items-center gap-2">
							<RadioGroupItem value={o.value} id={`${id}-${i}`} />
							<Label htmlFor={`${id}-${i}`} className="font-normal">
								{o.label}
							</Label>
						</div>
					))}
				</RadioGroup>
			);
		}
		case "multi_choice": {
			const selected = (value as string[]) ?? [];
			return (
				<div className="grid gap-3">
					{(question.options ?? []).map((o, i) => (
						<div key={o} className="flex items-center gap-2">
							<Checkbox
								id={`${id}-${i}`}
								className="rounded-none"
								checked={selected.includes(o)}
								onCheckedChange={(checked) =>
									onChange(
										checked
											? [...selected, o]
											: selected.filter((x) => x !== o),
									)
								}
							/>
							<Label htmlFor={`${id}-${i}`} className="font-normal">
								{o}
							</Label>
						</div>
					))}
				</div>
			);
		}
	}
}
