"use client";

import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/data-state";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import CreateEventSponsorshipTierForm from "./forms/create-event-sponsorship-tier-form";
import { EventSponsorshipTiersTable } from "./table/event-sponsorship-tiers-table";

interface EventSponsorshipTiersViewProps {
  eventId: string;
  tiers: EventSponsorshipTier[];
}

export default function EventSponsorshipTiersView({ eventId, tiers }: EventSponsorshipTiersViewProps) {
  const { openDialog, closeDialog } = useDialog();

  const handleAddTier = () => {
    openDialog({
      component: CreateEventSponsorshipTierForm,
      props: {
        eventId,
        onClose: closeDialog,
      },
      config: {
        title: "Add Tier",
        description: "Create a new sponsorship tier/package",
        size: "2xl",
        showCloseButton: true,
      },
    });
  };

  if (tiers.length === 0) {
    return (
      <EmptyState
        title="No tiers defined"
        description="Create tiers (e.g., Gold, Silver) to structure your sponsorships."
        icon={<Layers />}
        action={<Button onClick={handleAddTier}>Add Tier</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-4">
        <IconTitle
            icon={Layers}
            title="Sponsorship Tiers"
            description="Manage sponsorship packages and benefits."
        />
        <Button onClick={handleAddTier}>Add Tier</Button>
      </div>
      
      <div className="px-4">
        <EventSponsorshipTiersTable data={tiers} onAddTier={handleAddTier} />
      </div>
    </div>
  );
}
