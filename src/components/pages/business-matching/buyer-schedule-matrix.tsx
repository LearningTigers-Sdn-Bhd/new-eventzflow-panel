"use client";

import {
	Calendar,
	CheckCircle2,
	Clock,
	MapPin,
	RefreshCw,
	Search,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllBusinessMatchingBookings } from "@/hooks/use-business-matching";
import type { Booking } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";

interface BuyerScheduleMatrixProps {
	eventId: string;
}

function slotMinutes(timeStr: string): number {
	if (!timeStr) return 24 * 60;
	const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
	if (!match) return 24 * 60;
	let hour = Number.parseInt(match[1], 10);
	const min = Number.parseInt(match[2], 10);
	const meridiem = match[3]?.toUpperCase();
	if (meridiem === "PM" && hour < 12) hour += 12;
	if (meridiem === "AM" && hour === 12) hour = 0;
	return hour * 60 + min;
}

function formatSlotRange(timeStr: string, durationMinutes = 30): string {
	const mins = slotMinutes(timeStr);
	if (mins >= 24 * 60) return timeStr;
	const endMins = mins + durationMinutes;

	const fmt = (m: number) => {
		let h = Math.floor(m / 60) % 24;
		const min = m % 60;
		const ampm = h >= 12 ? "PM" : "AM";
		if (h > 12) h -= 12;
		if (h === 0) h = 12;
		return `${h}:${min.toString().padStart(2, "0")} ${ampm}`;
	};

	return `${fmt(mins)} – ${fmt(endMins)}`;
}

interface BuyerInfo {
	key: string;
	name: string;
	email: string;
	phone?: string;
}

