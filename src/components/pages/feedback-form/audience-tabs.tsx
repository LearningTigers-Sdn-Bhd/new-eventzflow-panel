"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedbackAudience } from "@/lib/api/feedback-form";

/** Switches between the visitor (ticket holder) form and the exhibitor form. Full-width, like the page tabs. */
export function FeedbackAudienceTabs({
	value,
	onChange,
	enabled = true,
}: {
	value: FeedbackAudience;
	onChange: (next: FeedbackAudience) => void;
	/** Exhibitor feedback only exists for events that use exhibitor kits. */
	enabled?: boolean;
}) {
	if (!enabled) return null;
	return (
		<Tabs
			value={value}
			onValueChange={(v) => onChange(v as FeedbackAudience)}
			className="w-full"
		>
			<div className="w-full border-y border-dashed">
				<TabsList className="flex h-12 w-full rounded-none">
					{(
						[
							["ticket", "Visitors"],
							["exhibitor", "Exhibitors"],
						] as const
					).map(([key, label]) => (
						<TabsTrigger
							key={key}
							value={key}
							className="flex flex-1 items-center justify-center rounded-none"
						>
							{label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</Tabs>
	);
}
