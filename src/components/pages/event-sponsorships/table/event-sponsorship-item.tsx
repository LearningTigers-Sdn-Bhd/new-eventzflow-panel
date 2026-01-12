"use client";

import { Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import { SponsorshipActionMenu } from "./sponsorship-action-menu";

interface EventSponsorshipItemProps {
  sponsorship: EventSponsorship;
}

export function EventSponsorshipItem({ sponsorship }: EventSponsorshipItemProps) {
  const status = sponsorship.status;
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  let className = "capitalize";

  if (status === "received") {
      variant = "default";
      className += " bg-emerald-600 hover:bg-emerald-700";
  } else if (status === "partially_received") {
      variant = "secondary";
      className += " bg-amber-100 text-amber-800 hover:bg-amber-200";
  } else if (status === "cancelled") {
      variant = "destructive";
  }

  const total = parseFloat(sponsorship.total_sponsor_amount || "0");
  const received = parseFloat(sponsorship.received_total || "0");

  return (
    <Card>
        <CardContent className="flex items-start justify-between p-4">
            <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Handshake className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
                <a 
                  href={`/event/${sponsorship.event_id}/sponsorships/${sponsorship.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold leading-none hover:underline text-primary block"
                >
                  {sponsorship.title}
                </a>
                <p className="text-sm text-muted-foreground">{sponsorship.sponsor?.name}</p>
                {sponsorship.tier_name_snapshot && (
                <Badge variant="outline" className="mt-1">{sponsorship.tier_name_snapshot}</Badge>
                )}
                <div className="mt-2 text-sm">
                <span className="font-medium">{sponsorship.currency} {total.toLocaleString()}</span>
                {received > 0 && (
                    <span className="text-muted-foreground ml-2 text-xs">
                        (Received: {received.toLocaleString()})
                    </span>
                )}
                </div>
            </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge variant={variant} className={className}>
                    {status.replace("_", " ")}
                </Badge>
                <SponsorshipActionMenu sponsorship={sponsorship} />
            </div>
        </CardContent>
    </Card>
  );
}