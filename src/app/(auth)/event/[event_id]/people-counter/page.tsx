"use client";

import { Activity, LineChart, Settings2 } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { use } from "react";
import { ConnectionForm } from "@/components/pages/headcount/connection-form";
import { HallManager } from "@/components/pages/headcount/hall-manager";
import { HeadcountOverview } from "@/components/pages/headcount/headcount-overview";
import { TrendsPanel } from "@/components/pages/headcount/trends-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth/use-auth";

const TABS = ["live", "trends", "settings"] as const;

/**
 * People counter: "Live counts" is the data, for everyone who can view the event.
 * "Settings" (connection + halls) is for org owners only; the API enforces it too.
 */
export default function PeopleCounterPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();
	const canManage = user?.role === "org_owner";

	// Kept in the URL (?tab=settings) so a refresh or a shared link lands on the same tab.
	const [requestedTab, setTab] = useQueryState(
		"tab",
		parseAsStringLiteral(TABS).withDefault("live"),
	);
	const tab = canManage ? requestedTab : "live";

	return (
		<div className="p-0">
			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as (typeof TABS)[number])}
				className="w-full"
			>
				<div className="w-full overflow-x-auto border-y border-dashed">
					<TabsList className="flex h-12 w-full rounded-none">
						<TabsTrigger
							value="live"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Activity className="size-4" />
							Live counts
						</TabsTrigger>
						<TabsTrigger
							value="trends"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<LineChart className="size-4" />
							Trends
						</TabsTrigger>
						{canManage && (
							<TabsTrigger
								value="settings"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Settings2 className="size-4" />
								Settings
							</TabsTrigger>
						)}
					</TabsList>
				</div>

				<div className="mt-6 min-w-0">
					<TabsContent value="live" className="mt-0">
						<HeadcountOverview
							eventId={event_id}
							canManage={canManage}
							onOpenSettings={() => setTab("settings")}
						/>
					</TabsContent>

					<TabsContent value="trends" className="mt-0">
						<TrendsPanel
							eventId={event_id}
							canManage={canManage}
							onOpenSettings={() => setTab("settings")}
						/>
					</TabsContent>

					{canManage && (
						<TabsContent value="settings" className="mt-0 space-y-4">
							<ConnectionForm eventId={event_id} />
							<HallManager eventId={event_id} />
						</TabsContent>
					)}
				</div>
			</Tabs>
		</div>
	);
}
