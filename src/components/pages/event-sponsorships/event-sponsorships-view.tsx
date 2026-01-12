"use client";

import { Handshake, List, Kanban } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/data-state";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventSponsorship, EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { EventSponsorshipsTable } from "./table/event-sponsorships-table";
import CreateEventSponsorshipForm from "./forms/create-event-sponsorship-form";
import EventSponsorshipsKanban from "./kanban/event-sponsorships-kanban";

interface EventSponsorshipsViewProps {
  eventId: string;
  sponsorships: EventSponsorship[];
  tiers: EventSponsorshipTier[];
}

export default function EventSponsorshipsView({ eventId, sponsorships, tiers }: EventSponsorshipsViewProps) {
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
      <div className="flex flex-col gap-4 mb-6 px-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <IconTitle
              icon={Handshake}
              title="Event Sponsorships"
              description="Track and manage sponsorships for this event."
          />
          <Button className="md:hidden" onClick={handleAddSponsorship}>Add Sponsorship</Button>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="border rounded-lg p-1 bg-muted/20">
                <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => setViewMode("list")}
                >
                    <List className="size-4 mr-2" />
                    List
                </Button>
                <Button 
                    variant={viewMode === "board" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => setViewMode("board")}
                >
                    <Kanban className="size-4 mr-2" />
                    Board
                </Button>
            </div>
            <Button className="hidden md:flex" onClick={handleAddSponsorship}>Add Sponsorship</Button>
        </div>
      </div>
      
      <div className="px-4">
        {viewMode === "list" ? (
            <EventSponsorshipsTable data={sponsorships} onAddSponsorship={handleAddSponsorship} />
        ) : (
            <EventSponsorshipsKanban sponsorships={sponsorships} tiers={tiers} />
        )}
      </div>
    </div>
  );
}