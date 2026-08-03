import type { EventVendor } from "@/lib/api/event-vendor";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";

export interface ExhibitorKitWithVendor {
	vendor: EventVendor;
	kit: ExhibitorKit;
}

export function flattenExhibitorKits(
	vendors: EventVendor[],
): ExhibitorKitWithVendor[] {
	return vendors.flatMap((vendor) =>
		vendor.exhibitor_kits.map((kit) => ({ vendor, kit })),
	);
}
