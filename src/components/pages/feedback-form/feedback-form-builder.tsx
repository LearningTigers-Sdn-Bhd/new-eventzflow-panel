"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	Copy,
	ExternalLink,
	GitFork,
	Loader2,
	Plus,
	Save,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	type FeedbackDisplayMode,
	type FeedbackForm,
	type FeedbackQuestionType,
	type FeedbackRoutingRule,
	saveFeedbackForm,
} from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";
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
	page_number: number;
	routing_rules: FeedbackRoutingRule[];
};

type DraftPage = {
	page_number: number;
	title: string;
	description: string;
};

type PendingDelete =
	| { type: "question"; key: string; number: number }
	| { type: "page"; pageNumber: number };

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
	const [initial] = useState(() => {
		const rawPages = form?.pages_metadata ?? [];
		const qPages = [
			...new Set(form?.questions.map((q) => q.page_number ?? 1) ?? []),
		];
		const allPageNums = [
			...new Set([...rawPages.map((p) => p.page_number), ...qPages, 1]),
		].sort((a, b) => a - b);
		const pages: DraftPage[] = allPageNums.map((num) => {
			const existing = rawPages.find((p) => p.page_number === num);
			return {
				page_number: num,
				title: existing?.title ?? "",
				description: existing?.description ?? "",
			};
		});

		const questions: DraftQuestion[] =
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
					page_number: q.page_number ?? 1,
					routing_rules: q.routing_rules ?? [],
				};
			}) ?? [];

		return {
			title: form?.title ?? "Event Feedback",
			description: form?.description ?? "",
			isActive: form?.is_active ?? true,
			displayMode: form?.display_mode ?? ("pages" as FeedbackDisplayMode),
			thankYouTitle: form?.thank_you_title ?? "Thanks for your feedback",
			thankYouMessage:
				form?.thank_you_message ??
				"Your answers help the organiser make the next event better.",
			pages,
			questions,
		};
	});

	const [title, setTitle] = useState(initial.title);
	const [description, setDescription] = useState(initial.description);
	const [isActive, setIsActive] = useState(initial.isActive);
	const [displayMode, setDisplayMode] = useState<FeedbackDisplayMode>(
		initial.displayMode,
	);
	const [thankYouTitle, setThankYouTitle] = useState(initial.thankYouTitle);
	const [thankYouMessage, setThankYouMessage] = useState(
		initial.thankYouMessage,
	);
	const [pages, setPages] = useState<DraftPage[]>(initial.pages);
	const [questions, setQuestions] = useState<DraftQuestion[]>(
		initial.questions,
	);
	const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

	const isDirty =
		title !== initial.title ||
		description !== initial.description ||
		isActive !== initial.isActive ||
		displayMode !== initial.displayMode ||
		thankYouTitle !== initial.thankYouTitle ||
		thankYouMessage !== initial.thankYouMessage ||
		JSON.stringify(pages) !== JSON.stringify(initial.pages) ||
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
					display_mode: displayMode,
					thank_you_title: thankYouTitle.trim() || null,
					thank_you_message: thankYouMessage.trim() || null,
					pages_metadata: pages.map((p) => ({
						page_number: p.page_number,
						title: p.title.trim() || null,
						description: p.description.trim() || null,
					})),
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
						page_number: q.page_number ?? 1,
						routing_rules:
							q.routing_rules && q.routing_rules.length > 0
								? q.routing_rules
								: [],
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

	const updatePage = (pageNumber: number, patch: Partial<DraftPage>) => {
		setPages((ps) =>
			ps.map((p) => (p.page_number === pageNumber ? { ...p, ...patch } : p)),
		);
	};

	const addPage = () => {
		const nextPageNumber =
			pages.length > 0
				? Math.max(...pages.map((p) => p.page_number)) + 1
				: 1;
		setPages((prev) => [
			...prev,
			{ page_number: nextPageNumber, title: "", description: "" },
		]);
		addQuestionToPage(nextPageNumber);
		toast.success(`Page ${nextPageNumber} added`);
	};

	const deletePage = (pageNumber: number) => {
		if (pages.length <= 1) return;
		const targetFallbackPage = Math.max(1, pageNumber - 1);
		const updatedQuestions = questions.map((q) =>
			q.page_number === pageNumber
				? { ...q, page_number: targetFallbackPage }
				: q,
		);
		const remainingPages = pages.filter((p) => p.page_number !== pageNumber);
		const pageMapping = new Map<number, number>();
		remainingPages.forEach((p, idx) => {
			pageMapping.set(p.page_number, idx + 1);
		});
		const renumberedPages = remainingPages.map((p, idx) => ({
			...p,
			page_number: idx + 1,
		}));
		const renumberedQuestions = updatedQuestions.map((q) => {
			const newPageNum = pageMapping.get(q.page_number) ?? 1;
			const updatedRules = (q.routing_rules ?? []).map((rule) => {
				if (rule.target_page && pageMapping.has(rule.target_page)) {
					return { ...rule, target_page: pageMapping.get(rule.target_page)! };
				}
				return rule;
			});
			return {
				...q,
				page_number: newPageNum,
				routing_rules: updatedRules,
			};
		});

		setPages(renumberedPages);
		setQuestions(renumberedQuestions);
		toast.info(`Page ${pageNumber} deleted. Questions reassigned.`);
	};

	const addQuestionToPage = (pageNumber: number) => {
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
				page_number: pageNumber,
				routing_rules: [],
			},
		]);
	};

	const moveQuestionWithinPage = (
		pageNumber: number,
		localIndex: number,
		delta: number,
	) => {
		setQuestions((prevQuestions) => {
			const pageQuestions = prevQuestions.filter(
				(q) => (q.page_number ?? 1) === pageNumber,
			);
			const targetLocalIndex = localIndex + delta;
			if (targetLocalIndex < 0 || targetLocalIndex >= pageQuestions.length) {
				return prevQuestions;
			}

			const itemToMove = pageQuestions[localIndex];
			const itemToSwap = pageQuestions[targetLocalIndex];

			const globalIndexA = prevQuestions.findIndex(
				(q) => q.key === itemToMove.key,
			);
			const globalIndexB = prevQuestions.findIndex(
				(q) => q.key === itemToSwap.key,
			);

			const next = [...prevQuestions];
			next[globalIndexA] = itemToSwap;
			next[globalIndexB] = itemToMove;
			return next;
		});
	};

	const moveQuestionToPage = (questionKey: string, targetPage: number) => {
		setQuestions((qs) =>
			qs.map((q) =>
				q.key === questionKey ? { ...q, page_number: targetPage } : q,
			),
		);
	};

	const duplicateQuestion = (key: string) => {
		const index = questions.findIndex((q) => q.key === key);
		if (index === -1) return;
		const source = questions[index];
		const newKey = crypto.randomUUID();
		const copy: DraftQuestion = {
			...source,
			id: undefined,
			key: newKey,
			question_text: source.question_text
				? `${source.question_text} (Copy)`
				: "",
			optionKeys: source.optionKeys.map(() => crypto.randomUUID()),
			routing_rules: source.routing_rules ? [...source.routing_rules] : [],
		};
		const next = [...questions];
		next.splice(index + 1, 0, copy);
		setQuestions(next);
		toast.success("Question duplicated");

		// Automatically scroll to the duplicated question and focus its prompt input
		setTimeout(() => {
			const el = document.getElementById(`builder-question-${newKey}`);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
				const input = el.querySelector<HTMLInputElement>(`#question-${newKey}`);
				input?.focus();
			}
		}, 60);
	};

	const deleteQuestion = (key: string) => {
		setQuestions((qs) => qs.filter((q) => q.key !== key));
	};

	// Detect if question has existing content entered
	const questionHasData = (q: DraftQuestion): boolean => {
		if (q.question_text.trim()) return true;
		if (q.hint_text.trim()) return true;
		if (q.placeholder.trim()) return true;
		if (isChoice(q.question_type) && q.optionsText.trim()) return true;
		if (
			q.question_type === "rating" &&
			q.ratingLabels.some((l) => l.trim())
		)
			return true;
		if (q.routing_rules && q.routing_rules.length > 0) return true;
		return false;
	};

	// Detect if page has existing title/description or questions with data
	const pageHasData = (pageNumber: number): boolean => {
		const p = pages.find((page) => page.page_number === pageNumber);
		if (!p) return false;
		if (p.title.trim() || p.description.trim()) return true;
		const pageQuestions = questions.filter(
			(q) => (q.page_number ?? 1) === pageNumber,
		);
		return pageQuestions.some(questionHasData);
	};

	const requestDeleteQuestion = (q: DraftQuestion, globalNumber: number) => {
		if (questionHasData(q)) {
			setPendingDelete({ type: "question", key: q.key, number: globalNumber });
		} else {
			deleteQuestion(q.key);
		}
	};

	const requestDeletePage = (pageNumber: number) => {
		if (pageHasData(pageNumber)) {
			setPendingDelete({ type: "page", pageNumber });
		} else {
			deletePage(pageNumber);
		}
	};

	const copyLink = async () => {
		await navigator.clipboard.writeText(publicUrl);
		toast.success("Link copied");
	};

	return (
		<>
			<form
				className="w-full pb-8"
				onSubmit={(e) => {
					e.preventDefault();
					mutation.mutate();
				}}
			>
				<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
					<div className="min-w-0 space-y-6">
						{/* Form Overview details - directly show title and description */}
						<section className="space-y-4 border bg-background p-5 sm:p-6">
							<div className="space-y-1.5">
								<Label htmlFor="feedback-title">Form title</Label>
								<Input
									id="feedback-title"
									className="rounded-none"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="feedback-description">Description</Label>
								<Textarea
									id="feedback-description"
									className="min-h-20 rounded-none"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Tell attendees what this feedback is for"
								/>
							</div>
						</section>

						{/* Pages & Sections with nested questions */}
						{pages.map((p) => {
							const pageQuestions = questions.filter(
								(q) => (q.page_number ?? 1) === p.page_number,
							);
							return (
								<section key={p.page_number} className="border bg-background">
									<div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/20 px-5 py-4 sm:px-6">
										<div className="flex items-center gap-3">
											<span className="bg-[#23C460] px-2.5 py-1 font-bold text-white text-xs uppercase tracking-wide">
												Page {p.page_number}
											</span>
											<span className="text-muted-foreground text-xs">
												({pageQuestions.length}{" "}
												{pageQuestions.length === 1 ? "question" : "questions"})
											</span>
										</div>
										{pages.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
												onClick={() => requestDeletePage(p.page_number)}
											>
												<Trash2 className="mr-1 size-3.5" />
												Delete page
											</Button>
										)}
									</div>

									{/* Page Title & Description inputs */}
									<div className="grid gap-3 border-b bg-muted/10 p-5 sm:grid-cols-2 sm:px-6">
										<div className="space-y-1.5">
											<Label className="text-xs">Page title (optional)</Label>
											<Input
												value={p.title}
												placeholder={`e.g. Page ${p.page_number} details`}
												className="rounded-none bg-background text-sm"
												onChange={(e) =>
													updatePage(p.page_number, { title: e.target.value })
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label className="text-xs">
												Page subtitle / description (optional)
											</Label>
											<Input
												value={p.description}
												placeholder="Short guidance for this page"
												className="rounded-none bg-background text-sm"
												onChange={(e) =>
													updatePage(p.page_number, {
														description: e.target.value,
													})
												}
											/>
										</div>
									</div>

									{/* Questions on this page */}
									{pageQuestions.length === 0 ? (
										<p className="px-5 py-8 text-muted-foreground text-sm sm:px-6">
											No questions on this page yet.
										</p>
									) : (
										<div className="space-y-4 bg-muted/20 p-4 sm:p-6">
											{pageQuestions.map((q) => {
												const globalIndex = questions.findIndex(
													(item) => item.key === q.key,
												);
												const pageIndex = pageQuestions.findIndex(
													(item) => item.key === q.key,
												);
												const hasHint = Boolean(q.hint_text);
												const hasPlaceholder = Boolean(q.placeholder);

												return (
													<div
														key={q.key}
														id={`builder-question-${q.key}`}
														className="space-y-4 border bg-background p-5 shadow-xs sm:p-6"
													>
														{/* Header: Number Badge and Action Buttons */}
														<div className="flex flex-wrap items-center justify-between gap-3">
															<div className="flex items-center gap-3">
																<span className="flex size-7 items-center justify-center border border-muted-foreground/20 bg-muted/60 font-mono font-semibold text-foreground text-xs shadow-xs">
																	{String(globalIndex + 1).padStart(2, "0")}
																</span>
																{q.question_text ? (
																	<span className="max-w-[14rem] truncate font-medium text-foreground text-sm sm:max-w-md">
																		{q.question_text}
																	</span>
																) : (
																	<span className="text-muted-foreground text-xs italic">
																		Untitled question
																	</span>
																)}
															</div>
															<div className="flex flex-wrap items-center gap-1.5">
																{pages.length > 1 && (
																	<Select
																		value={String(q.page_number)}
																		onValueChange={(val) =>
																			moveQuestionToPage(q.key, Number(val))
																		}
																	>
																		<SelectTrigger className="h-8 w-36 rounded-none text-xs">
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			{pages.map((targetP) => (
																				<SelectItem
																					key={targetP.page_number}
																					value={String(targetP.page_number)}
																				>
																					Move to Page {targetP.page_number}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																)}

																<Button
																	type="button"
																	variant="ghost"
																	size="icon-sm"
																	className="rounded-none"
																	disabled={pageIndex === 0}
																	onClick={() =>
																		moveQuestionWithinPage(
																			p.page_number,
																			pageIndex,
																			-1,
																		)
																	}
																	aria-label={`Move question ${globalIndex + 1} up`}
																>
																	<ArrowUp className="size-4" />
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon-sm"
																	className="rounded-none"
																	disabled={
																		pageIndex === pageQuestions.length - 1
																	}
																	onClick={() =>
																		moveQuestionWithinPage(
																			p.page_number,
																			pageIndex,
																			1,
																		)
																	}
																	aria-label={`Move question ${globalIndex + 1} down`}
																>
																	<ArrowDown className="size-4" />
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon-sm"
																	className="rounded-none"
																	onClick={() => duplicateQuestion(q.key)}
																	aria-label={`Duplicate question ${globalIndex + 1}`}
																>
																	<Copy className="size-4" />
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon-sm"
																	className="rounded-none text-destructive hover:text-destructive"
																	onClick={() =>
																		requestDeleteQuestion(q, globalIndex + 1)
																	}
																	aria-label={`Remove question ${globalIndex + 1}`}
																>
																	<Trash2 className="size-4" />
																</Button>
															</div>
														</div>

														{/* Desktop row: Question text, Answer type, Required Checkbox */}
														<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
															<div className="min-w-0 flex-1 space-y-1.5">
																<Label htmlFor={`question-${q.key}`}>
																	Question text
																</Label>
																<Input
																	id={`question-${q.key}`}
																	className="rounded-none"
																	value={q.question_text}
																	onChange={(e) =>
																		update(q.key, {
																			question_text: e.target.value,
																		})
																	}
																	placeholder="e.g. How would you rate the event?"
																	required
																/>
															</div>

															<div className="w-full space-y-1.5 sm:w-48">
																<Label htmlFor={`type-${q.key}`}>
																	Answer type
																</Label>
																<Select
																	value={q.question_type || undefined}
																	onValueChange={(value) =>
																		update(q.key, {
																			question_type:
																				value as FeedbackQuestionType,
																			...(value === "single_choice" ||
																			value === "multi_choice"
																				? {
																						optionsText:
																							q.optionsText ||
																							"Option 1\nOption 2\n",
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
																		className="rounded-none"
																	>
																		<SelectValue placeholder="Select answer type" />
																	</SelectTrigger>
																	<SelectContent>
																		{QUESTION_TYPES.map((t) => (
																			<SelectItem key={t.value} value={t.value}>
																				{t.label}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>

															<div className="flex h-10 items-center gap-2 px-1">
																<Checkbox
																	id={`required-${q.key}`}
																	checked={q.required}
																	onCheckedChange={(checked) =>
																		update(q.key, { required: Boolean(checked) })
																	}
																	className="rounded-none"
																/>
																<Label
																	htmlFor={`required-${q.key}`}
																	className="cursor-pointer font-normal text-muted-foreground text-sm select-none"
																>
																	Required
																</Label>
															</div>
														</div>

														{/* Helpful hint / subtitle - expandable on demand */}
														<div className="space-y-2">
															{hasHint ? (
																<div className="space-y-1">
																	<div className="flex items-center justify-between">
																		<Label
																			htmlFor={`hint-${q.key}`}
																			className="text-muted-foreground text-xs"
																		>
																			Description
																		</Label>
																		<button
																			type="button"
																			className="text-[11px] text-muted-foreground hover:text-destructive"
																			onClick={() =>
																				update(q.key, { hint_text: "" })
																			}
																		>
																			Remove description
																		</button>
																	</div>
																	<Input
																		id={`hint-${q.key}`}
																		className="h-8 rounded-none text-xs"
																		value={q.hint_text}
																		onChange={(e) =>
																			update(q.key, {
																				hint_text: e.target.value,
																			})
																		}
																		placeholder="Add helpful context or subtitle"
																		autoFocus
																	/>
																</div>
															) : (
																<div className="flex items-center gap-4">
																	<button
																		type="button"
																		className="font-medium text-muted-foreground text-xs underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground hover:text-foreground"
																		onClick={() =>
																			update(q.key, { hint_text: " " })
																		}
																	>
																		+ Add description
																	</button>

																	{q.question_type === "text" &&
																		!hasPlaceholder && (
																			<button
																				type="button"
																				className="font-medium text-muted-foreground text-xs underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground hover:text-foreground"
																				onClick={() =>
																					update(q.key, { placeholder: " " })
																				}
																			>
																				+ Add placeholder
																			</button>
																		)}
																</div>
															)}

															{q.question_type === "text" && hasPlaceholder && (
																<div className="space-y-1 pt-1">
																	<div className="flex items-center justify-between">
																		<Label
																			htmlFor={`placeholder-${q.key}`}
																			className="text-muted-foreground text-xs"
																		>
																			Textarea placeholder
																		</Label>
																		<button
																			type="button"
																			className="text-[11px] text-muted-foreground hover:text-destructive"
																			onClick={() =>
																				update(q.key, { placeholder: "" })
																			}
																		>
																			Remove placeholder
																		</button>
																	</div>
																	<Input
																		id={`placeholder-${q.key}`}
																		className="h-8 rounded-none text-xs"
																		value={q.placeholder}
																		onChange={(e) =>
																			update(q.key, {
																				placeholder: e.target.value,
																			})
																		}
																		placeholder="e.g. Type your feedback here..."
																		autoFocus
																	/>
																</div>
															)}
														</div>

														{isChoice(q.question_type) && (
															<div className="space-y-2">
																<Label htmlFor={`options-${q.key}`}>
																	Options (one per line)
																</Label>
																<div className="space-y-2">
																	{q.optionsText
																		.split("\n")
																		.map((option, index, all) => {
																			const isLast = index === all.length - 1;
																			const isSecondToLast =
																				index === all.length - 2;
																			if (isLast && !option) return null;
																			const showRemove =
																				!isLast &&
																				(all.length > 2 ||
																					(all.length === 2 && !isSecondToLast));
																			return (
																				<div
																					key={
																						q.optionKeys[index] ??
																						`${q.key}-opt-${index}`
																					}
																					className="flex items-center gap-2"
																				>
																					<Input
																						className="rounded-none"
																						value={option}
																						placeholder={
																							isLast
																								? "Add option..."
																								: `Option ${index + 1}`
																						}
																						onChange={(e) => {
																							const lines =
																								e.target.value.split("\n");
																							updateOptions(
																								q.key,
																								index,
																								lines,
																							);
																						}}
																						onKeyDown={(e) => {
																							if (e.key === "Enter") {
																								e.preventDefault();
																								const lines =
																									q.optionsText.split("\n");
																								lines.splice(index + 1, 0, "");
																								const nextKeys = [
																									...q.optionKeys,
																								];
																								nextKeys.splice(
																									index + 1,
																									0,
																									crypto.randomUUID(),
																								);
																								setQuestions((qs) =>
																									qs.map((item) =>
																										item.key === q.key
																											? {
																													...item,
																													optionsText:
																														lines.join("\n"),
																													optionKeys: nextKeys,
																												}
																											: item,
																									),
																								);
																							}
																						}}
																					/>
																					{showRemove && (
																						<Button
																							type="button"
																							variant="ghost"
																							size="icon-sm"
																							className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
																							onClick={() => {
																								const lines =
																									q.optionsText.split("\n");
																								lines.splice(index, 1);
																								const nextKeys = [
																									...q.optionKeys,
																								];
																								nextKeys.splice(index, 1);
																								setQuestions((qs) =>
																									qs.map((item) =>
																										item.key === q.key
																											? {
																													...item,
																													optionsText:
																														lines.join("\n"),
																													optionKeys:
																														nextKeys,
																												}
																											: item,
																									),
																								);
																							}}
																							aria-label={`Remove option ${index + 1}`}
																						>
																							<Trash2 className="size-3.5" />
																						</Button>
																					)}
																				</div>
																			);
																		})}
																</div>
															</div>
														)}

														{/* Conditional Branching & Skip Logic for Single Choice */}
														{q.question_type === "single_choice" && (
															<QuestionBranchingEditor
																question={q}
																pages={pages}
																onChangeRules={(rules) =>
																	update(q.key, { routing_rules: rules })
																}
															/>
														)}

														{q.question_type === "rating" && (
															<fieldset className="space-y-4 rounded-none border border-muted/80 bg-muted/10 p-4">
																<div className="flex flex-wrap items-center justify-between gap-3">
																	<div>
																		<legend className="font-semibold text-foreground text-xs uppercase tracking-wide">
																			Rating Scale Labels (Optional)
																		</legend>
																		<p className="mt-0.5 text-muted-foreground text-xs">
																			Add custom labels to guide attendees
																			through the 1 to 5 scale.
																		</p>
																	</div>
																	<div className="flex items-center gap-2">
																		<Switch
																			id={`custom-all-${q.key}`}
																			checked={q.ratingCustomAll}
																			onCheckedChange={(checked) =>
																				update(q.key, {
																					ratingCustomAll: checked,
																				})
																			}
																			className="rounded-none [&_[data-slot=switch-thumb]]:rounded-none"
																		/>
																		<Label
																			htmlFor={`custom-all-${q.key}`}
																			className="font-normal text-muted-foreground text-xs"
																		>
																			Label all 5 scores
																		</Label>
																	</div>
																</div>

																{!q.ratingCustomAll ? (
																	<div className="grid gap-3 sm:grid-cols-2">
																		<div className="space-y-1">
																			<Label
																				htmlFor={`label-low-${q.key}`}
																				className="text-xs"
																			>
																				Lowest Score (1)
																			</Label>
																			<Input
																				id={`label-low-${q.key}`}
																				className="h-8 rounded-none text-xs"
																				placeholder="e.g. Strongly disagree"
																				value={q.ratingLabels[0]}
																				onChange={(e) =>
																					updateRatingLabel(
																						q.key,
																						0,
																						e.target.value,
																					)
																				}
																			/>
																		</div>
																		<div className="space-y-1">
																			<Label
																				htmlFor={`label-high-${q.key}`}
																				className="text-xs"
																			>
																				Highest Score (5)
																			</Label>
																			<Input
																				id={`label-high-${q.key}`}
																				className="h-8 rounded-none text-xs"
																				placeholder="e.g. Strongly agree"
																				value={q.ratingLabels[4]}
																				onChange={(e) =>
																					updateRatingLabel(
																						q.key,
																						4,
																						e.target.value,
																					)
																				}
																			/>
																		</div>
																	</div>
																) : (
																	<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
																		{[1, 2, 3, 4, 5].map((num) => (
																			<div key={num} className="space-y-1">
																				<Label
																					htmlFor={`label-${num}-${q.key}`}
																					className="text-muted-foreground text-xs"
																				>
																					Score {num}
																				</Label>
																				<Input
																					id={`label-${num}-${q.key}`}
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
												);
											})}
										</div>
									)}

									<div className="border-t bg-muted/5 p-4 sm:px-6">
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="rounded-none text-xs"
											onClick={() => addQuestionToPage(p.page_number)}
										>
											<Plus className="mr-1 size-3.5" />
											Add question to Page {p.page_number}
										</Button>
									</div>
								</section>
							);
						})}

						{/* Add New Page Button */}
						<div className="flex justify-center pt-2">
							<Button
								type="button"
								variant="outline"
								className="rounded-none border-2 border-dashed px-8 py-5 text-sm hover:border-[#23C460] hover:text-[#23C460]"
								onClick={addPage}
							>
								<Plus className="mr-2 size-4" />
								Add new page / section
							</Button>
						</div>

						{/* Custom Thank You Screen Section */}
						<section className="border bg-background">
							<div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
								<h2 className="font-semibold text-base">Thank you screen</h2>
								<span className="text-muted-foreground text-xs">
									Shown after submission
								</span>
							</div>
							<div className="space-y-4 p-5 sm:p-6">
								<div className="space-y-1.5">
									<Label htmlFor="thank-you-title">Heading</Label>
									<Input
										id="thank-you-title"
										className="rounded-none"
										value={thankYouTitle}
										onChange={(e) => setThankYouTitle(e.target.value)}
										placeholder="Thanks for your feedback"
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="thank-you-message">Message</Label>
									<Textarea
										id="thank-you-message"
										className="min-h-20 rounded-none"
										value={thankYouMessage}
										onChange={(e) => setThankYouMessage(e.target.value)}
										placeholder="Your answers help the organiser make the next event better."
									/>
								</div>
							</div>
						</section>
					</div>

					{/* Right Sidebar Settings */}
					<aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
						{/* Display Mode Selector - Direct and Lean */}
						<section className="border bg-background">
							<div className="border-b px-5 py-4">
								<h2 className="font-semibold text-base">Display mode</h2>
							</div>
							<div className="space-y-2 p-4">
								<button
									type="button"
									onClick={() => setDisplayMode("pages")}
									className={cn(
										"flex w-full items-center justify-between border p-3 text-left text-xs transition-colors",
										displayMode === "pages"
											? "border-[#23C460] bg-[#23C460]/10 font-semibold text-foreground"
											: "text-muted-foreground hover:border-foreground/30",
									)}
								>
									<span>Flipping pages</span>
									{displayMode === "pages" && (
										<span className="font-bold text-[#23C460]">✓</span>
									)}
								</button>

								<button
									type="button"
									onClick={() => setDisplayMode("continuous")}
									className={cn(
										"flex w-full items-center justify-between border p-3 text-left text-xs transition-colors",
										displayMode === "continuous"
											? "border-[#23C460] bg-[#23C460]/10 font-semibold text-foreground"
											: "text-muted-foreground hover:border-foreground/30",
									)}
								>
									<span>Continuous scrolling</span>
									{displayMode === "continuous" && (
										<span className="font-bold text-[#23C460]">✓</span>
									)}
								</button>
							</div>
						</section>

						{/* Availability with clear Green / Red color */}
						<section className="border bg-background">
							<div className="flex items-center justify-between border-b px-5 py-4">
								<h2 className="font-semibold text-base">Availability</h2>
								<span
									className={cn(
										"flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-xs",
										isActive
											? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
											: "border border-red-500/30 bg-red-500/10 text-red-600",
									)}
								>
									<span
										className={cn(
											"size-1.5 rounded-full",
											isActive ? "bg-emerald-500" : "bg-red-500",
										)}
									/>
									{isActive ? "Open" : "Closed"}
								</span>
							</div>
							<div className="flex items-start justify-between gap-3 p-5">
								<div className="space-y-1">
									<Label htmlFor="feedback-active">Accepting responses</Label>
									<p className="text-muted-foreground text-sm">
										{isActive
											? "Form is live and taking attendee responses."
											: "Form is closed to new responses."}
									</p>
								</div>
								<Switch
									id="feedback-active"
									checked={isActive}
									onCheckedChange={setIsActive}
									className={cn(
										"mt-0.5 rounded-none [&_[data-slot=switch-thumb]]:rounded-none",
										isActive && "data-[state=checked]:bg-emerald-600",
									)}
								/>
							</div>
						</section>

						<section className="border bg-background">
							<div className="border-b px-5 py-4">
								<h2 className="font-semibold text-base">Preview & links</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									Attendees get their own link in the thank-you email. Use this
									to preview the form or copy a link for one attendee.
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
											so the response is saved against that attendee, or pick
											one below.
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

			{/* Delete Confirmation Alert Dialog */}
			<AlertDialog
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
			>
				<AlertDialogContent className="rounded-none">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{pendingDelete?.type === "question"
								? `Delete Question ${String(pendingDelete.number).padStart(2, "0")}?`
								: `Delete Page ${pendingDelete?.pageNumber}?`}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingDelete?.type === "question"
								? "This question has content entered that will be permanently removed. Are you sure you want to delete it?"
								: "This page contains entered content or questions with data. Deleting this page will move its questions to the previous page."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-none">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (pendingDelete?.type === "question") {
									deleteQuestion(pendingDelete.key);
								} else if (pendingDelete?.type === "page") {
									deletePage(pendingDelete.pageNumber);
								}
								setPendingDelete(null);
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function QuestionBranchingEditor({
	question,
	pages,
	onChangeRules,
}: {
	question: DraftQuestion;
	pages: DraftPage[];
	onChangeRules: (rules: FeedbackRoutingRule[]) => void;
}) {
	const [isOpen, setIsOpen] = useState(
		(question.routing_rules && question.routing_rules.length > 0) || false,
	);
	const choices = question.optionsText
		.split("\n")
		.map((o) => o.trim())
		.filter(Boolean);

	if (choices.length === 0) return null;

	const subsequentPages = pages.filter(
		(p) => p.page_number > (question.page_number ?? 1),
	);

	const updateChoiceRule = (choice: string, value: string) => {
		const existingRules = question.routing_rules || [];
		const filtered = existingRules.filter((r) => r.answer !== choice);
		if (value === "default") {
			onChangeRules(filtered);
		} else if (value === "submit") {
			onChangeRules([
				...filtered,
				{ answer: choice, action: "submit", target_page: null },
			]);
		} else {
			const targetPage = Number(value);
			onChangeRules([
				...filtered,
				{ answer: choice, action: "jump_to_page", target_page: targetPage },
			]);
		}
	};

	const activeRulesCount = (question.routing_rules ?? []).filter((r) =>
		choices.includes(r.answer),
	).length;

	return (
		<div className="space-y-3 border border-dashed bg-muted/10 p-3.5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<GitFork className="size-4 text-[#23C460]" />
					<span className="font-semibold text-foreground text-xs uppercase tracking-wide">
						Conditional Logic & Branching
					</span>
					{activeRulesCount > 0 && (
						<span className="rounded bg-[#23C460] px-1.5 py-0.5 font-bold text-[10px] text-white">
							{activeRulesCount} active
						</span>
					)}
				</div>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 text-muted-foreground text-xs hover:text-foreground"
					onClick={() => setIsOpen(!isOpen)}
				>
					{isOpen ? "Hide logic" : "Configure logic"}
				</Button>
			</div>

			{isOpen && (
				<div className="space-y-2 pt-1">
					<p className="text-muted-foreground text-xs">
						Route attendees to a specific page or submit early based on their
						selected answer:
					</p>
					<div className="divide-y border bg-background">
						{choices.map((choice) => {
							const currentRule = question.routing_rules?.find(
								(r) => r.answer === choice,
							);
							let currentValue = "default";
							if (currentRule) {
								if (
									currentRule.action === "submit" ||
									currentRule.target_page === null ||
									(typeof currentRule.target_page === "string" &&
										currentRule.target_page === "submit")
								) {
									currentValue = "submit";
								} else if (currentRule.target_page) {
									currentValue = String(currentRule.target_page);
								}
							}

							return (
								<div
									key={choice}
									className="flex flex-wrap items-center justify-between gap-3 p-2.5 text-xs"
								>
									<span className="font-medium text-foreground">
										If answer is{" "}
										<strong className="text-[#23C460]">"{choice}"</strong>
									</span>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground">➔</span>
										<Select
											value={currentValue}
											onValueChange={(val) => updateChoiceRule(choice, val)}
										>
											<SelectTrigger className="h-8 w-56 rounded-none text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="default">
													Continue to next page (default)
												</SelectItem>
												{subsequentPages.map((sp) => (
													<SelectItem
														key={sp.page_number}
														value={String(sp.page_number)}
													>
														Jump to Page {sp.page_number}
														{sp.title ? ` (${sp.title})` : ""}
													</SelectItem>
												))}
												<SelectItem value="submit">
													Submit form immediately
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
