import { getEventVendors } from "@/lib/api/event-vendor/endpoints";
import type { EventVendor } from "@/lib/api/event-vendor/response";
import {
	getExhibitorKits,
	updateExhibitorKit,
} from "@/lib/api/exhibitor-kit/endpoints";
import { updateVendor } from "@/lib/api/vendor/endpoints";

const EXHIBITOR_EMAIL_TYPES = [
	"registration_received_email",
	"payment_confirmed_email",
];

export function isExhibitorEmail(emailType: string): boolean {
	return EXHIBITOR_EMAIL_TYPES.includes(emailType);
}

const same = (a?: string | null, b?: string | null) =>
	(a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

export interface ExhibitorEmailTargets {
	kitCount: number;
	/** The vendor account whose login email is the bounced address, if any. */
	vendor: EventVendor["vendor"] | null;
}

export function findExhibitorEmailTargets(
	vendors: EventVendor[],
	email: string,
): ExhibitorEmailTargets {
	const kitCount = vendors
		.flatMap((v) => v.exhibitor_kits)
		.filter((kit) => same(kit.pic_email_address, email)).length;
	const vendor = vendors.find((v) => same(v.vendor.email, email))?.vendor;
	return { kitCount, vendor: vendor ?? null };
}

/**
 * Exhibitor emails go to the kit's PIC email. The backend resend only corrects
 * ticket addresses, so fix the kit here, then resend without an email. The
 * vendor's login email is separate and only changed when asked.
 */
export async function fixExhibitorKitEmail(
	eventId: string,
	oldEmail: string,
	newEmail: string,
	{ vendorLogin }: { vendorLogin: boolean },
): Promise<void> {
	const id = Number(eventId);
	const next = newEmail.trim();
	// Vendor first: its email is unique, so a clash fails before kits change.
	if (vendorLogin) {
		const { vendor } = findExhibitorEmailTargets(
			await getEventVendors(id),
			oldEmail,
		);
		if (vendor) {
			await updateVendor({
				id: vendor.id,
				email: next,
				full_name: vendor.full_name,
				phone: vendor.phone,
			});
		}
	}
	const kits = await getExhibitorKits(id);
	const stale = kits.filter((kit) => same(kit.pic_email_address, oldEmail));
	if (stale.length === 0) {
		// Already fixed via a sibling email row for the same exhibitor.
		if (kits.some((kit) => same(kit.pic_email_address, next))) return;
		throw new Error("Couldn't find the exhibitor kit for this email.");
	}
	await Promise.all(
		stale.map((kit) =>
			updateExhibitorKit(id, kit.id, { pic_email_address: next }),
		),
	);
}
