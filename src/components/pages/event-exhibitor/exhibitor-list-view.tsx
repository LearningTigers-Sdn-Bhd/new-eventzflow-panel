"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileQuestion, Info, Package, Printer, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventVendors } from "@/lib/api/event-vendor";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";
import { OrderedItemsView } from "./ordered-items-view";
import { OrderedServicesView } from "./ordered-services-view";
import { CustomRequestsView } from "./custom-requests-view";

interface ExhibitorListViewProps {
	eventId: string;
	canManageVendors: boolean;
}

/**
 * Component for admins to view and manage exhibitors list
 */
export function ExhibitorListView({ eventId, canManageVendors }: ExhibitorListViewProps) {
	const [activeTab, setActiveTab] = useState("exhibitors");

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
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

	return (
		<div className="space-y-4 p-0">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
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
							value="custom-requests"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<FileQuestion className="size-4" />
							Custom Requests
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="mt-6">
					<TabsContent value="exhibitors" className="mt-0">
						<div className="space-y-4">
							<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-start gap-3">
									<Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
									<div className="space-y-1">
										<p className="text-sm font-medium">Assign exhibitors to this event</p>
										<p className="text-sm text-muted-foreground">
											This page shows exhibitors assigned to this event. To create new vendors, go to the Vendors page.
										</p>
									</div>
								</div>
								<Button variant="outline" asChild className="w-full rounded-none sm:w-auto sm:shrink-0">
									<Link href="/vendor">
										Go to Vendors
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>
							<DataTable columns={columns} data={vendors || []} canManageVendors={canManageVendors} />
						</div>
					</TabsContent>

					<TabsContent value="items" className="mt-0">
						<OrderedItemsView eventId={eventId} />
					</TabsContent>

					<TabsContent value="services" className="mt-0">
						<OrderedServicesView eventId={eventId} />
					</TabsContent>

					<TabsContent value="custom-requests" className="mt-0">
						<CustomRequestsView eventId={eventId} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
