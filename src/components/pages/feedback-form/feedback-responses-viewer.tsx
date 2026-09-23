"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MessageSquareQuote } from "lucide-react";
import { useMemo, useState } from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { ErrorState, LoadingState } from "@/components/data-state";
import { QuerySearchField } from "@/components/query-search-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	FeedbackForm,
	FeedbackIndividualResponse,
	FeedbackSummaryQuestion,
} from "@/lib/api/feedback-form";
import {
	getFeedbackResponses,
	getFeedbackSummary,
} from "@/lib/api/feedback-form";
import { useDebounce } from "@/hooks/use-debounce";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

const RESPONSE_PAGE_SIZE = 25;

export function FeedbackResponsesViewer({
	eventId,
	form,
}: {
	eventId: string;
	form: FeedbackForm;
}) {
	return (
		<div className="w-full">
			<Tabs defaultValue="summary" className="w-full">
				<div className="w-full border-y border-dashed">
					<TabsList className="flex h-12 w-full rounded-none">
						<TabsTrigger
							value="summary"
							className="flex flex-1 items-center justify-center rounded-none"
						>
							Summary
						</TabsTrigger>
						<TabsTrigger
							value="individual"
							className="flex flex-1 items-center justify-center rounded-none"
						>
							Individual
						</TabsTrigger>
					</TabsList>
				</div>
				<div className="mt-6">
					<TabsContent value="summary" className="mt-0">
						<FeedbackSummaryTab eventId={eventId} />
					</TabsContent>
					<TabsContent value="individual" className="mt-0">
						<FeedbackResponsesTab
							eventId={eventId}
							questions={form.questions}
						/>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

function FeedbackSummaryTab({ eventId }: { eventId: string }) {
	const {
		data: summary,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["event", eventId, "feedback-summary"],
		queryFn: () => getFeedbackSummary(eventId),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading response summary..."
				description="Please wait while we summarize attendee feedback."
			/>
		);
	}

	if (isError || !summary) {
		return <ErrorState title="Unable to load the response summary" />;
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<section className="space-y-2 border border-dashed p-5">
					<p className="text-muted-foreground text-sm">Total responses</p>
					<p className="font-semibold text-3xl">{summary.total_responses}</p>
				</section>
				<section className="space-y-2 border border-dashed p-5">
					<p className="text-muted-foreground text-sm">Last submitted</p>
					<p className="font-medium">
						{summary.last_submitted_at
							? new Date(summary.last_submitted_at).toLocaleString()
							: "No submissions yet"}
					</p>
				</section>
			</div>

			{summary.total_responses === 0 ? (
				<section className="border border-dashed p-8 text-center">
					<h2 className="font-medium">No responses yet</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Responses will appear here after attendees submit the form.
					</p>
				</section>
			) : (
				<div className="space-y-4">
					{summary.questions.map((question) => (
						<FeedbackSummaryCard key={question.id} question={question} />
					))}
				</div>
			)}
		</div>
	);
}

function FeedbackSummaryCard({
	question,
}: {
	question: FeedbackSummaryQuestion;
}) {
	const maxCount = Math.max(0, ...Object.values(question.distribution ?? {}));

	return (
		<section className="space-y-5 border border-dashed p-5">
			<header className="space-y-1">
				<h2 className="font-medium">{question.question_text}</h2>
				<p className="text-muted-foreground text-sm">
					{question.answered_count} answered
				</p>
			</header>

			{question.question_type === "rating" ? (
				<div className="space-y-4">
					<p className="font-semibold text-4xl">
						{(question.average ?? 0).toFixed(1)}
						<span className="ml-2 font-normal text-base text-muted-foreground">
							/ 5
						</span>
					</p>
					<div className="space-y-3">
						{[5, 4, 3, 2, 1].map((rating) => {
							const count = question.distribution?.[String(rating)] ?? 0;
							return (
								<CountBar
									key={rating}
									label={`${rating} star${rating === 1 ? "" : "s"}`}
									count={count}
									width={maxCount === 0 ? 0 : (count / maxCount) * 100}
								/>
							);
						})}
					</div>
				</div>
			) : question.question_type === "text" ? (
				<div className="space-y-3">
					{(question.latest ?? []).map((answer, index) => (
						<article
							// biome-ignore lint/suspicious/noArrayIndexKey: static list, answers can repeat
							key={index}
							className="space-y-1 border-primary border-l-2 pl-3"
						>
							<p className="whitespace-pre-wrap">{answer.answer_text}</p>
							<time
								dateTime={answer.submitted_at}
								className="text-muted-foreground text-xs"
							>
								{new Date(answer.submitted_at).toLocaleString()}
							</time>
						</article>
					))}
					{question.latest?.length === 0 && (
						<p className="text-muted-foreground text-sm">
							No text answers yet.
						</p>
					)}
				</div>
			) : (
				<div className="space-y-3">
					{(question.options ?? []).map((option) => (
						<CountBar
							key={option.label}
							label={option.label}
							count={option.count}
							percent={option.percent}
							width={option.percent}
						/>
					))}
				</div>
			)}
		</section>
	);
}

function CountBar({
	label,
	count,
	width,
	percent,
}: {
	label: string;
	count: number;
	width: number;
	percent?: number;
}) {
	return (
		<div className="flex items-center gap-3 text-sm">
			<span className="w-28 shrink-0 truncate" title={label}>
				{label}
			</span>
			<div className="h-2 min-w-12 flex-1 bg-muted">
				<div className="h-full bg-primary" style={{ width: `${width}%` }} />
			</div>
			<span className="w-8 text-right tabular-nums">{count}</span>
			{percent !== undefined && (
				<span className="w-14 text-right text-muted-foreground tabular-nums">
					{percent}%
				</span>
			)}
		</div>
	);
}

function FeedbackResponsesTab({
	eventId,
	questions,
}: {
	eventId: string;
	questions: FeedbackForm["questions"];
}) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
	const [selectedResponse, setSelectedResponse] =
		useState<FeedbackIndividualResponse | null>(null);
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});
	const {
		data: responsePage,
		isLoading,
		isError,
	} = useQuery({
		queryKey: [
			"event",
			eventId,
			"feedback-responses",
			page,
			debouncedSearch,
			ticketTypeFilter,
		],
		queryFn: () =>
			getFeedbackResponses(eventId, page, debouncedSearch, ticketTypeFilter),
		placeholderData: keepPreviousData,
	});
	const responses = responsePage?.data ?? [];
	const columns = useMemo<ColumnDef<FeedbackIndividualResponse>[]>(
		() => [
			{
				id: "attendee",
				header: "Attendee",
				size: 240,
				accessorFn: (item) =>
					item.ticket?.attendee_name?.trim() ||
					item.ticket?.attendee_email?.trim() ||
					"Anonymous",
				cell: ({ row }) => {
					const attendeeName = row.original.ticket?.attendee_name?.trim();
					const attendeeEmail = row.original.ticket?.attendee_email?.trim();
					const attendeeLabel = attendeeName || attendeeEmail || "Anonymous";
					return (
						<div className="max-w-52 truncate">
							<p>{attendeeLabel}</p>
							{attendeeName && attendeeEmail && (
								<p className="text-muted-foreground text-xs">{attendeeEmail}</p>
							)}
						</div>
					);
				},
			},
			{
				id: "ticket_id",
				header: "Ticket ID",
				size: 170,
				accessorFn: (item) => item.ticket?.public_id || "—",
				cell: ({ row }) => (
					<span className="font-mono text-xs">
						{row.original.ticket?.public_id
							? `#${row.original.ticket.public_id}`
							: "—"}
					</span>
				),
			},
			{
				id: "ticket_type",
				header: "Ticket type",
				size: 200,
				accessorFn: (item) => item.ticket?.ticket_type_name || "—",
				cell: ({ row }) => row.original.ticket?.ticket_type_name || "—",
			},
			{
				accessorKey: "submitted_at",
				header: "Submitted at",
				size: 220,
				cell: ({ row }) => new Date(row.original.submitted_at).toLocaleString(),
			},
			{
				id: "answers",
				header: "Answers",
				size: 180,
				accessorFn: (item) =>
					Object.values(item.answers).filter((answer) => answer?.trim()).length,
				cell: ({ row }) => {
					const answerCount = Object.values(row.original.answers).filter(
						(answer) => answer?.trim(),
					).length;
					return `${answerCount} ${answerCount === 1 ? "answer" : "answers"}`;
				},
			},
		],
		[],
	);
	const table = useReactTable<FeedbackIndividualResponse>({
		data: responses,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: responsePage?.pagination.total_pages ?? 1,
		state: {
			pagination: { pageIndex: page - 1, pageSize: RESPONSE_PAGE_SIZE },
		},
		onPaginationChange: (updater) => {
			setPage((currentPage) => {
				const current = {
					pageIndex: currentPage - 1,
					pageSize: RESPONSE_PAGE_SIZE,
				};
				const next = typeof updater === "function" ? updater(current) : updater;
				return next.pageIndex + 1;
			});
		},
	});

	if (isError) {
		return <ErrorState title="Unable to load individual responses" />;
	}

	const hasFilters = search.trim().length > 0 || ticketTypeFilter !== "all";

	return (
		<>
			<div className="mb-4 flex w-full items-center gap-2 border border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4">
				<div className="min-w-0 flex-1">
					<QuerySearchField
						table={table}
						columns={[
							"attendee",
							"ticket_id",
							"ticket_type",
							"submitted_at",
							"answers",
						]}
						placeholder="Search responses..."
						searchCustomFields={false}
						controlled={{
							value: search,
							onChange: (value) => {
								setSearch(value);
								setPage(1);
							},
						}}
					/>
				</div>
				<Select
					value={ticketTypeFilter}
					onValueChange={(value) => {
						setTicketTypeFilter(value);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-40 shrink-0 rounded-none bg-background font-medium">
						<div className="flex min-w-0 items-center gap-1 truncate text-sm">
							<span className="shrink-0 font-semibold">Ticket type:</span>
							<SelectValue placeholder="All" className="truncate" />
						</div>
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="all" className="rounded-none">
							All
						</SelectItem>
						{ticketTypes.map((ticketType) => (
							<SelectItem
								key={ticketType.id}
								value={String(ticketType.id)}
								className="rounded-none"
							>
								{ticketType.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{isLoading && !responsePage ? (
				<LoadingState
					title="Loading individual responses..."
					description="Please wait while we load attendee answers."
				/>
			) : (
				<>
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: hasFilters
								? "No matching responses"
								: "No individual responses yet",
							desc: hasFilters
								? "Try changing your search or ticket type filter."
								: "Attendee answers will appear here after a response is submitted.",
							icon: <MessageSquareQuote />,
						}}
						clickableRowConfig={{
							isEnabled: true,
							onRowClick: setSelectedResponse,
						}}
					/>
					{responsePage && (
						<DataPagination
							table={table}
							totalRows={responsePage.pagination.total_count}
						/>
					)}
				</>
			)}
			<Sheet
				open={selectedResponse !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedResponse(null);
				}}
			>
				<SheetContent className="w-full gap-0 rounded-none p-0 sm:max-w-xl">
					{selectedResponse && (
						<>
							<SheetHeader className="shrink-0 border-b pr-12">
								<SheetTitle className="text-lg capitalize">
									{selectedResponse.ticket?.attendee_name ||
										selectedResponse.ticket?.attendee_email ||
										"Anonymous response"}
								</SheetTitle>
								<SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
									{selectedResponse.ticket?.attendee_name &&
										selectedResponse.ticket?.attendee_email && (
											<span className="break-all">
												{selectedResponse.ticket.attendee_email}
											</span>
										)}
								</SheetDescription>
							</SheetHeader>
							<div className="min-h-0 flex-1 overflow-y-auto">
								<div className="flex flex-col gap-5 p-3 sm:gap-6 sm:p-4">
									<section>
										<h3 className="px-1 pb-2 font-semibold text-foreground text-sm">
											Response details
										</h3>
										<table className="w-full table-fixed border-collapse rounded-none border bg-card text-sm">
											<tbody>
												<tr className="border-b">
													<th className="w-28 border-r bg-muted/50 px-3 py-2.5 text-left align-top font-medium text-foreground/80 sm:w-36 sm:px-4 sm:py-3">
														Ticket ID
													</th>
													<td className="px-3 py-2.5 align-top font-mono leading-relaxed sm:px-4 sm:py-3">
														{selectedResponse.ticket?.public_id
															? `#${selectedResponse.ticket.public_id}`
															: "—"}
													</td>
												</tr>
												<tr className="border-b">
													<th className="w-28 border-r bg-muted/50 px-3 py-2.5 text-left align-top font-medium text-foreground/80 sm:w-36 sm:px-4 sm:py-3">
														Ticket type
													</th>
													<td className="px-3 py-2.5 align-top leading-relaxed sm:px-4 sm:py-3">
														{selectedResponse.ticket?.ticket_type_name || "—"}
													</td>
												</tr>
												<tr>
													<th className="w-28 border-r bg-muted/50 px-3 py-2.5 text-left align-top font-medium text-foreground/80 sm:w-36 sm:px-4 sm:py-3">
														Submitted at
													</th>
													<td className="px-3 py-2.5 align-top leading-relaxed sm:px-4 sm:py-3">
														<time dateTime={selectedResponse.submitted_at}>
															{new Date(
																selectedResponse.submitted_at,
															).toLocaleString()}
														</time>
													</td>
												</tr>
											</tbody>
										</table>
									</section>
									<section>
										<div className="flex items-center justify-between px-1 pb-2">
											<h3 className="font-semibold text-foreground text-sm">
												Answers
											</h3>
											<span className="text-muted-foreground text-xs">
												{questions.length} questions
											</span>
										</div>
										<div className="border bg-card">
											{questions.length === 0 ? (
												<p className="border-dashed p-6 text-center text-muted-foreground text-sm">
													No questions were configured for this response.
												</p>
											) : (
												questions.map((question, index) => {
													const answer =
														selectedResponse.answers[String(question.id)];
													return (
														<article
															key={question.id}
															className="border-b last:border-b-0"
														>
															<div className="border-b bg-muted/50 px-3 py-2.5 sm:px-4 sm:py-3">
																<div className="flex items-center justify-between gap-3">
																	<p className="text-foreground text-sm">
																		Question {index + 1}
																	</p>
																	<span className="text-foreground/80 text-sm capitalize">
																		{question.question_type.replace(/_/g, " ")}
																	</span>
																</div>
																<h4 className="mt-1 font-semibold text-base leading-snug">
																	{question.question_text}
																</h4>
															</div>
															<div className="px-3 py-3 text-sm leading-relaxed sm:px-4 sm:py-3.5">
																{answer?.trim() ? (
																	<p className="whitespace-pre-wrap break-words">
																		{answer}
																	</p>
																) : (
																	<p className="text-muted-foreground">
																		No answer provided
																	</p>
																)}
															</div>
														</article>
													);
												})
											)}
										</div>
									</section>
								</div>
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
