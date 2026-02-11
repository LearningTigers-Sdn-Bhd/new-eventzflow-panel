import type { TicketTypeMapKey } from "@/lib/constants/public-registration";
import type { PublicTicketTypeItem } from "./types";

export type TicketTypeMap = Partial<Record<TicketTypeMapKey, PublicTicketTypeItem>>;

function toKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function buildTicketTypeMap(ticketTypes: PublicTicketTypeItem[]): TicketTypeMap {
  const map: TicketTypeMap = {};

  for (const item of ticketTypes) {
    const key = toKey(item.name);

    if (key.includes("visitor")) {
      map.visitor = map.visitor ?? item;
      continue;
    }

    if (key.includes("golf")) {
      map.golf = map.golf ?? item;
      continue;
    }

    if (!key.includes("conference")) {
      continue;
    }

    if (key.includes("member") || key.includes("sogsc") || key.includes("pkpbs")) {
      map.conference_member = map.conference_member ?? item;
      continue;
    }

    if (key.includes("international")) {
      map.conference_international = map.conference_international ?? item;
      continue;
    }

    if (key.includes("group")) {
      map.conference_group = map.conference_group ?? item;
      continue;
    }

    map.conference_individual = map.conference_individual ?? item;
  }

  return map;
}

export function resolveTicketTypeId(
  mode: "conference" | "visitor" | "golf",
  conferenceKind: "individual" | "member" | "international" | "group",
  map: TicketTypeMap,
) {
  if (mode === "visitor") {
    if (!map.visitor) {
      throw new Error("Visitor ticket type is not configured for this event.");
    }
    return map.visitor.id;
  }

  if (mode === "golf") {
    if (!map.golf) {
      throw new Error("Golf ticket type is not configured for this event.");
    }
    return map.golf.id;
  }

  const conferenceKey = `conference_${conferenceKind}` as const;
  const conferenceType = map[conferenceKey];
  if (!conferenceType) {
    throw new Error(
      `Conference ticket type for '${conferenceKind}' is not configured for this event.`,
    );
  }

  return conferenceType.id;
}
