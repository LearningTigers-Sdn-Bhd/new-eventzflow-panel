"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageSquareQuote } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { FeedbackFilters, FeedbackForm } from "@/lib/api/feedback-form";
import { getFeedbackComments } from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";
import { filtersKey } from "./filters";
import { SimplePager } from "./pager";
import { SearchInput } from "./search-input";

/** Every free-text answer, newest first. `aboveList` is where the AI summary card goes. */
export function FeedbackCommentsTab({
	eventId,
	filters,
	questions,
	aboveList,
}: {
	eventId: string;
	filters: FeedbackFilters;
	questions: FeedbackForm["questions"];
	aboveList?: ReactNode;
}) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [questionId, setQuestionId] = useState("all");
	const [maxRating, setMaxRating] = useState("all");
	const [showNames, setShowNames] = useState(true);
	const textQuestions = questions.filter((q) => q.question_type === "text");

	const { data, isLoading, isError } = useQuery({
		queryKey: [
			"event",
			eventId,
			"feedback-comments",
			page,
			debouncedSearch,
			questionId,
			maxRating,
			...filtersKey(filters),
		],
		queryFn: () =>
			getFeedbackComments(eventId, {
				page,
				search: debouncedSearch,
				questionId,
				maxRating,
				filters,
			}),
		placeholderData: keepPreviousData,
	});

	// Filter changes always restart from the first page.
	const reset =
		<T,>(setter: (value: T) => void) =>
		(value: T) => {
			setter(value);
			setPage(1);
		};

	if (isError) return <ErrorState title="Unable to load comments" />;

	const comments = data?.data ?? [];
	const narrowed =
		debouncedSearch.trim() !== "" ||
		questionId !== "all" ||
		maxRating !== "all";

	return (
		<div className="space-y-4">
			{aboveList}
			<div className="flex flex-wrap items-center gap-3 border border-dashed bg-accent/40 p-3 sm:p-4">
				<div className="min-w-56 flex-1">
					<SearchInput
						value={search}
						onChange={reset(setSearch)}
						placeholder="Search comments or attendees..."
					/>
				</div>
				{textQuestions.length > 1 && (
					<Select value={questionId} onValueChange={reset(setQuestionId)}>
						<SelectTrigger className="h-9 w-56 rounded-none bg-background text-sm">
							<SelectValue placeholder="All questions" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all" className="rounded-none">
								All comment questions
							</SelectItem>
							{textQuestions.map((q) => (
								<SelectItem
									key={q.id}
									value={String(q.id)}
									className="rounded-none"
								>
									{q.question_text}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
				<Select value={maxRating} onValueChange={reset(setMaxRating)}>
					<SelectTrigger className="h-9 w-48 rounded-none bg-background text-sm">
						<SelectValue placeholder="Any score" />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="all" className="rounded-none">
							Any score
						</SelectItem>
						<SelectItem value="2" className="rounded-none">
							Low scores (2 or less)
						</SelectItem>
						<SelectItem value="3" className="rounded-none">
							Below satisfied (3 or less)
						</SelectItem>
					</SelectContent>
				</Select>
				<div className="flex items-center gap-2">
					<Checkbox
						id="comments-show-names"
						checked={showNames}
						onCheckedChange={(v) => setShowNames(v === true)}
					/>
					<Label htmlFor="comments-show-names" className="text-sm">
						Show attendee names
					</Label>
				</div>
			</div>

			{isLoading && !data ? (
				<LoadingState
					title="Loading comments..."
					description="Please wait while we load attendee comments."
				/>
			) : comments.length === 0 ? (
				<section className="space-y-2 border border-dashed p-8 text-center">
					<MessageSquareQuote className="mx-auto size-8 text-muted-foreground" />
					<h2 className="font-medium">
						{narrowed || filters.from || filters.to
							? "No matching comments"
							: "No comments yet"}
					</h2>
					<p className="text-muted-foreground text-sm">
						{narrowed
							? "Try changing the search or score filter."
							: "Written answers will appear here once attendees respond."}
					</p>
				</section>
			) : (
				<div className="space-y-3">
					{comments.map((comment) => (
						<article
							key={comment.id}
							className="space-y-2 border border-dashed p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
									<span className="font-medium">
										{showNames
											? comment.attendee?.name ||
												comment.attendee?.email ||
												"Anonymous"
											: "Attendee"}
									</span>
									{comment.attendee?.ticket_type_name && (
										<Badge variant="outline" className="rounded-none">
											{comment.attendee.ticket_type_name}
										</Badge>
									)}
									{comment.response_rating !== null && (
										<ScoreBadge score={comment.response_rating} />
									)}
								</div>
								<time
									dateTime={comment.submitted_at}
									className="text-muted-foreground text-xs"
								>
									{new Date(comment.submitted_at).toLocaleString()}
								</time>
							</div>
							<p className="whitespace-pre-wrap break-words">
								{comment.answer_text}
							</p>
							{textQuestions.length > 1 && (
								<p className="text-muted-foreground text-xs">
									{comment.question_text}
								</p>
							)}
						</article>
					))}
					{data && (
						<SimplePager pagination={data.pagination} onPage={setPage} />
					)}
				</div>
			)}
		</div>
	);
}

function ScoreBadge({ score }: { score: number }) {
	return (
		<span
			className={cn(
				"border px-1.5 py-0.5 font-medium text-xs tabular-nums",
				score >= 4
					? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
					: score >= 3
						? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
						: "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
			)}
			title="Average of this attendee's ratings"
		>
			{score.toFixed(1)} / 5
		</span>
	);
}
