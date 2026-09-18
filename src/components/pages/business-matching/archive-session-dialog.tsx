"use client";

import {
	AlertTriangle,
	Archive,
	ArchiveRestore,
	CalendarX,
	Loader2,
	UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	useArchiveBusinessMatchingSession,
	useUnarchiveBusinessMatchingSession,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";

interface ArchiveSessionDialogProps {
	session: BusinessMatchingEvent;
}

export default function ArchiveSessionDialog({
	session,
}: ArchiveSessionDialogProps) {
	const { closeDialog } = useDialog();
	const hasHost = !!session.host;
	const bookingsCount = session.bookings_count ?? 0;
	const canArchive = !hasHost && bookingsCount === 0;

	const { mutate: archiveSession, isPending: isArchiving } =
		useArchiveBusinessMatchingSession(session.event_id);

	const handleArchive = () => {
		archiveSession(session.id, {
			onSuccess: () => {
				toast.success(`Session "${session.title}" archived successfully`);
				closeDialog();
			},
			onError: (err) => {
				toast.error("Failed to archive session", {
					description: err.message || "An unexpected error occurred",
				});
			},
		});
	};

	// Case 1: Session has bookings and/or host attached -> Show info modal with close button only
	if (!canArchive) {
		return (
			<div className="space-y-4 py-2">
				<div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
					<div className="space-y-1 text-sm leading-relaxed">
						<p className="font-semibold">
							This session cannot be archived right now.
						</p>
						<p className="text-muted-foreground text-xs dark:text-amber-300/80">
							Sessions can only be archived when there are no active bookings
							and no host assigned.
						</p>
					</div>
				</div>

				<div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3.5 text-sm">
					<p className="font-medium text-foreground text-xs">
						To archive this session, please complete the following:
					</p>
					<ul className="space-y-2 text-xs">
						{bookingsCount > 0 && (
							<li className="flex items-start gap-2 text-muted-foreground">
								<CalendarX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
								<span>
									<strong className="text-foreground">
										Cancel or move existing bookings:
									</strong>{" "}
									There {bookingsCount === 1 ? "is" : "are"} currently{" "}
									<span className="font-semibold text-foreground">
										{bookingsCount}
									</span>{" "}
									active booking{bookingsCount === 1 ? "" : "s"}.
								</span>
							</li>
						)}
						{hasHost && (
							<li className="flex items-start gap-2 text-muted-foreground">
								<UserX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
								<span>
									<strong className="text-foreground">
										Remove the assigned host:
									</strong>{" "}
									Currently assigned to{" "}
									<span className="font-semibold text-foreground">
										{session.host?.full_name}
									</span>
									.
								</span>
							</li>
						)}
					</ul>
				</div>

				<div className="flex justify-end pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						className="min-w-[90px]"
					>
						Close
					</Button>
				</div>
			</div>
		);
	}

	// Case 2: Session is eligible for archive (no bookings and no host) -> Confirmation modal
	return (
		<div className="space-y-4 py-2">
			<div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Archive className="h-4 w-4" />
				</div>
				<div className="space-y-1 text-sm">
					<p className="font-semibold text-foreground">
						Archive "{session.title}"?
					</p>
					<p className="text-muted-foreground text-xs leading-relaxed">
						When archived, this session will automatically be hidden from the
						active session list and public bookings. You can view or restore it
						at any time from the <strong>Archived</strong> tab.
					</p>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isArchiving}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={handleArchive}
					disabled={isArchiving}
				>
					{isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Archive Session
				</Button>
			</div>
		</div>
	);
}

interface RestoreSessionDialogProps {
	session: BusinessMatchingEvent;
}

export function RestoreSessionDialog({ session }: RestoreSessionDialogProps) {
	const { closeDialog } = useDialog();
	const { mutate: unarchiveSession, isPending: isRestoring } =
		useUnarchiveBusinessMatchingSession(session.event_id);

	const handleRestore = () => {
		unarchiveSession(session.id, {
			onSuccess: () => {
				toast.success(`Session "${session.title}" restored successfully`);
				closeDialog();
			},
			onError: (err) => {
				toast.error("Failed to restore session", {
					description: err.message || "An unexpected error occurred",
				});
			},
		});
	};

	return (
		<div className="space-y-4 py-2">
			<div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
					<ArchiveRestore className="h-4 w-4" />
				</div>
				<div className="space-y-1 text-sm">
					<p className="font-semibold text-foreground">
						Restore "{session.title}"?
					</p>
					<p className="text-muted-foreground text-xs leading-relaxed">
						This session will be unarchived and visible again in the active
						sessions list and will become eligible for host assignment.
					</p>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isRestoring}
				>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={handleRestore}
					disabled={isRestoring}
					className="bg-emerald-600 text-white hover:bg-emerald-700"
				>
					{isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Restore Session
				</Button>
			</div>
		</div>
	);
}
