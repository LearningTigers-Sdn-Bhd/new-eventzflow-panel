"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { useHostInvitations } from "@/hooks/use-business-matching";
import type { HostInvitationStatus } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";

const statusTone: Record<HostInvitationStatus, string> = {
	queued: "bg-slate-500",
	sending: "bg-blue-500",
	sent: "bg-cyan-500",
	delivered: "bg-green-500",
	failed: "bg-red-500",
	bounced: "bg-orange-500",
	complained: "bg-yellow-600",
	suppressed: "bg-zinc-500",
	skipped: "bg-zinc-400",
};

const formatTime = (iso: string) =>
	new Date(iso).toLocaleString("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	});

// Latest invitation sent to one address for this session, shown under the
// send button so the organizer sees the outcome (or a prior send) in place.
export const LastInviteStatus: React.FC<{
	eventId: string;
	bmEventId: string;
	email: string;
}> = ({ eventId, bmEventId, email }) => {
	const { data: invitations } = useHostInvitations(eventId, bmEventId);
	const target = email.trim().toLowerCase();
	const last = invitations?.find((i) => i.recipient?.toLowerCase() === target);
	if (!last) return null;

	return (
		<div className="flex items-center justify-between gap-2 border bg-muted/30 px-3 py-2 text-xs">
			<span className="text-muted-foreground">
				Last sent {formatTime(last.created_at)}
				{last.failure_reason &&
					` · ${last.failure_reason.replaceAll("_", " ")}`}
			</span>
			<Badge
				variant="outline"
				className={cn(
					"rounded-none border-transparent px-2 py-0.5 font-bold text-white text-xs capitalize",
					statusTone[last.status],
				)}
			>
				{last.status}
			</Badge>
		</div>
	);
};

// Caution under the email input when this address was already invited to
// this session, so a re-open doesn't lead to an unnoticed second email.
export const AlreadyInvitedWarning: React.FC<{
	eventId: string;
	bmEventId: string;
	email: string;
}> = ({ eventId, bmEventId, email }) => {
	const { data: invitations } = useHostInvitations(eventId, bmEventId);
	const target = email.trim().toLowerCase();
	const last = invitations?.find((i) => i.recipient?.toLowerCase() === target);
	if (!last) return null;

	return (
		<div
			role="alert"
			className="flex items-start gap-2 border border-amber-300 bg-amber-50 p-3 text-amber-900 text-xs dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
		>
			<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
			<p>
				An invitation was already sent to this address on{" "}
				{formatTime(last.created_at)} (
				<span className="font-semibold capitalize">{last.status}</span>
				). Continuing lets you send it again.
			</p>
		</div>
	);
};

const PROBLEM_STATUSES: HostInvitationStatus[] = [
	"failed",
	"bounced",
	"complained",
	"suppressed",
];

// Shown on open, before any email is typed, so an organizer knows invites
// already exist for this session. Red when any of them hit a problem.
export const InvitationsSummaryBanner: React.FC<{
	eventId: string;
	bmEventId: string;
	onView: () => void;
}> = ({ eventId, bmEventId, onView }) => {
	const { data: invitations } = useHostInvitations(eventId, bmEventId);
	if (!invitations?.length) return null;

	const problems = invitations.filter((i) =>
		PROBLEM_STATUSES.includes(i.status),
	).length;
	const count = invitations.length;

	return (
		<div
			role="alert"
			className={cn(
				"mt-4 flex items-center justify-between gap-3 border p-3 text-xs",
				problems
					? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
					: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
			)}
		>
			<div className="flex items-start gap-2">
				<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
				<p>
					{count} invitation{count > 1 ? "s" : ""} already sent for this session
					{problems > 0 && ` · ${problems} with delivery problems`}.
				</p>
			</div>
			<button
				type="button"
				onClick={onView}
				className="shrink-0 font-semibold underline underline-offset-2"
			>
				View status
			</button>
		</div>
	);
};

interface HostInvitationsListProps {
	eventId: string;
	bmEventId: string;
}

const HostInvitationsList: React.FC<HostInvitationsListProps> = ({
	eventId,
	bmEventId,
}) => {
	const { data: invitations, isLoading } = useHostInvitations(
		eventId,
		bmEventId,
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!invitations?.length) {
		return (
			<p className="py-8 text-center text-muted-foreground text-sm">
				No invitation emails sent for this session yet.
			</p>
		);
	}

	return (
		<ul className="divide-y border">
			{invitations.map((invitation) => (
				<li
					key={invitation.id}
					className="flex items-center justify-between gap-3 p-3"
				>
					<div className="min-w-0">
						<p className="truncate font-medium text-sm">
							{invitation.recipient ?? "-"}
						</p>
						<p className="text-muted-foreground text-xs">
							Sent {formatTime(invitation.created_at)}
							{invitation.failure_reason &&
								` · ${invitation.failure_reason.replaceAll("_", " ")}`}
						</p>
					</div>
					<Badge
						variant="outline"
						className={cn(
							"rounded-none border-transparent px-2 py-0.5 font-bold text-white text-xs capitalize",
							statusTone[invitation.status],
						)}
					>
						{invitation.status}
					</Badge>
				</li>
			))}
		</ul>
	);
};

export default HostInvitationsList;
