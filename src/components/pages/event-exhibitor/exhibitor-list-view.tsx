"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	CreditCard,
	FileQuestion,
	Info,
	Package,
	Printer,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEventVendors } from "@/lib/api/event-vendor";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import { getExhibitorZones } from "@/lib/api/exhibitor-zone";
import { flattenExhibitorKits } from "@/lib/exhibitor-kits";
import { CustomRequestsView } from "./custom-requests-view";
import { ExtraTeamMemberPaymentsView } from "./extra-team-member-payments-view";
import { OrderedItemsView } from "./ordered-items-view";
import { OrderedServicesView } from "./ordered-services-view";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";

interface ExhibitorListViewProps {
	eventId: string;
	canManageVendors: boolean;
}

/**
 * Component for admins to view and manage exhibitors list
 */
const TAB_OPTIONS = [
	{ value: "exhibitors", label: "Exhibitors", icon: Users },
	{ value: "items", label: "Ordered Items", icon: Package },
	{ value: "services", label: "Ordered Services", icon: Printer },
	{ value: "extra-payments", label: "Extra Member Payments", icon: CreditCard },
	// HIDDEN: Custom Requests feature temporarily disabled
	// { value: "custom-requests", label: "Custom Requests", icon: FileQuestion },
];

export function ExhibitorListView({
	eventId,
	canManageVendors,
}: ExhibitorListViewProps) {
	const [activeTab, setActiveTab] = useState("exhibitors");
	const isMobile = useIsMobile();

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});
	const { data: boothPrices = [] } = useQuery({
		queryKey: ["exhibitor-booth-prices", Number(eventId)],
		queryFn: () => getExhibitorBoothPrices(Number(eventId)),
	});
	const { data: zones = [] } = useQuery({
		queryKey: ["exhibitor-zones", Number(eventId)],
		queryFn: () => getExhibitorZones(Number(eventId)),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading exhibitors..."
				description="Please wait while we fetch exhibitors..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load exhibitors"
				description="We couldn't load exhibitors. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const currentTab =
		TAB_OPTIONS.find((tab) => tab.value === activeTab) || TAB_OPTIONS[0];
	const CurrentIcon = currentTab.icon;

	return (
		<div className="space-y-4 p-0">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				{/* Mobile: Select Dropdown */}
				{isMobile ? (
					<div className="w-full border-y border-dashed">
						<Select value={activeTab} onValueChange={setActiveTab}>
							<SelectTrigger className="h-12 w-full rounded-none border-none bg-accent/50 transition-colors hover:bg-accent">
								<SelectValue>
									<div className="flex items-center gap-2">
										<CurrentIcon className="size-4" />
										<span>{currentTab.label}</span>
									</div>
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-none bg-background">
								{TAB_OPTIONS.map((tab) => {
									const TabIcon = tab.icon;
									return (
										<SelectItem
											key={tab.value}
											value={tab.value}
											className="h-10 rounded-none"
										>
											<div className="flex items-center gap-2">
												<TabIcon className="size-4" />
												<span>{tab.label}</span>
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>
				) : (
					/* Desktop: Tab List */
					<div className="w-full border-y border-dashed">
						<TabsList className="flex h-12 w-full rounded-none">
							<TabsTrigger
								value="exhibitors"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Users className="size-4" />
								Exhibitors
							</TabsTrigger>
							<TabsTrigger
								value="items"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Package className="size-4" />
								Ordered Items
							</TabsTrigger>
							<TabsTrigger
								value="services"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Printer className="size-4" />
								Ordered Services
							</TabsTrigger>
							<TabsTrigger
								value="extra-payments"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<CreditCard className="size-4" />
								Extra Payments
							</TabsTrigger>
							{/* HIDDEN: Custom Requests feature temporarily disabled */}
							{/* <TabsTrigger
								value="custom-requests"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<FileQuestion className="size-4" />
								Custom Requests
							</TabsTrigger> */}
						</TabsList>
					</div>
				)}

				<div className="mt-6">
					<TabsContent value="exhibitors" className="mt-0">
						<div className="space-y-4">
							<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-start gap-3">
									<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">
											Assign exhibitors to this event
										</p>
										<p className="text-muted-foreground text-sm">
											This page shows exhibitors assigned to this event. To
											create new vendors, go to the Vendors page.
										</p>
									</div>
								</div>
								<Button
									variant="outline"
									asChild
									className="w-full rounded-none sm:w-auto sm:shrink-0"
								>
									<Link href="/vendor">
										Go to Vendors
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>
							<DataTable
								columns={columns}
								data={flattenExhibitorKits(vendors || [])}
								canManageVendors={canManageVendors}
								configuredPricingLabels={boothPrices.map(
									(boothPrice) => boothPrice.label,
								)}
								configuredZones={zones.map((zone) => zone.zone)}
							/>
						</div>
					</TabsContent>

					<TabsContent value="items" className="mt-0">
						<OrderedItemsView eventId={eventId} />
					</TabsContent>

					<TabsContent value="services" className="mt-0">
						<OrderedServicesView eventId={eventId} />
					</TabsContent>

					<TabsContent value="extra-payments" className="mt-0">
						<ExtraTeamMemberPaymentsView eventId={eventId} />
					</TabsContent>

					{/* HIDDEN: Custom Requests feature temporarily disabled */}
					{/* <TabsContent value="custom-requests" className="mt-0">
						<CustomRequestsView eventId={eventId} />
					</TabsContent> */}
				</div>
			</Tabs>
		</div>
	);
}
