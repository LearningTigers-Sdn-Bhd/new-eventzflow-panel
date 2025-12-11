"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Package, Printer, HardHat, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";

interface ContractorEventDashboardProps {
	eventId: string;
}

export function ContractorEventDashboard({ eventId }: ContractorEventDashboardProps) {
	const router = useRouter();

	const dashboardItems = [
		{
			title: "Event Rentable Items",
			description: "Link your rentable items to this event and configure pricing tiers.",
			icon: Package,
			route: `/event/${eventId}/rentable-items` as Route,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			title: "Event Printing Services",
			description: "Link your printing services to this event and manage pricing.",
			icon: Printer,
			route: `/event/${eventId}/printing-services` as Route,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
		},
	];

	return (
		<div className="space-y-6 p-4 border-t border-dashed">
			<div className="px-2 md:px-4">
				<IconTitle
					icon={HardHat}
					title="Exhibition Contractor Dashboard"
					description="Manage your items and services for this event."
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{dashboardItems.map((item) => (
					<Card 
						key={item.title} 
						className={`rounded-none border-dashed transition-all hover:border-solid ${
							item.disabled ? "opacity-60" : "cursor-pointer hover:shadow-md"
						}`}
						onClick={() => !item.disabled && router.push(item.route)}
					>
						<CardHeader className="pb-4">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className={`flex h-12 w-12 items-center justify-center rounded-none ${item.bgColor}`}>
										<item.icon className={`h-6 w-6 ${item.color}`} />
									</div>
									<div>
										<CardTitle className="text-lg">{item.title}</CardTitle>
										{item.disabled && (
											<span className="text-muted-foreground text-xs">Coming Soon</span>
										)}
									</div>
								</div>
								{!item.disabled && (
									<ArrowRight className="h-5 w-5 text-muted-foreground" />
								)}
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription>{item.description}</CardDescription>
							{!item.disabled && (
								<Button 
									variant="outline" 
									className="mt-4 w-full rounded-none"
									onClick={(e) => {
										e.stopPropagation();
										router.push(item.route);
									}}
								>
									Manage
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
