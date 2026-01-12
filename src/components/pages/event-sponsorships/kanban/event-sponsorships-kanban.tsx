"use client";

import { useMemo } from "react";
import type { EventSponsorship, EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { SponsorshipCard } from "./sponsorship-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface EventSponsorshipsKanbanProps {
  sponsorships: EventSponsorship[];
  tiers: EventSponsorshipTier[];
}

export default function EventSponsorshipsKanban({ sponsorships, tiers }: EventSponsorshipsKanbanProps) {
  
  const groupedSponsorships = useMemo(() => {
    const groups: Record<string, EventSponsorship[]> = {};
    
    // Initialize groups for all tiers
    tiers.forEach(tier => {
        groups[tier.id.toString()] = [];
    });
    
    // Initialize standalone group
    groups["standalone"] = [];

    // Distribute sponsorships
    sponsorships.forEach(sponsorship => {
        if (sponsorship.event_sponsorship_tier_id) {
            const tierId = sponsorship.event_sponsorship_tier_id.toString();
            if (groups[tierId]) {
                groups[tierId].push(sponsorship);
            } else {
                // Tier might have been deleted, fallback to standalone or specific 'Archived Tier' group
                // For now, standalone/other
                groups["standalone"].push(sponsorship);
            }
        } else {
            groups["standalone"].push(sponsorship);
        }
    });

    return groups;
  }, [sponsorships, tiers]);

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex gap-4">
        {/* Render columns for each Tier */}
        {tiers.map((tier) => (
            <div key={tier.id} className="w-72 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-semibold text-sm">{tier.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {groupedSponsorships[tier.id.toString()]?.length || 0}
                    </span>
                </div>
                <div className="flex flex-col gap-3 min-h-[200px] bg-muted/20 p-2 rounded-lg border border-dashed border-border/50">
                    {groupedSponsorships[tier.id.toString()]?.map(sponsorship => (
                        <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
                    ))}
                    {groupedSponsorships[tier.id.toString()]?.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/50 italic">
                            No sponsorships
                        </div>
                    )}
                </div>
            </div>
        ))}

        {/* Standalone Column */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm">Standalone</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {groupedSponsorships["standalone"]?.length || 0}
                </span>
            </div>
            <div className="flex flex-col gap-3 min-h-[200px] bg-muted/20 p-2 rounded-lg border border-dashed border-border/50">
                {groupedSponsorships["standalone"]?.map(sponsorship => (
                    <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
                ))}
                {groupedSponsorships["standalone"]?.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/50 italic">
                        No sponsorships
                    </div>
                )}
            </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
