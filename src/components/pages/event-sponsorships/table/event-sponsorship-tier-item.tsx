"use client";

import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { TierActionMenu } from "./tier-action-menu";

interface EventSponsorshipTierItemProps {
  tier: EventSponsorshipTier;
}

export function EventSponsorshipTierItem({ tier }: EventSponsorshipTierItemProps) {
  const price = parseFloat(tier.suggested_value || "0");

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold leading-none">{tier.name}</h3>
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                    {tier.currency_default} {price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                    • {tier.capacity ? `${tier.capacity} spots` : "Unlimited"}
                </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="capitalize">
                {tier.sponsorship_type_default.replace("_", " ")}
            </Badge>
            <TierActionMenu tier={tier} />
        </div>
      </CardContent>
    </Card>
  );
}
