"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	Loader2,
	Quote,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import type {
	FeedbackAiSummary,
	FeedbackFilters,
	FeedbackSentiment,
} from "@/lib/api/feedback-form";
import {
	generateFeedbackAiSummary,
	getFeedbackAiSummary,
} from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";
import { hasActiveFilters } from "./filters";

const SENTIMENT_STYLES: Record<FeedbackSentiment, string> = {
	positive:
		"border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
	mixed:
		"border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
	negative:
		"border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
};

const SENTIMENT_LABELS: Record<FeedbackSentiment, string> = {
	positive: "Mostly positive",
	mixed: "Mixed",
	negative: "Mostly negative",
};

export const aiSummaryQueryKey = (eventId: string) => [
	"event",
	eventId,
	"feedback-ai-summary",
];

/**
 * AI summary of the comments. Everyone who can see responses reads the stored
 * result; only an org_owner (decided by the API) sees the Generate button.
 */
export function FeedbackAiSummaryCard({
	eventId,
	filters,
}: {
	eventId: string;
	filters: FeedbackFilters;
}) {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: aiSummaryQueryKey(eventId),
		queryFn: () => getFeedbackAiSummary(eventId),
		// Keep checking while a run is in progress.
		refetchInterval: (query) => {
			const status = query.state.data?.summary?.status;
			return status === "queued" || status === "running" ? 3000 : false;
		},
	});

	const generate = useMutation({
		mutationFn: () => generateFeedbackAiSummary(eventId, filters),
		onSuccess: (state) => {
			queryClient.setQueryData(aiSummaryQueryKey(eventId), state);
			toast.success("Summarizing the comments…");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	// Cooldown between runs, counted down locally.
	const [wait, setWait] = useState(0);
	useEffect(() => setWait(data?.retry_after ?? 0), [data?.retry_after]);
	useEffect(() => {
		if (wait <= 0) return;
		const timer = setTimeout(() => setWait((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [wait]);

	if (isLoading) return <Skeleton className="h-24 w-full rounded-none" />;
	if (!data) return null;

	const summary = data.summary;
	const running = summary?.status === "queued" || summary?.status === "running";
	const canGenerate = data.can_generate && data.configured;
	const failedVisible = summary?.status === "failed" && data.can_generate;
	// Nothing to read and nothing this person may do: stay out of the way.
	if (!data.can_generate && summary?.status !== "ready") return null;

	return (
		<section className="space-y-4 border border-dashed p-5">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Sparkles className="size-4 text-primary" />
					<h2 className="font-medium">AI summary</h2>
					<span className="border px-1.5 py-0.5 text-muted-foreground text-xs">
						AI-generated
					</span>
				</div>
				{data.can_generate && (
					<Button
						type="button"
						variant={summary?.status === "ready" ? "outline" : "default"}
						size="sm"
						className="rounded-none"
						disabled={!canGenerate || running || generate.isPending || wait > 0}
						onClick={() => setConfirmOpen(true)}
					>
						{running || generate.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : summary?.status === "ready" ? (
							<RefreshCw className="size-4" />
						) : (
							<Sparkles className="size-4" />
						)}
						{running
							? "Summarizing…"
							: wait > 0
								? `Regenerate in ${wait}s`
								: summary?.status === "ready"
									? "Regenerate"
									: "Summarize comments"}
					</Button>
				)}
			</header>

			{data.can_generate && !data.configured && (
				<p className="text-muted-foreground text-sm">
					No AI provider is set up yet.{" "}
					<Link href={"/settings" as Route} className="underline">
						Add one in Settings
					</Link>{" "}
					to summarize comments.
				</p>
			)}

			{running && (
				<p className="text-muted-foreground text-sm">
					Reading the comments and looking for themes. This usually takes under
					a minute, and you can leave this page.
				</p>
			)}

			{failedVisible && summary && (
				<p
					role="alert"
					className="flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm"
				>
					<AlertTriangle className="mt-0.5 size-4 shrink-0" />
					{summary.error ?? "The summary could not be generated."}
				</p>
			)}

			{canGenerate && !summary && (
				<p className="text-muted-foreground text-sm">
					Get the main themes, strengths and problems from the written comments.
					Comment text (never names or emails) is sent to your AI provider.
				</p>
			)}

			{summary?.status === "ready" && summary.content && (
				<SummaryBody summary={summary} canRegenerate={data.can_generate} />
			)}

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent className="rounded-none">
					<AlertDialogHeader>
						<AlertDialogTitle>Summarize the comments with AI?</AlertDialogTitle>
						<AlertDialogDescription>
							The written comments
							{hasActiveFilters(filters) ? " for the current filters" : ""} will
							be sent to {data.provider ?? "your AI provider"}
							{data.model ? ` (${data.model})` : ""}. Names, emails and ticket
							IDs are not sent, and emails or phone numbers inside comments are
							removed first. It uses your provider account and can take up to a
							minute.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-none">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="rounded-none"
							onClick={() => generate.mutate()}
						>
							Summarize
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}

function SummaryBody({
	summary,
	canRegenerate,
}: {
	summary: FeedbackAiSummary;
	canRegenerate: boolean;
}) {
	const content = summary.content;
	if (!content) return null;
	const filtered = Object.values(summary.filters ?? {}).some(Boolean);

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<span
					className={cn(
						"inline-block border px-2 py-0.5 font-medium text-xs",
						SENTIMENT_STYLES[content.overall_sentiment],
					)}
				>
					{SENTIMENT_LABELS[content.overall_sentiment]}
				</span>
				<p className="whitespace-pre-wrap leading-relaxed">
					{content.overview}
				</p>
			</div>

			{content.themes.length > 0 && (
				<div className="space-y-3">
					<h3 className="font-semibold text-sm">Main themes</h3>
					{content.themes.map((theme) => (
						<article key={theme.name} className="space-y-2 border-l-2 pl-3">
							<div className="flex flex-wrap items-center gap-2">
								<p className="font-medium">{theme.name}</p>
								<span
									className={cn(
										"border px-1.5 py-0.5 text-xs",
										SENTIMENT_STYLES[theme.sentiment],
									)}
								>
									{theme.sentiment}
								</span>
								{theme.comment_count > 0 && (
									<span className="text-muted-foreground text-xs">
										about {theme.comment_count} comment
										{theme.comment_count === 1 ? "" : "s"}
									</span>
								)}
							</div>
							{theme.description && (
								<p className="text-muted-foreground text-sm">
									{theme.description}
								</p>
							)}
							{theme.quotes.map((quote) => (
								<blockquote key={quote} className="flex gap-2 text-sm italic">
									<Quote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
									<span className="break-words">{quote}</span>
								</blockquote>
							))}
						</article>
					))}
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				<BulletList title="What went well" items={content.strengths} />
				<BulletList title="What to fix" items={content.problems} />
				<BulletList
					title="Suggested next steps"
					items={content.suggested_actions}
				/>
			</div>

			<footer className="space-y-1 border-t pt-3 text-muted-foreground text-xs">
				<p>
					AI-generated{summary.model ? ` by ${summary.model}` : ""} from{" "}
					{summary.comments_count} comment
					{summary.comments_count === 1 ? "" : "s"}
					{summary.finished_at
						? ` on ${new Date(summary.finished_at).toLocaleString()}`
						: ""}
					{filtered ? ", for a filtered view" : ""}. It can miss nuance, so
					check it against the comments.
				</p>
				{summary.stale && (
					<p className="text-amber-700 dark:text-amber-300">
						New responses have arrived since this summary was made
						{canRegenerate ? ". Regenerate to include them." : "."}
					</p>
				)}
			</footer>
		</div>
	);
}

function BulletList({ title, items }: { title: string; items: string[] }) {
	if (items.length === 0) return null;
	return (
		<div className="space-y-1.5">
			<h3 className="font-semibold text-sm">{title}</h3>
			<ul className="list-disc space-y-1 pl-4 text-sm">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}
