"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import { SponsorshipActionMenu } from "./sponsorship-action-menu";

export const generateColumns = (): ColumnDef<EventSponsorship>[] => {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <a 
          href={`/event/${row.original.event_id}/sponsorships/${row.original.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline text-primary"
        >
          {row.original.title}
        </a>
      ),
    },
    {
      accessorKey: "sponsor.name",
      header: "Sponsor",
      cell: ({ row }) => {
        const logo = row.original.sponsor?.logo_path;
        return (
          <a 
            href={`/event/${row.original.event_id}/sponsorships/${row.original.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline group"
          >
            {logo ? (
              <img
                src={logo}
                alt={row.original.sponsor?.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Handshake className="h-3 w-3 text-primary" />
              </div>
            )}
            <span className="font-medium text-primary group-hover:text-primary/80 transition-colors">{row.original.sponsor?.name || "Unknown Sponsor"}</span>
          </a>
        );
      },
    },
    {
      accessorKey: "tier_name_snapshot",
      header: "Tier",
      cell: ({ row }) => row.original.tier_name_snapshot || (
        <span className="text-muted-foreground italic">None</span>
      ),
    },
    {
      id: "amount",
      header: "Amount (Received / Total)",
      cell: ({ row }) => {
        const total = parseFloat(row.original.total_sponsor_amount || "0");
        const received = parseFloat(row.original.received_total || "0");
        const currency = row.original.currency;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {currency} {total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              Received: {currency} {received.toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
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
            
        return (
          <Badge variant={variant} className={className}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <SponsorshipActionMenu sponsorship={row.original} />,
    },
  ];
};