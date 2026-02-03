"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { SeatSessionRow } from "../seat-session-table-columns";
import { getSessionStatusConfig } from "../utils";
import { useParams, useRouter } from "next/navigation";

interface SeatSessionViewModalProps {
	session: SeatSessionRow;
}

export default function SeatSessionViewModal({
	session,
}: SeatSessionViewModalProps) {
	const isArchived = session.archived ?? !!session.deleted_at;
	const statusConfig = getSessionStatusConfig(session.status);
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();

	return (
		<div className="flex flex-col gap-6 p-4 md:pb-8">
			<div className="space-y-3">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Session Information
				</h3>
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Name:</span>
						<span className="text-right font-medium text-sm">
							{session.name}
						</span>
					</div>
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Location:</span>
						<span className="text-right font-medium text-sm">
							{session.location || "Not set"}
						</span>
					</div>
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Status:</span>
						<div className="flex flex-wrap items-center justify-end gap-2">
							<Badge
								variant="outline"
								className={cn("rounded-none", statusConfig.className)}
							>
								{statusConfig.label}
							</Badge>
							{isArchived && (
								<Badge
									variant="outline"
									className="rounded-none border-amber-500 bg-amber-50 text-amber-700"
								>
									Archived
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>

			<Separator />

			<div className="space-y-3">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Schedule
				</h3>
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Start:</span>
						<span className="text-right font-medium text-sm">
							{formatDateTime(session.start_datetime)}
						</span>
					</div>
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">End:</span>
						<span className="text-right font-medium text-sm">
							{formatDateTime(session.end_datetime)}
						</span>
					</div>
				</div>
			</div>

			<div className="flex w-full mt-6">
				<Button
					className="w-full rounded-none"
					onClick={() => {
						closeDialog();
						router.push(
							`/event/${eventId}/seat-ticketing/sessions/${session.id}`,
						);
					}}
				>
					Manage Session
				</Button>
			</div>
		</div>
	);
}
