"use client";

import {
	Briefcase,
	CalendarDays,
	FileText,
	Globe,
	TrendingUp,
	Users,
} from "lucide-react";
import { PieChartCard } from "@/components/admin-ui/analytic/pie-chart-card";
import { ProgressStatsCard } from "@/components/admin-ui/analytic/stats-card";
import { TimeSeriesChart } from "@/components/admin-ui/analytic/time-series-chart";
import type { ResourceLeadMetrics } from "@/lib/api/resource/lead/response";

interface MetricsDashboardProps {
	metrics: ResourceLeadMetrics;
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
	// Format data for stats cards
	const gatedResourcesData = {
		icon: FileText,
		title: "Gated Resources",
		subtitle: "Total resources requiring lead submission",
		indicators: [
			{
				label: "Total Gated Resources",
				count: metrics.resources.count,
				isTotal: true,
			},
		],
	};

	const resourcesWithLeadsData = {
		icon: TrendingUp,
		title: "Resources with Leads",
		subtitle: "Gated resources that have captured leads",
		indicators: [
			{
				label: "With Leads",
				count: metrics.resources.filled,
				color: "green" as const,
			},
			{
				label: "Total Gated",
				count: metrics.resources.count,
				isTotal: true,
			},
		],
		progressValue: metrics.resources.filled,
	};

	const totalLeadsData = {
		icon: Users,
		title: "Total Leads",
		subtitle: "All leads captured across gated resources",
		indicators: [
			{
				label: "Total Leads",
				count: metrics.total_leads,
				isTotal: true,
			},
		],
	};

	// Format data for time series chart
	const timeSeriesData = metrics.date.map((item) => ({
		date: item.week,
		value: item.lead_counts,
	}));

	// Format data for country pie chart
	const countryChartData = metrics.country.map((item) => ({
		label: item.name,
		value: item.count,
	}));

	// Format data for job title pie chart
	const jobChartData = metrics.job.map((item) => ({
		label: item.title,
		value: item.count,
	}));

	return (
		<div className="space-y-6">
			{/* Stats Cards - 6 columns grid on desktop, each card spans 2 columns */}
			<div className="grid gap-4 md:grid-cols-6">
				<div className="md:col-span-2">
					<ProgressStatsCard data={gatedResourcesData} />
				</div>
				<div className="md:col-span-2">
					<ProgressStatsCard data={resourcesWithLeadsData} />
				</div>
				<div className="md:col-span-2">
					<ProgressStatsCard data={totalLeadsData} />
				</div>
			</div>

			{/* Charts Section - 6 columns grid on desktop */}
			<div className="grid gap-4 lg:grid-cols-6">
				{/* Time Series Chart - Full width on mobile, spans 6 columns on desktop */}
				<div className="lg:col-span-6">
					<TimeSeriesChart
						title="Weekly Lead Trends"
						description="Number of leads captured per week (last 12 weeks)"
						data={timeSeriesData}
						color="hsl(var(--chart-1))"
						icon={<CalendarDays className="h-4 w-4" />}
						emptyMessage="No leads captured in the last 12 weeks"
					/>
				</div>

				{/* Country Distribution - spans 3 columns */}
				<div className="lg:col-span-3">
					<PieChartCard
						title="Top Countries"
						description="Lead distribution by country (top 10)"
						data={countryChartData}
						icon={<Globe className="h-4 w-4" />}
						emptyMessage="No country data available"
					/>
				</div>

				{/* Job Title Distribution - spans 3 columns */}
				<div className="lg:col-span-3">
					<PieChartCard
						title="Top Job Titles"
						description="Lead distribution by job title (top 10)"
						data={jobChartData}
						icon={<Briefcase className="h-4 w-4" />}
						emptyMessage="No job title data available"
					/>
				</div>
			</div>
		</div>
	);
}
