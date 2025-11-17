"use client";

import { CheckCircle } from "lucide-react";

interface StampActivityFeedProps {
	eventId: number;
}

export function StampActivityFeed({ eventId }: StampActivityFeedProps) {
	// This would typically fetch recent stamp activity
	// For now, showing a placeholder

	return (
		<div className="space-y-4">
			<div className="page-header border-y border-dashed">
				<div className="px-2 md:px-4">
					<div>
						<h3 className="font-semibold text-lg">Recent Activity</h3>
						<p className="text-muted-foreground text-sm">
							Recent stamp scans will appear here
						</p>
					</div>
				</div>
			</div>

			<div className="px-2 md:px-4">
				<div className="flex h-[300px] items-center justify-center text-center">
					<div>
						<CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
						<p className="mt-4 font-medium text-sm">No recent activity</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Stamp scans will appear here
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
