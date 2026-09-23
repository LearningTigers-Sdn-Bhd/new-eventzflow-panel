"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { getEventTicketsPaged, type Ticket } from "@/lib/api/ticket";
import { cn } from "@/lib/utils";

interface AttendeeFeedbackLinkProps {
	eventId: string;
	publicUrl: string;
}

// Quick per-attendee link: search confirmed tickets, pick one, copy its
// ?ticket= link so the response is bound to that ticket. Not-checked-in
// tickets are included (missed scans) but badged.
export function AttendeeFeedbackLink({
	eventId,
	publicUrl,
}: AttendeeFeedbackLinkProps) {
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<Ticket | null>(null);
	const q = useDebounce(search.trim(), 300);
	// Gate on the live value too, so clearing/Escape closes instantly instead of after the debounce.
	const open = search.trim().length > 0 && q.length > 0;

	const { data, isFetching } = useQuery({
		queryKey: ["event", eventId, "feedback-link-attendees", q],
		queryFn: () =>
			getEventTicketsPaged(eventId, {
				page: 1,
				perPage: 5,
				q: q || undefined,
				sortBy: "name",
				sortDir: "asc",
			}),
		enabled: !selected && q.length > 0,
	});

	const attendeeUrl = selected
		? `${publicUrl}?ticket=${encodeURIComponent(selected.publicId)}`
		: "";

	const copyAttendeeLink = async () => {
		await navigator.clipboard.writeText(attendeeUrl);
		toast.success(`Link for ${selected?.name || "attendee"} copied`);
	};

	return (
		<div className="space-y-2 border-t pt-3">
			<Label htmlFor="feedback-attendee-search">Link for an attendee</Label>
			{selected ? (
				<>
					<div className="flex items-center justify-between gap-2 border px-3 py-2 text-sm">
						<div className="min-w-0">
							<p className="flex items-center gap-2">
								<span className="truncate font-medium">
									{selected.name || "—"}
								</span>
								{!selected.checkedIn && <NotCheckedInBadge />}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{selected.email}
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="rounded-none"
							onClick={() => setSelected(null)}
						>
							Change
						</Button>
					</div>
					<Input value={attendeeUrl} readOnly className="rounded-none" />
					<Button
						type="button"
						variant="outline"
						className="w-full rounded-none"
						onClick={copyAttendeeLink}
					>
						<Copy className="size-4" />
						Copy attendee link
					</Button>
				</>
			) : (
				<>
					<div className="relative">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="feedback-attendee-search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search attendee by name or email"
							className="rounded-none pl-9"
							onKeyDown={(e) => e.key === "Escape" && setSearch("")}
							// Click outside closes; result rows preventDefault on mousedown so
							// picking one doesn't blur the input first.
							onBlur={() => setSearch("")}
							aria-expanded={open}
							aria-controls="feedback-attendee-results"
						/>
						{/* Floating so results never push the Save button off screen. */}
						{open && (
							<ul
								id="feedback-attendee-results"
								className={cn(
									"absolute inset-x-0 top-full z-20 mt-1 max-h-64 divide-y overflow-y-auto border bg-popover shadow-md",
									isFetching && "opacity-60",
								)}
								aria-busy={isFetching}
							>
								{(data?.data ?? []).map((ticket) => (
									<li key={ticket.publicId}>
										<button
											type="button"
											className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
											onMouseDown={(e) => e.preventDefault()}
											onClick={() => {
												setSelected(ticket);
												setSearch("");
											}}
										>
											<span className="flex items-center gap-2">
												<span className="truncate font-medium">
													{ticket.name || "—"}
												</span>
												{!ticket.checkedIn && <NotCheckedInBadge />}
											</span>
											<span className="block truncate text-muted-foreground text-xs">
												{ticket.email}
											</span>
										</button>
									</li>
								))}
								{data && data.data.length === 0 && (
									<li className="px-3 py-2 text-muted-foreground text-sm">
										No attendee found.
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
				</>
			)}
		</div>
	);
}

function NotCheckedInBadge() {
	return (
		<span className="shrink-0 border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-medium text-[10px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
			Not checked in
		</span>
	);
}
