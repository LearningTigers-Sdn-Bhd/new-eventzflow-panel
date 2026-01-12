"use client";

import { Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Sponsor } from "@/lib/api/sponsorship/response";
// import { SponsorActionMenu } from "./action-menu";

interface SponsorItemProps {
  sponsor: Sponsor;
}

export function SponsorItem({ sponsor }: SponsorItemProps) {
  return (
    <a href={`/sponsors/${sponsor.id}`} className="block">
        <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="flex items-start justify-between p-4">
            <div className="flex gap-3">
            {sponsor.logo_path ? (
                <img
                src={sponsor.logo_path}
                alt={sponsor.name}
                className="h-10 w-10 rounded-full object-cover"
                />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Handshake className="h-5 w-5 text-primary" />
                </div>
            )}
            <div className="space-y-1">
                <h3 className="font-semibold leading-none">{sponsor.name}</h3>
                <p className="text-sm text-muted-foreground">{sponsor.industry}</p>
                {sponsor.default_email && (
                <p className="text-xs text-muted-foreground">
                    {sponsor.default_email}
                </p>
                )}
                <div className="mt-2">
                <Badge 
                    variant={sponsor.is_active ? "default" : "secondary"}
                    className={sponsor.is_active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                    {sponsor.is_active ? "Active" : "Inactive"}
                </Badge>
                </div>
            </div>
            </div>
        </CardContent>
        </Card>
    </a>
  );
}