export function BuyerScheduleMatrix({ eventId }: BuyerScheduleMatrixProps) {
	const { data, isLoading, isFetching, refetch } =
		useAllBusinessMatchingBookings(eventId);
	const bookings = useMemo<Booking[]>(() => data?.bookings ?? [], [data]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState<string>("all");

	// Distinct dates in bookings
	const uniqueDates = useMemo(() => {
		const set = new Set<string>();
		for (const b of bookings) {
			const d = b.booking_date;
			if (d) set.add(d);
		}
		return Array.from(set);
	}, [bookings]);

	// Filter bookings by selected date
	const dateFilteredBookings = useMemo(() => {
		if (selectedDate === "all") return bookings;
		return bookings.filter((b) => b.booking_date === selectedDate);
	}, [bookings, selectedDate]);

	// Extract unique time slots for the filtered date(s), sorted chronologically
	const timeSlots = useMemo(() => {
		const set = new Set<string>();
		for (const b of dateFilteredBookings) {
			const t = b.booking_time;
			if (t) set.add(t.trim());
		}
		return Array.from(set).sort((a, b) => slotMinutes(a) - slotMinutes(b));
	}, [dateFilteredBookings]);

	// Average duration
	const defaultDuration = useMemo(() => {
		const found = dateFilteredBookings.find((b) => Number(b.duration) > 0);
		return found ? Number(found.duration) : 30;
	}, [dateFilteredBookings]);

	// Unique buyers
	const allBuyers = useMemo<BuyerInfo[]>(() => {
		const map = new Map<string, BuyerInfo>();
		for (const b of dateFilteredBookings) {
			const email = (b.email || "").toLowerCase().trim();
			const name = (b.name || "").trim();
			const key = email || name;
			if (key && !map.has(key)) {
				map.set(key, {
					key,
					name: name || email || "Unknown Buyer",
					email,
					phone: b.phone,
				});
			}
		}
		return Array.from(map.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [dateFilteredBookings]);

	// Filter buyers by search query (matches buyer name/email OR seller name in their bookings)
	const filteredBuyers = useMemo(() => {
		if (!searchQuery.trim()) return allBuyers;
		const q = searchQuery.toLowerCase().trim();

		return allBuyers.filter((buyer) => {
			if (
				buyer.name.toLowerCase().includes(q) ||
				buyer.email.toLowerCase().includes(q)
			) {
				return true;
			}
			// Check if any of buyer's bookings match seller or table
			return dateFilteredBookings.some((b) => {
				const bEmail = (b.email || "").toLowerCase().trim();
				const bName = (b.name || "").trim();
				const matchBuyer = bEmail === buyer.email || bName === buyer.name;
				if (!matchBuyer) return false;
				return (
					b.event_title?.toLowerCase().includes(q) ||
					b.location?.toLowerCase().includes(q)
				);
			});
		});
	}, [allBuyers, searchQuery, dateFilteredBookings]);

	// Fast lookup map: `${buyerKey}__${slot}` -> Booking
	const bookingLookup = useMemo(() => {
		const map = new Map<string, Booking>();
		for (const b of dateFilteredBookings) {
			const email = (b.email || "").toLowerCase().trim();
			const name = (b.name || "").trim();
			const buyerKey = email || name;
			const slot = (b.booking_time || "").trim();
			if (buyerKey && slot) {
				map.set(`${buyerKey}__${slot}`, b);
			}
		}
		return map;
	}, [dateFilteredBookings]);

	// Summary stats
	const stats = useMemo(() => {
		const totalSlots = filteredBuyers.length * timeSlots.length;
		let filled = 0;
		for (const buyer of filteredBuyers) {
			for (const slot of timeSlots) {
				if (bookingLookup.has(`${buyer.key}__${slot}`)) {
					filled++;
				}
			}
		}
		return {
			buyersCount: filteredBuyers.length,
			filled,
			empty: Math.max(0, totalSlots - filled),
		};
	}, [filteredBuyers, timeSlots, bookingLookup]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-48 rounded-none" />
					<Skeleton className="h-8 w-32 rounded-none" />
				</div>
				<Skeleton className="h-[400px] w-full rounded-none" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls Bar */}
			<div className="flex flex-col gap-3 rounded-none border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					{/* Date Selector Pills */}
					{uniqueDates.length > 1 && (
						<div className="flex items-center gap-1 rounded-none border border-border bg-muted/50 p-1">
							<Button
								variant={selectedDate === "all" ? "default" : "ghost"}
								size="sm"
								onClick={() => setSelectedDate("all")}
								className="h-7 rounded-none px-2.5 text-xs"
							>
								All Days
							</Button>
							{uniqueDates.map((dateStr) => (
								<Button
									key={dateStr}
									variant={selectedDate === dateStr ? "default" : "ghost"}
									size="sm"
									onClick={() => setSelectedDate(dateStr)}
									className="h-7 rounded-none px-2.5 text-xs"
								>
									{dateStr}
								</Button>
							))}
						</div>
					)}

					{/* Search Bar */}
					<div className="relative w-full sm:w-64">
						<Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search buyer or seller..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-8 rounded-none pl-8 text-xs"
						/>
					</div>
				</div>

				{/* Summary Metrics & Refresh */}
				<div className="flex flex-wrap items-center gap-3 text-xs">
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Users className="h-3.5 w-3.5" />
						<span>
							<strong className="text-foreground">{stats.buyersCount}</strong>{" "}
							Buyers
						</span>
					</div>
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
						<span>
							<strong className="text-foreground">{stats.filled}</strong>{" "}
							Meetings
						</span>
					</div>
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						<span>
							<strong className="text-foreground">{stats.empty}</strong> Free
							Slots (—)
						</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isFetching}
						className="h-8 rounded-none px-2.5"
						title="Refresh schedule"
					>
						<RefreshCw
							className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
						/>
					</Button>
				</div>
			</div>

			{/* Matrix Grid or Empty State */}
			{filteredBuyers.length === 0 || timeSlots.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-none border border-border border-dashed bg-card p-12 text-center">
					<Calendar className="h-10 w-10 text-muted-foreground/50" />
					<h3 className="mt-3 font-semibold text-foreground text-sm">
						No schedule slots to display
					</h3>
					<p className="mt-1 text-muted-foreground text-xs">
						{searchQuery
							? "No meetings match your search query."
							: "Bookings will appear in this matrix once attendees book slots."}
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-none border border-border bg-card shadow-sm">
					<div className="max-h-[72vh] overflow-auto">
						<table className="w-full border-collapse text-left text-xs">
							{/* Header */}
							<thead className="sticky top-0 z-20 bg-slate-900 text-white">
								<tr>
									<th className="sticky left-0 z-30 min-w-[200px] max-w-[220px] border-slate-700 border-r bg-slate-900 px-3.5 py-3 font-semibold text-xs shadow-[2px_0_4px_rgba(0,0,0,0.15)]">
										Buyer
									</th>
									{timeSlots.map((slot) => (
										<th
											key={slot}
											className="min-w-[180px] whitespace-nowrap border-slate-800 border-r px-3 py-3 text-center font-medium text-xs last:border-r-0"
										>
											<div className="font-semibold text-slate-100">
												{formatSlotRange(slot, defaultDuration)}
											</div>
										</th>
									))}
								</tr>
							</thead>

							{/* Body */}
							<tbody className="divide-y divide-border">
								{filteredBuyers.map((buyer, bIdx) => (
									<tr
										key={buyer.key}
										className={cn(
											"transition-colors hover:bg-muted/40",
											bIdx % 2 === 1 && "bg-muted/15",
										)}
									>
										{/* Sticky Buyer Column */}
										<td className="sticky left-0 z-10 min-w-[200px] max-w-[220px] border-border border-r bg-card px-3.5 py-2.5 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
											<div className="flex flex-col gap-0.5">
												<span
													className="truncate font-semibold text-foreground text-xs"
													title={buyer.name}
												>
													{buyer.name}
												</span>
												{buyer.email && (
													<span
														className="truncate text-[11px] text-muted-foreground"
														title={buyer.email}
													>
														{buyer.email}
													</span>
												)}
												{buyer.phone && (
													<span className="font-mono text-[10px] text-muted-foreground/70">
														{buyer.phone}
													</span>
												)}
											</div>
										</td>

										{/* Time Slot Cells */}
										{timeSlots.map((slot) => {
											const booking = bookingLookup.get(
												`${buyer.key}__${slot}`,
											);

											if (!booking) {
												return (
													<td
														key={slot}
														className="border-border/60 border-r bg-transparent px-3 py-2 text-center last:border-r-0"
													>
														<span className="select-none font-semibold text-muted-foreground/50 text-sm">
															—
														</span>
													</td>
												);
											}

											const isConfirmed =
												booking.status?.toLowerCase() === "confirmed" ||
												booking.status?.toLowerCase() === "approved";
											const isPending =
												booking.status?.toLowerCase() === "pending";

											return (
												<td
													key={slot}
													className="border-border/60 border-r px-2.5 py-2 align-top last:border-r-0"
												>
													<div
														className={cn(
															"flex flex-col gap-1 rounded-none border p-2 text-left shadow-2xs transition-all",
															isConfirmed &&
																"border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-950/20",
															isPending &&
																"border-amber-200/80 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20",
															!isConfirmed &&
																!isPending &&
																"border-border bg-muted/40",
														)}
													>
														<div className="flex items-start justify-between gap-1">
															<span
																className="line-clamp-2 font-semibold text-foreground text-xs leading-snug"
																title={booking.event_title}
															>
																{booking.event_title}
															</span>
														</div>

														<div className="mt-1 flex items-center justify-between gap-1 border-black/5 border-t pt-1 text-[10px] dark:border-white/5">
															{booking.location ? (
																<span className="inline-flex items-center gap-0.5 font-medium text-foreground/80">
																	<MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
																	{booking.location}
																</span>
															) : (
																<span className="text-muted-foreground">
																	Session
																</span>
															)}

															<Badge
																variant="outline"
																className={cn(
																	"h-4 rounded-none border-0 px-1 font-semibold text-[9px]",
																	isConfirmed &&
																		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
																	isPending &&
																		"bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
																	!isConfirmed &&
																		!isPending &&
																		"bg-muted text-muted-foreground",
																)}
															>
																{booking.status}
															</Badge>
														</div>
													</div>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
