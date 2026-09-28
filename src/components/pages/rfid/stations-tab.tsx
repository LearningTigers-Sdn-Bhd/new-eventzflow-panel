"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { RfidStation } from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { RfidTable } from "./rfid-table";
import { StationCorrectionDialog } from "./station-correction-dialog";

const ROLE_BADGE_CLASSES: Record<string, string> = {
	entry: "bg-green-100 text-green-800 hover:bg-green-100",
	exit: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

function RoleBadge({ role }: { role: RfidStation["role"] }) {
	if (!role) return <span className="text-muted-foreground">unset</span>;
	return (
		<Badge
			className={cn(
				"rounded-none",
				ROLE_BADGE_CLASSES[role] ??
					"bg-gray-100 text-gray-800 hover:bg-gray-100",
			)}
		>
			{role}
		</Badge>
	);
}

function hardwareSummary(station: RfidStation): string {
	const parts = [
		station.hw_model,
		station.firmware && `fw ${station.firmware}`,
		station.app_version && `app ${station.app_version}`,
	].filter(Boolean);
	return parts.length > 0 ? parts.join(" · ") : "—";
}

export function StationsTab({
	eventId,
	stations,
	canUpdate,
}: {
	eventId: string;
	stations: RfidStation[];
	canUpdate: boolean;
}) {
	const [selected, setSelected] = useState<RfidStation | null>(null);

	const columns: ColumnDef<RfidStation, unknown>[] = [
		{
			accessorKey: "station_key",
			header: "Station",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<span className="font-medium">{row.original.station_key}</span>
					<span className="text-muted-foreground text-sm">
						{row.original.name ?? "—"}
					</span>
				</div>
			),
		},
		{ accessorKey: "kind", header: "Kind" },
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => <RoleBadge role={row.original.role} />,
		},
		{ accessorKey: "uid_rule", header: "UID rule" },
		{
			id: "hardware",
			header: "Hardware",
			cell: ({ row }) => (
				<span className="text-sm">{hardwareSummary(row.original)}</span>
			),
		},
		{
			accessorKey: "last_heartbeat_at",
			header: "Last seen",
			cell: ({ row }) =>
				row.original.last_heartbeat_at ? (
					formatDateTime(row.original.last_heartbeat_at)
				) : (
					<span className="text-muted-foreground">never</span>
				),
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) =>
				canUpdate ? (
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={() => setSelected(row.original)}
					>
						<Pencil className="size-4" />
						Correct
					</Button>
				) : null,
		},
	];

	return (
		<>
			<RfidTable
				columns={columns}
				data={stations}
				emptyTitle="No stations yet"
				emptyDescription="Stations appear after their first heartbeat from RfiDex."
				renderMobileCard={(station) => (
					<Item variant="outline" className="w-full rounded-none">
						<ItemHeader className="flex flex-col items-start gap-1">
							<ItemTitle className="w-full justify-between">
								<span className="font-bold text-base">
									{station.station_key}
								</span>
								<RoleBadge role={station.role} />
							</ItemTitle>
							<ItemDescription>
								{station.name ?? "—"} · {station.kind} · UID {station.uid_rule}
							</ItemDescription>
						</ItemHeader>
						<ItemContent className="space-y-1 text-muted-foreground text-sm">
							<p>Hardware: {hardwareSummary(station)}</p>
							<p>
								Last seen:{" "}
								{station.last_heartbeat_at
									? formatDateTime(station.last_heartbeat_at)
									: "never"}
							</p>
							{canUpdate && (
								<Button
									variant="outline"
									size="sm"
									className="mt-2 rounded-none"
									onClick={() => setSelected(station)}
								>
									<Pencil className="size-4" />
									Correct
								</Button>
							)}
						</ItemContent>
					</Item>
				)}
			/>
			<StationCorrectionDialog
				eventId={eventId}
				station={selected}
				canUpdate={canUpdate}
				open={selected !== null}
				onOpenChange={(open) => !open && setSelected(null)}
			/>
		</>
	);
}
