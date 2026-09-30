"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	Copy,
	ExternalLink,
	Loader2,
	Plus,
	Save,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	type FeedbackForm,
	type FeedbackQuestionType,
	saveFeedbackForm,
} from "@/lib/api/feedback-form";
import { AttendeeFeedbackLink } from "./attendee-feedback-link";
import { QuestionLivePreview } from "./question-live-preview";

const QUESTION_TYPES: { value: FeedbackQuestionType; label: string }[] = [
	{ value: "rating", label: "Rating (1–5)" },
	{ value: "text", label: "Text" },
	{ value: "single_choice", label: "Single choice" },
	{ value: "multi_choice", label: "Multiple choice" },
];

const parseRatingLabels = (
	options: string[] | null | undefined,
): [string, string, string, string, string] => {
	if (!options || options.length === 0) return ["", "", "", "", ""];
	if (options.length === 5) {
		return [
			options[0] ?? "",
			options[1] ?? "",
			options[2] ?? "",
			options[3] ?? "",
			options[4] ?? "",
		];
	}
	if (options.length === 2) {
		return [options[0] ?? "", "", "", "", options[1] ?? ""];
	}
	return ["", "", "", "", ""];
};

const isChoice = (type?: FeedbackQuestionType | "") =>
	type === "single_choice" || type === "multi_choice";

type DraftQuestion = {
	key: string;
	id?: number;
	question_text: string;
	question_type: FeedbackQuestionType | "";
	optionsText: string; // one option per line
	optionKeys: string[];
	ratingLabels: [string, string, string, string, string];
	ratingCustomAll: boolean;
	required: boolean;
	placeholder: string;
	hint_text: string;
};

type FeedbackFormBuilderProps = {
	eventId: string;
	eventSlug: string;
	form: FeedbackForm | null;
};

