"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { previewEmailBlastDraft } from "@/lib/api/email-blast";

/** The email as recipients get it, rebuilt by the server a moment after you stop typing. */
export function LivePreview({
	eventId,
	draftId,
	subject,
	body,
	styleKey,
	version,
}: {
	eventId: string;
	draftId: number | null;
	subject: string;
	body: string;
	styleKey: string;
	/** Bumps when something saved server-side (like the banner) changes. */
	version: number;
}) {
	// Memoised: a fresh object every render would keep resetting the debounce.
	const current = useMemo(
		() => ({ subject, body, styleKey, draftId, version }),
		[subject, body, styleKey, draftId, version],
	);
	const input = useDebounce(current, 600);
	const { data, isFetching } = useQuery({
		queryKey: ["email-blast-live-preview", eventId, input],
		queryFn: () =>
			previewEmailBlastDraft(eventId, {
				draftId: input.draftId,
				subject: input.subject,
				body: input.body,
				bodyFormat: "rich",
				styleKey: input.styleKey,
			}),
		placeholderData: keepPreviousData,
	});

	return (
		<div className="border">
			<div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
				<p className="font-medium text-muted-foreground text-xs">
					Live preview
				</p>
				{isFetching && (
					<Loader2 className="size-3.5 animate-spin text-muted-foreground" />
				)}
			</div>
			<iframe
				title="Live email preview"
				sandbox=""
				srcDoc={data?.html ?? ""}
				className="block h-[560px] w-full border-0 bg-white"
			/>
		</div>
	);
}
