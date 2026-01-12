"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Sponsor } from "@/lib/api/sponsorship/response";
import { SponsorActionMenu } from "./sponsor-action-menu";

export const generateColumns = (): ColumnDef<Sponsor>[] => {
  return [
    {
      accessorKey: "name",
      header: "Sponsor Name",
      cell: ({ row }) => {
        const logo = row.original.logo_path;
        return (
          <a
            href={`/sponsors/${row.original.id}`}
            className="flex items-center gap-3 hover:underline group"
          >
            {logo ? (
              <img
                src={logo}
                alt={row.original.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Handshake className="h-4 w-4 text-primary" />
              </div>
            )}
            <span className="font-medium text-primary group-hover:text-primary/80 transition-colors">{row.original.name}</span>
          </a>
        );
      },
    },
    {
      accessorKey: "industry",
      header: "Industry",
      cell: ({ row }) => row.original.industry || "-",
    },
    {
      accessorKey: "default_contact_name",
      header: "Contact Person",
      cell: ({ row }) => row.original.default_contact_name || "-",
    },
    {
      accessorKey: "default_email",
      header: "Email",
      cell: ({ row }) => row.original.default_email || "-",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
            variant={row.original.is_active ? "default" : "secondary"}
            className={row.original.is_active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => <SponsorActionMenu sponsor={row.original} />,
    },
  ];
};