// Parent remounts this after every load/save so state initialises from the saved form.
export function FeedbackFormBuilder({
	eventId,
	eventSlug,
	form,
}: FeedbackFormBuilderProps) {
	const queryClient = useQueryClient();
	const [initial] = useState(() => ({
		title: form?.title ?? "Event Feedback",
		description: form?.description ?? "",
		isActive: form?.is_active ?? true,
		questions:
			form?.questions.map((q) => {
				const ratingLabels = parseRatingLabels(q.options);
				const hasMiddleLabels = Boolean(
					ratingLabels[1]?.trim() ||
						ratingLabels[2]?.trim() ||
						ratingLabels[3]?.trim(),
				);
				return {
					key: String(q.id),
					id: q.id,
					question_text: q.question_text,
					question_type: q.question_type,
					optionsText:
						q.question_type !== "rating" && q.options?.length
							? `${q.options.join("\n")}\n`
							: "",
					optionKeys: [
						...(q.question_type !== "rating" ? (q.options ?? []) : []).map(
							(_, index) => `${q.id}-${index}`,
						),
						`${q.id}-new`,
					],
					ratingLabels,
					ratingCustomAll: hasMiddleLabels,
					required: q.required,
					placeholder: q.placeholder ?? "",
					hint_text: q.hint_text ?? "",
				};
			}) ?? [],
	}));
	const [title, setTitle] = useState(initial.title);
	const [description, setDescription] = useState(initial.description);
	const [isActive, setIsActive] = useState(initial.isActive);
	const [questions, setQuestions] = useState<DraftQuestion[]>(
		initial.questions,
	);
	const isDirty =
		title !== initial.title ||
		description !== initial.description ||
		isActive !== initial.isActive ||
		JSON.stringify(questions.map(({ optionKeys, ...q }) => q)) !==
			JSON.stringify(initial.questions.map(({ optionKeys, ...q }) => q));

	const publicUrl =
		typeof window === "undefined"
			? ""
			: `${window.location.origin}/events/${eventSlug}/feedback`;

	const mutation = useMutation({
		mutationFn: () => {
			const missingTypeIndex = questions.findIndex((q) => !q.question_type);
			if (missingTypeIndex !== -1) {
				const msg = `Please select an answer type for Question ${missingTypeIndex + 1}.`;
				toast.error(msg);
				throw new Error(msg);
			}

			return saveFeedbackForm(
				eventId,
				{
					title: title.trim(),
					description: description.trim() || null,
					is_active: isActive,
					feedback_questions_attributes: questions.map((q, index) => ({
						id: q.id,
						question_text: q.question_text.trim(),
						question_type: q.question_type as FeedbackQuestionType,
						options:
							q.question_type === "rating"
								? q.ratingLabels.some((l) => l.trim())
									? q.ratingLabels.map((l) => l.trim())
									: null
								: isChoice(q.question_type)
									? q.optionsText
											.split("\n")
											.map((o) => o.trim())
											.filter(Boolean)
									: null,
						required: q.required,
						position: index,
						placeholder:
							q.question_type === "text"
								? q.placeholder.trim() || null
								: null,
						hint_text: q.hint_text.trim() || null,
					})),
				},
				form !== null,
			);
		},
		onSuccess: (saved) => {
			queryClient.setQueryData(["event", eventId, "feedback-form"], saved);
			toast.success("Feedback form saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const update = (key: string, patch: Partial<DraftQuestion>) =>
		setQuestions((qs) =>
			qs.map((q) => (q.key === key ? { ...q, ...patch } : q)),
		);

	const updateOptions = (key: string, index: number, values: string[]) =>
		setQuestions((qs) =>
			qs.map((q) => {
				if (q.key !== key) return q;
				const rows = q.optionsText.split("\n");
				const optionKeys = [...q.optionKeys];
				rows.splice(index, 1, ...values);
				optionKeys.splice(
					index,
					1,
					...values.map((_, valueIndex) =>
						valueIndex === 0 ? q.optionKeys[index] : crypto.randomUUID(),
					),
				);
				while (
					rows.length > 1 &&
					!rows[rows.length - 1]?.trim() &&
					!rows[rows.length - 2]?.trim()
				) {
					rows.pop();
					optionKeys.pop();
				}
				if (rows[rows.length - 1]?.trim()) {
					rows.push("");
					optionKeys.push(crypto.randomUUID());
				}
				return { ...q, optionsText: rows.join("\n"), optionKeys };
			}),
		);

	const move = (index: number, delta: number) =>
		setQuestions((qs) => {
			const next = [...qs];
			const [item] = next.splice(index, 1);
			next.splice(index + delta, 0, item);
			return next;
		});

	const updateRatingLabel = (
		key: string,
		labelIndex: number,
		value: string,
	) =>
		setQuestions((qs) =>
			qs.map((q) => {
				if (q.key !== key) return q;
				const nextLabels = [...q.ratingLabels] as [
					string,
					string,
					string,
					string,
					string,
				];
				nextLabels[labelIndex] = value;
				return { ...q, ratingLabels: nextLabels };
			}),
		);

	const addQuestion = () =>
		setQuestions((qs) => [
			...qs,
			{
				key: crypto.randomUUID(),
				question_text: "",
				question_type: "",
				optionsText: "",
				optionKeys: [crypto.randomUUID()],
				ratingLabels: ["", "", "", "", ""],
				ratingCustomAll: false,
				required: false,
				placeholder: "",
				hint_text: "",
			},
		]);

	const copyLink = async () => {
		await navigator.clipboard.writeText(publicUrl);
		toast.success("Link copied");
	};

	return (
		<form
			className="w-full pb-8"
			onSubmit={(e) => {
				e.preventDefault();
				mutation.mutate();
			}}
		>
			<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
				<div className="min-w-0 space-y-6">
					<section className="border bg-background">
						<div className="border-b px-5 py-4 sm:px-6">
							<h2 className="font-semibold text-base">Form details</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Introduce the form attendees will see.
							</p>
						</div>
						<div className="space-y-5 p-5 sm:p-6">
							<div className="space-y-2">
								<Label htmlFor="feedback-title">Form title</Label>
								<Input
									id="feedback-title"
									className="rounded-none"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="feedback-description">
									Description (optional)
								</Label>
								<Textarea
									id="feedback-description"
									className="min-h-24 rounded-none"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Tell attendees what this feedback is for (optional)"
								/>
							</div>
						</div>
					</section>

					<section className="border bg-background">
						<div className="border-b px-5 py-4 sm:px-6">
							<h2 className="font-semibold text-base">Questions</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								{questions.length}{" "}
								{questions.length === 1 ? "question" : "questions"} in this form
							</p>
						</div>
						{questions.length === 0 && (
							<p className="px-5 py-8 text-muted-foreground text-sm sm:px-6">
								No questions yet. Add one to start collecting feedback.
							</p>
						)}
						<div className="divide-y">
							{questions.map((q, index) => (
								<div key={q.key} className="space-y-5 p-5 sm:p-6">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-3">
											<span className="flex size-8 items-center justify-center border bg-muted/40 font-mono text-muted-foreground text-xs">
												{String(index + 1).padStart(2, "0")}
											</span>
											<h3 className="font-medium text-sm">
												Question {index + 1}
											</h3>
										</div>
										<div className="flex gap-1">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												className="rounded-none"
												disabled={index === 0}
												onClick={() => move(index, -1)}
												aria-label={`Move question ${index + 1} up`}
											>
												<ArrowUp className="size-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												className="rounded-none"
												disabled={index === questions.length - 1}
												onClick={() => move(index, 1)}
												aria-label={`Move question ${index + 1} down`}
											>
												<ArrowDown className="size-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												className="rounded-none text-destructive hover:text-destructive"
												onClick={() =>
													setQuestions((qs) =>
														qs.filter((x) => x.key !== q.key),
													)
												}
												aria-label={`Remove question ${index + 1}`}
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor={`question-${q.key}`}>Question text</Label>
										<Input
											id={`question-${q.key}`}
											className="rounded-none"
											value={q.question_text}
											onChange={(e) =>
												update(q.key, { question_text: e.target.value })
											}
											placeholder="e.g. How would you rate the event?"
											required
										/>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="space-y-1.5">
											<Label
												htmlFor={`hint-${q.key}`}
												className="text-muted-foreground text-xs"
											>
												Helpful hint / subtitle (optional)
											</Label>
											<Input
												id={`hint-${q.key}`}
												className="h-8 rounded-none text-xs"
												value={q.hint_text}
												onChange={(e) =>
													update(q.key, { hint_text: e.target.value })
												}
												placeholder="e.g. Briefly describe in 1–2 sentences"
											/>
										</div>
										{q.question_type === "text" ? (
											<div className="space-y-1.5">
												<Label
													htmlFor={`placeholder-${q.key}`}
													className="text-muted-foreground text-xs"
												>
													Textarea placeholder (optional)
												</Label>
												<Input
													id={`placeholder-${q.key}`}
													className="h-8 rounded-none text-xs"
													value={q.placeholder}
													onChange={(e) =>
														update(q.key, { placeholder: e.target.value })
													}
													placeholder="e.g. Type your feedback here..."
												/>
											</div>
										) : null}
									</div>
									<div className="grid gap-x-6 gap-y-2 sm:grid-cols-[16rem_auto]">
										<Label htmlFor={`type-${q.key}`}>Answer type</Label>
										<Select
											value={q.question_type || undefined}
											onValueChange={(value) =>
												update(q.key, {
													question_type: value as FeedbackQuestionType,
													...(value === "single_choice" || value === "multi_choice"
														? {
																optionsText:
																	q.optionsText || "Option 1\nOption 2\n",
																optionKeys:
																	q.optionKeys.length > 1
																		? q.optionKeys
																		: [
																				crypto.randomUUID(),
																				crypto.randomUUID(),
																				crypto.randomUUID(),
																			],
															}
														: {}),
												})
											}
										>
											<SelectTrigger
												id={`type-${q.key}`}
												className="w-full rounded-none sm:col-start-1 sm:row-start-2"
											>
												<SelectValue placeholder="Select answer type" />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												{QUESTION_TYPES.map((t) => (
													<SelectItem
														key={t.value}
														value={t.value}
														className="rounded-none"
													>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<div className="flex h-9 items-center gap-2 sm:col-start-2 sm:row-start-2">
											<Switch
												id={`required-${q.key}`}
												checked={q.required}
												onCheckedChange={(required) =>
													update(q.key, { required })
												}
												className="rounded-none [&_[data-slot=switch-thumb]]:rounded-none"
											/>
											<Label htmlFor={`required-${q.key}`}>Required</Label>
										</div>
									</div>
									{isChoice(q.question_type) && (
										<fieldset className="space-y-2">
											<legend className="font-medium text-sm">Options</legend>
											<p className="text-muted-foreground text-xs">
												Answer choices attendees can select.
											</p>
											<div className="space-y-2">
												{q.optionsText
													.split("\n")
													.map((option, optionIndex, rows) => (
														<div
															key={q.optionKeys[optionIndex]}
															className="flex items-center gap-2"
														>
															<span className="w-6 shrink-0 text-center font-mono text-muted-foreground text-xs">
																{String(optionIndex + 1).padStart(2, "0")}
															</span>
															<Input
																id={`options-${q.key}-${optionIndex}`}
																className="rounded-none"
																value={option}
																placeholder={`Option ${optionIndex + 1}`}
																aria-label={`Option ${optionIndex + 1} for question ${index + 1}`}
																required={
																	optionIndex === 0 &&
																	!rows.some((row) => row.trim())
																}
																onChange={(e) =>
																	updateOptions(q.key, optionIndex, [
																		e.target.value,
																	])
																}
																onPaste={(e) => {
																	const pasted = e.clipboardData
																		.getData("text")
																		.split(/\r\n?|\n/)
																		.map((value) => value.trim())
																		.filter(Boolean);
																	if (pasted.length > 1) {
																		e.preventDefault();
																		updateOptions(q.key, optionIndex, pasted);
																	}
																}}
																onKeyDown={(e) => {
																	if (e.key === "Enter") {
																		e.preventDefault();
																		document
																			.getElementById(
																				`options-${q.key}-${optionIndex + 1}`,
																			)
																			?.focus();
																	}
																}}
															/>
															{optionIndex < rows.length - 1 ? (
																<Button
																	type="button"
																	variant="ghost"
																	size="icon-sm"
																	className="rounded-none text-muted-foreground"
																	onClick={() =>
																		updateOptions(q.key, optionIndex, [])
																	}
																	aria-label={`Remove option ${optionIndex + 1}`}
																>
																	<Trash2 className="size-4" />
																</Button>
															) : (
																<span className="size-8 shrink-0" />
															)}
														</div>
													))}
											</div>
										</fieldset>
									)}

									{q.question_type === "rating" && (
										<fieldset className="space-y-3 rounded-none border bg-muted/10 p-4">
											<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
												<div>
													<legend className="font-medium text-sm">
														Rating scale labels (optional)
													</legend>
													<p className="text-muted-foreground text-xs">
														Add labels to guide attendees on the meaning of each score.
													</p>
												</div>
												<div className="flex items-center gap-2">
													<Switch
														id={`custom-all-${q.key}`}
														checked={q.ratingCustomAll}
														onCheckedChange={(checked) =>
															update(q.key, { ratingCustomAll: checked })
														}
														className="rounded-none [&_[data-slot=switch-thumb]]:rounded-none"
													/>
													<Label
														htmlFor={`custom-all-${q.key}`}
														className="text-xs font-normal"
													>
														Label all 5 scores
													</Label>
												</div>
											</div>

											{!q.ratingCustomAll ? (
												<div className="grid gap-3 pt-1 sm:grid-cols-2">
													<div className="space-y-1.5">
														<Label
															htmlFor={`rating-low-${q.key}`}
															className="text-xs"
														>
															Score 1 Label (Lowest)
														</Label>
														<Input
															id={`rating-low-${q.key}`}
															className="h-8 rounded-none text-sm"
															value={q.ratingLabels[0]}
															placeholder="e.g. Strongly disagree"
															onChange={(e) =>
																updateRatingLabel(q.key, 0, e.target.value)
															}
														/>
													</div>
													<div className="space-y-1.5">
														<Label
															htmlFor={`rating-high-${q.key}`}
															className="text-xs"
														>
															Score 5 Label (Highest)
														</Label>
														<Input
															id={`rating-high-${q.key}`}
															className="h-8 rounded-none text-sm"
															value={q.ratingLabels[4]}
															placeholder="e.g. Strongly agree"
															onChange={(e) =>
																updateRatingLabel(q.key, 4, e.target.value)
															}
														/>
													</div>
												</div>
											) : (
												<div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-5">
													{[1, 2, 3, 4, 5].map((num) => (
														<div key={num} className="space-y-1.5">
															<Label
																htmlFor={`rating-step-${q.key}-${num}`}
																className="font-mono text-xs"
															>
																Score {num}
															</Label>
															<Input
																id={`rating-step-${q.key}-${num}`}
																className="h-8 rounded-none text-xs"
																value={q.ratingLabels[num - 1]}
																placeholder={
																	num === 1
																		? "Lowest"
																		: num === 5
																			? "Highest"
																			: `Score ${num}`
																}
																onChange={(e) =>
																	updateRatingLabel(
																		q.key,
																		num - 1,
																		e.target.value,
																	)
																}
															/>
														</div>
													))}
												</div>
											)}
										</fieldset>
									)}

									{/* Live interactive question preview */}
									<QuestionLivePreview
										questionText={q.question_text}
										questionType={q.question_type}
										required={q.required}
										options={
											isChoice(q.question_type)
												? q.optionsText
														.split("\n")
														.map((o) => o.trim())
														.filter(Boolean)
												: []
										}
										ratingLabels={q.ratingLabels}
										placeholder={q.placeholder}
										hintText={q.hint_text}
									/>
								</div>
							))}
						</div>
						<div className="border-t p-5 sm:px-6">
							<Button
								type="button"
								variant="outline"
								className="rounded-none"
								onClick={addQuestion}
							>
								<Plus className="size-4" />
								Add question
							</Button>
						</div>
					</section>
				</div>

				<aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
					<section className="border bg-background">
						<div className="flex items-center justify-between border-b px-5 py-4">
							<h2 className="font-semibold text-base">Availability</h2>
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								{isActive ? "Open" : "Closed"}
							</span>
						</div>
						<div className="flex items-start justify-between gap-3 p-5">
							<div className="space-y-1">
								<Label htmlFor="feedback-active">Accepting responses</Label>
								<p className="text-muted-foreground text-sm">
									When closed, the public form is unavailable.
								</p>
							</div>
							<Switch
								id="feedback-active"
								checked={isActive}
								onCheckedChange={setIsActive}
								className="mt-0.5 rounded-none [&_[data-slot=switch-thumb]]:rounded-none"
							/>
						</div>
					</section>

					<section className="border bg-background">
						<div className="border-b px-5 py-4">
							<h2 className="font-semibold text-base">Preview & links</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Attendees get their own link in the thank-you email. Use this to
								preview the form or copy a link for one attendee.
							</p>
						</div>
						<div className="space-y-3 p-5">
							{form ? (
								<>
									<Label htmlFor="feedback-public-link">Preview link</Label>
									<Input
										id="feedback-public-link"
										value={publicUrl}
										readOnly
										className="rounded-none"
									/>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											className="flex-1 rounded-none"
											onClick={copyLink}
										>
											<Copy className="size-4" />
											Copy preview link
										</Button>
										<Button
											type="button"
											variant="outline"
											size="icon"
											asChild
											className="rounded-none"
											aria-label="Open form preview"
										>
											<a href={publicUrl} target="_blank" rel="noreferrer">
												<ExternalLink className="size-4" />
											</a>
										</Button>
									</div>
									<p className="text-muted-foreground text-xs">
										Preview only: it can't submit responses. To send it
										yourself, add <code>?ticket=&lt;ticket public ID&gt;</code>{" "}
										so the response is saved against that attendee, or pick one
										below.
									</p>
									<AttendeeFeedbackLink
										eventId={eventId}
										publicUrl={publicUrl}
									/>
								</>
							) : (
								<p className="text-muted-foreground text-sm">
									Save the form to create its public link.
								</p>
							)}
						</div>
					</section>

					{isDirty && (
						<div
							role="status"
							className="border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
						>
							<p className="font-semibold text-sm">Unsaved changes</p>
							<p className="mt-1 text-sm">
								Click Save form to apply your edits.
							</p>
						</div>
					)}
					<Button
						type="submit"
						className="h-10 w-full rounded-none"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Save className="size-4" />
						)}
						Save form
					</Button>
				</aside>
			</div>
		</form>
	);
}
