"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import {
	type FeedbackExhibitorLink,
	searchFeedbackExhibitorLinks,
} from "@/lib/api/feedback-form";
import { cn } from "@/lib/utils";

// Per-company link: search exhibitors, pick one, copy or open its personal
// link so the response is recorded under that company (one per company).
export function ExhibitorFeedbackLink({ eventId }: { eventId: string }) {
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<FeedbackExhibitorLink | null>(null);
	const q = useDebounce(search.trim(), 300);
	const open = search.trim().length > 0 && q.length > 0;

	const { data, isFetching } = useQuery({
		queryKey: ["event", eventId, "feedback-link-exhibitors", q],
		queryFn: () => searchFeedbackExhibitorLinks(eventId, q),
		enabled: !selected && q.length > 0,
	});

	const copyLink = async () => {
		if (!selected) return;
		await navigator.clipboard.writeText(selected.url);
		toast.success(`Link for ${selected.company_name || "company"} copied`);
	};

	return (
		<div className="space-y-2 border-t pt-3">
			<div className="space-y-1">
				<Label htmlFor="feedback-exhibitor-search">
					Link for a specific company
				</Label>
				<p className="text-muted-foreground text-xs">
					Exhibitors get their link by email. Search a company to test
					submitting as them or to share their personal link directly.
				</p>
			</div>
			{selected ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2 border bg-muted/20 px-3 py-2 text-sm">
						<div className="min-w-0">
							<p className="truncate font-medium">
								{selected.company_name || "—"}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{selected.email}
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="rounded-none text-xs"
							onClick={() => setSelected(null)}
						>
							Change
						</Button>
					</div>
					<Input
						value={selected.url}
						readOnly
						className="rounded-none font-mono text-xs"
					/>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							className="flex-1 rounded-none"
							onClick={copyLink}
						>
							<Copy className="size-4" />
							Copy company link
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							asChild
							className="rounded-none"
							aria-label="Open company link to test submission"
						>
							<a href={selected.url} target="_blank" rel="noreferrer">
								<ExternalLink className="size-4" />
							</a>
						</Button>
					</div>
					<p className="text-[11px] text-muted-foreground">
						{selected.submitted
							? "This company has already responded; its link will show as submitted."
							: `Responses submitted through this link are recorded under ${selected.company_name || "this company"}, once only.`}
					</p>
				</div>
			) : (
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="feedback-exhibitor-search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search company by name or email…"
						className="rounded-none pl-9"
						onKeyDown={(e) => e.key === "Escape" && setSearch("")}
						onBlur={() => setSearch("")}
						aria-expanded={open}
						aria-controls="feedback-exhibitor-results"
					/>
					{open && (
						<ul
							id="feedback-exhibitor-results"
							className={cn(
								"absolute inset-x-0 top-full z-20 mt-1 max-h-64 divide-y overflow-y-auto border bg-popover shadow-md",
								isFetching && "opacity-60",
							)}
							aria-busy={isFetching}
						>
							{(data ?? []).map((company) => (
								<li key={company.id}>
									<button
										type="button"
										className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => {
											setSelected(company);
											setSearch("");
										}}
									>
										<span className="block truncate font-medium">
											{company.company_name || "—"}
										</span>
										<span className="block truncate text-muted-foreground text-xs">
											{company.email}
										</span>
									</button>
								</li>
							))}
							{data && data.length === 0 && (
								<li className="px-3 py-2 text-muted-foreground text-sm">
									No company found.
								</li>
							)}
							{!data && (
								<li className="px-3 py-2 text-muted-foreground text-sm">
									Searching…
								</li>
							)}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
