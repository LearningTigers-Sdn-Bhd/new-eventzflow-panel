"use client";

import type { Sponsor } from "@/lib/api/sponsorship/response";
import { DataTable } from "./table/sponsors-table";

interface SponsorsListViewProps {
  sponsors: Sponsor[];
  onAddSponsor?: () => void;
}

export default function SponsorsListView({ sponsors, onAddSponsor }: SponsorsListViewProps) {
  // Sort alphabetically by name
  const sortedSponsors = [...sponsors].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <DataTable data={sortedSponsors} onAddSponsor={onAddSponsor} />
  );
}
