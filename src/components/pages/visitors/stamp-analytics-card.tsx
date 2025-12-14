"use client";

import { Activity, BarChart3, TrendingUp, Users } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { StampAnalytics } from "@/lib/api/stamp-analytics";

interface StampAnalyticsCardProps {
	analytics: StampAnalytics;
}

export function StampAnalyticsCard({ analytics }: StampAnalyticsCardProps) {
	// Calculate average stamps per visitor
	const avgStampsPerVisitor =
		analytics.unique_visitors > 0
			? (analytics.stamp_count / analytics.unique_visitors).toFixed(2)
			: 0;

	// Calculate engagement rate (percentage of visitors who got stamped)
	// This would require total visitor count from backend, but we can show what we have
	const engagementRate =
		analytics.unique_visitors > 0
			? Math.min(
					100,
					(analytics.unique_visitors * 100) / (analytics.stamp_count || 1),
				)
			: 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Stamp Analytics</CardTitle>
				<CardDescription>
					Vendor engagement and visitor interaction statistics
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Main metrics grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{/* Total Stamps */}
						<div className="space-y-2 rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<p className="font-medium text-muted-foreground text-sm">
									Total Stamps
								</p>
								<BarChart3 className="h-4 w-4 text-primary opacity-60" />
							</div>
							<p className="font-bold text-3xl">{analytics.stamp_count}</p>
							<p className="text-muted-foreground text-xs">
								Total visitor scans recorded
							</p>
						</div>

						{/* Unique Visitors */}
						<div className="space-y-2 rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<p className="font-medium text-muted-foreground text-sm">
									Unique Visitors
								</p>
								<Users className="h-4 w-4 text-blue-500 opacity-60" />
							</div>
							<p className="font-bold text-3xl">{analytics.unique_visitors}</p>
							<p className="text-muted-foreground text-xs">
								Different visitors scanned
							</p>
						</div>

						{/* Average per Visitor */}
						<div className="space-y-2 rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<p className="font-medium text-muted-foreground text-sm">
									Avg per Visitor
								</p>
								<Activity className="h-4 w-4 text-green-500 opacity-60" />
							</div>
							<p className="font-bold text-3xl">{avgStampsPerVisitor}</p>
							<p className="text-muted-foreground text-xs">
								Stamps per visitor
							</p>
						</div>

						{/* Engagement Rate */}
						<div className="space-y-2 rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<p className="font-medium text-muted-foreground text-sm">
									Repeat Rate
								</p>
								<TrendingUp className="h-4 w-4 text-orange-500 opacity-60" />
							</div>
							<p className="font-bold text-3xl">
								{engagementRate > 0 ? engagementRate.toFixed(0) : 0}%
							</p>
							<p className="text-muted-foreground text-xs">
								Visitor interaction intensity
							</p>
						</div>
					</div>

					{/* Summary stats */}
					<div className="space-y-2 rounded-lg bg-muted/50 p-4">
						<p className="font-medium text-sm">Summary</p>
						<div className="space-y-1 text-muted-foreground text-sm">
							{analytics.stamp_count > 0 && analytics.unique_visitors > 0 ? (
								<>
									<p>
										This vendor has received{" "}
										<strong>{analytics.stamp_count}</strong> scans from{" "}
										<strong>{analytics.unique_visitors}</strong> unique
										visitors.
									</p>
									<p>
										On average, each visitor was scanned{" "}
										<strong>{avgStampsPerVisitor} times</strong> by this vendor.
									</p>
									<p className="pt-2 font-medium text-foreground text-xs">
										🎯 This indicates strong visitor engagement at this vendor's
										booth!
									</p>
								</>
							) : (
								<p className="text-muted-foreground">
									No stamp data available yet. Stamps will appear here when
									visitors are scanned.
								</p>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
