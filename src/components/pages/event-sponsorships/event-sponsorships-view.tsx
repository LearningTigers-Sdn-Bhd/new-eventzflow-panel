"use client";

import { Handshake, Kanban, List } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import type {
	EventSponsorship,
	EventSponsorshipTier,
} from "@/lib/api/sponsorship/response";
import CreateEventSponsorshipForm from "./forms/create-event-sponsorship-form";
import EventSponsorshipsKanban from "./kanban/event-sponsorships-kanban";
import { EventSponsorshipsTable } from "./table/event-sponsorships-table";

interface EventSponsorshipsViewProps {
	eventId: string;
	sponsorships: EventSponsorship[];
	tiers: EventSponsorshipTier[];
}

export default function EventSponsorshipsView({
	eventId,
	sponsorships,
	tiers,
}: EventSponsorshipsViewProps) {
	const { openDialog, closeDialog } = useDialog();
	const [viewMode, setViewMode] = useState<"list" | "board">("list");

	const handleAddSponsorship = () => {
		openDialog({
			component: CreateEventSponsorshipForm,
			props: {
				eventId,
				tiers,
				onClose: closeDialog,
			},
			config: {
				title: "Add Sponsorship",
				description: "Record a new sponsorship for this event",
				size: "2xl",
				showCloseButton: true,
			},
		});
	};

	if (sponsorships.length === 0) {
		return (
			<EmptyState
				title="No sponsorships yet"
				description="Add a sponsorship to start tracking contributions."
				icon={<Handshake />}
				action={<Button onClick={handleAddSponsorship}>Add Sponsorship</Button>}
			/>
		);
	}

	return (
		<div>
			<div className="mb-6 flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full items-center justify-between md:w-auto">
					<IconTitle
						icon={Handshake}
						title="Event Sponsorships"
						description="Track and manage sponsorships for this event."
					/>
					<Button className="md:hidden" onClick={handleAddSponsorship}>
						Add Sponsorship
					</Button>
				</div>

				<div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
					<div className="rounded-lg border bg-muted/20 p-1">
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode("list")}
						>
							<List className="mr-2 size-4" />
							List
						</Button>
						<Button
							variant={viewMode === "board" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode("board")}
						>
							<Kanban className="mr-2 size-4" />
							Board
						</Button>
					</div>
					<Button className="hidden md:flex" onClick={handleAddSponsorship}>
						Add Sponsorship
					</Button>
				</div>
			</div>

			<div className="px-4">
				{viewMode === "list" ? (
					<EventSponsorshipsTable
						data={sponsorships}
						onAddSponsorship={handleAddSponsorship}
					/>
				) : (
					<EventSponsorshipsKanban sponsorships={sponsorships} tiers={tiers} />
				)}
			</div>
		</div>
	);
}
