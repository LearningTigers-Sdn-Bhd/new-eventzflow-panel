"use client";

import { eachDayOfInterval, format, parseISO } from "date-fns";
import { Check, Clock, Loader2, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	useSessionAvailabilities,
	useUpdateSessionAvailabilities,
} from "@/hooks/use-business-matching";
import { validEndTimes, validStartTimes } from "@/lib/time-blocks";
import { TimeSelect } from "./time-select";

interface ManageAvailabilityHoursProps {
	sessionId: string;
	eventId: string;
	// Whether the current viewer may add/remove sessions. Defaults to true
	// (staff can always edit); the create-session-dialog passes the
	// resolved value when a host is editing their own session.
	hoursEditable?: boolean;
	// Session date range (yyyy-MM-dd) — the days to list. Falls back to the
	// days that already have availability rows when missing.
	startDate?: string;
	endDate?: string;
}

type LocalAvailability = { day: string; start_time: string; end_time: string };

const toLocal = (list?: LocalAvailability[]): LocalAvailability[] =>
	(list ?? []).map(({ day, start_time, end_time }) => ({
		day,
		start_time,
		end_time,
	}));

export default function ManageAvailabilityHours({
	sessionId,
	eventId,
	hoursEditable = true,
	startDate,
	endDate,
}: ManageAvailabilityHoursProps) {
	// Already cached by the parent dialog (same query key), so this opens
	// without a spinner. The day list comes from the session's date range —
	// no need for the heavy slot-generating availability endpoint.
	const { data: rawAvailabilities, isLoading } =
		useSessionAvailabilities(sessionId);
	const { mutate: updateAvailabilities, isPending: isSavingAvs } =
		useUpdateSessionAvailabilities(sessionId, eventId);

	const [localAvailabilities, setLocalAvailabilities] = useState<
		{ day: string; start_time: string; end_time: string }[]
	>(() => toLocal(rawAvailabilities));
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [startSelectOpen, setStartSelectOpen] = useState(false);
	const [endSelectOpen, setEndSelectOpen] = useState(false);
	// Which day's "add session" form is currently open — only one at a time,
	// hidden by default so the day cards just show existing sessions.
	const [addingDay, setAddingDay] = useState<string | null>(null);

	// Re-sync when fresh data arrives (e.g. after a save).
	useEffect(() => {
		if (rawAvailabilities) setLocalAvailabilities(toLocal(rawAvailabilities));
	}, [rawAvailabilities]);

	const days = useMemo(() => {
		if (startDate && endDate) {
			return eachDayOfInterval({
				start: parseISO(startDate),
				end: parseISO(endDate),
			}).map((d) => format(d, "yyyy-MM-dd"));
		}
		return Array.from(
			new Set((rawAvailabilities ?? []).map((av) => av.day)),
		).sort();
	}, [startDate, endDate, rawAvailabilities]);

	const handleNewStartChange = (value: string) => {
		setNewStart(value);
		setNewEnd("");
		setStartSelectOpen(false);
		// Move straight to picking the end time next.
		setEndSelectOpen(true);
	};

	const closeAddForm = () => {
		setAddingDay(null);
		setNewStart("");
		setNewEnd("");
	};

	const handleAddSession = (dateStr: string): boolean => {
		if (!newStart || !newEnd) return false;

		setLocalAvailabilities((prev) => [
			...prev,
			{ day: dateStr, start_time: newStart, end_time: newEnd },
		]);
		toast.success("Availability session added!");
		return true;
	};

	const handleRemoveSession = (dateStr: string, indexToRemove: number) => {
		setLocalAvailabilities((prev) => {
			const daySessions = prev.filter((av) => av.day === dateStr);
			const otherSessions = prev.filter((av) => av.day !== dateStr);
			const updatedDaySessions = daySessions.filter(
				(_, i) => i !== indexToRemove,
			);
			return [...otherSessions, ...updatedDaySessions];
		});
		toast.success("Availability session removed!");
	};

	const handleSaveAvailabilities = () => {
		updateAvailabilities(
			{ availabilities: localAvailabilities },
			{
				onSuccess: () => {
					toast.success("Availability saved successfully!");
				},
				onError: (error) => {
					toast.error("Failed to save availabilities", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="shrink-0">
				<h3 className="flex items-center gap-2 font-semibold text-base">
					<Clock className="h-4 w-4" />
					Working hours & breaks
				</h3>
				<p className="text-muted-foreground text-sm">
					{hoursEditable
						? "Add active shift hours. Gaps between ranges act as lunch breaks / rest times."
						: "Your event organizer manages your hours — contact them to make changes."}
				</p>
			</div>

			{isLoading && !rawAvailabilities ? (
				<div className="flex h-32 items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
						{days.map((dateObj) => {
							const daySessions = localAvailabilities.filter(
								(av) => av.day === dateObj,
							);

							return (
								<div key={dateObj} className="space-y-3 border bg-muted/20 p-3">
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-sm">
											{format(parseISO(dateObj), "EEE, d MMM yyyy")}
										</span>
										{daySessions.length === 0 && (
											<Badge
												variant="secondary"
												className="rounded-none bg-red-100 text-red-800"
											>
												Rest day
											</Badge>
										)}
									</div>

									{daySessions.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{daySessions.map((session, idx) => (
												<Badge
													key={`${dateObj}-${session.start_time}-${session.end_time}-${idx}`}
													variant="secondary"
													className="gap-2 rounded-none bg-green-100 px-2.5 py-1 text-green-800 tabular-nums"
												>
													{session.start_time} – {session.end_time}
													{hoursEditable && (
														<button
															type="button"
															onClick={() => handleRemoveSession(dateObj, idx)}
															className="text-green-800 transition hover:text-red-600"
															title="Remove"
														>
															<X className="h-3 w-3" />
														</button>
													)}
												</Badge>
											))}
										</div>
									)}

									{hoursEditable && (
										<div className="border-t border-dashed pt-3">
											{addingDay === dateObj ? (
												<div className="flex flex-wrap items-center gap-2">
													<TimeSelect
														options={validStartTimes(daySessions)}
														open={startSelectOpen}
														onOpenChange={setStartSelectOpen}
														value={newStart}
														onValueChange={handleNewStartChange}
														placeholder="Start"
														className="w-28 rounded-none"
													/>
													<span className="text-muted-foreground text-xs">
														to
													</span>
													<TimeSelect
														options={
															newStart
																? validEndTimes(daySessions, newStart)
																: []
														}
														open={endSelectOpen}
														onOpenChange={setEndSelectOpen}
														value={newEnd}
														onValueChange={setNewEnd}
														disabled={!newStart}
														placeholder="End"
														className="w-28 rounded-none"
													/>
													<div className="ml-auto flex gap-1">
														<Button
															type="button"
															size="icon-sm"
															className="rounded-none"
															onClick={() => {
																if (handleAddSession(dateObj)) closeAddForm();
															}}
															disabled={!newStart || !newEnd}
															title="Add"
														>
															<Check className="h-3.5 w-3.5" />
														</Button>
														<Button
															type="button"
															size="icon-sm"
															variant="ghost"
															className="rounded-none"
															onClick={closeAddForm}
															title="Cancel"
														>
															<X className="h-3.5 w-3.5" />
														</Button>
													</div>
												</div>
											) : (
												<Button
													type="button"
													size="sm"
													variant="outline"
													onClick={() => {
														setNewStart("");
														setNewEnd("");
														setAddingDay(dateObj);
														setStartSelectOpen(true);
													}}
													disabled={validStartTimes(daySessions).length === 0}
													className="h-8 gap-1 rounded-none text-xs"
												>
													<Plus className="h-3 w-3" /> Add session
												</Button>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{hoursEditable && (
						<div className="flex shrink-0 justify-end border-t pt-4">
							<Button
								type="button"
								className="rounded-none"
								onClick={handleSaveAvailabilities}
								disabled={isSavingAvs}
							>
								{isSavingAvs && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save availability
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
