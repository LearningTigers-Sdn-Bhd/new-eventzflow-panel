"use client";

import { Copy, ExternalLink, Tv } from "lucide-react";
import { toast } from "sonner";
import { useEventSidebarContextSafe } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";

/**
 * Where to find the public door screen. It is open to anyone once the event is published.
 * `hall` points at a single-hall screen; `compact` drops the description row for use inside a card.
 */
export function BigScreenLink({
	level,
	hall,
	compact,
}: {
	level?: string | null;
	hall?: string | null;
	compact?: boolean;
}) {
	const event = useEventSidebarContextSafe()?.currentEvent;
	if (!event?.slug) return null;

	const published = event.status === "published";
	const params = new URLSearchParams();
	if (level) params.set("level", level);
	if (hall) params.set("hall", hall);
	const path = `/event/${encodeURIComponent(event.slug)}/big-screen${params.size ? `?${params}` : ""}`;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}${path}`);
			toast.success("Link copied");
		} catch {
			toast.error("Couldn't copy the link");
		}
	};

	return (
		<div
			className={
				compact
					? "flex flex-wrap items-center justify-between gap-2"
					: "flex flex-wrap items-center justify-between gap-3 border border-dashed p-3"
			}
		>
			<div className="flex items-center gap-2 text-sm">
				<Tv
					className="size-4 shrink-0 text-muted-foreground"
					aria-hidden="true"
				/>
				<span className="font-medium">
					Big screen{compact ? "" : ` · ${hall ?? level ?? "Overall"}`}
				</span>
				{!compact && (
					<span className="text-muted-foreground text-xs">
						{published
							? "Shows people inside and capacity. Anyone with the link can see it."
							: "Publish the event to turn this on."}
					</span>
				)}
			</div>
			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
					disabled={!published}
					onClick={copy}
				>
					<Copy className="size-4" />
					Copy link
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
					disabled={!published}
					onClick={() => window.open(path, "_blank", "noopener,noreferrer")}
				>
					<ExternalLink className="size-4" />
					Open
				</Button>
			</div>
		</div>
	);
}
