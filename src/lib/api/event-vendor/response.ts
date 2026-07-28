// Pure TypeScript types for API responses

import type { ExhibitorKit } from "../exhibitor-kit/response";

export interface EventVendor {
	id: number;
	event_id: number;
	vendor_id: number;
	type: "Exhibitor" | "Merchant";
	redirect_url: string | null;
	poster_url: string | null;
	qr_url: string | null;
	vendor: {
		id: number;
		email: string;
		full_name: string;
		phone?: string;
	};
	exhibitor_kits: ExhibitorKit[];
	created_at: string;
	updated_at: string;
}

export interface Exhibitor extends EventVendor {
	type: "Exhibitor";
	exhibitor_owner_id?: number;
	exhibitor_owner?: {
		id: number;
		name: string;
		email: string;
	};
}

export interface Merchant extends EventVendor {
	type: "Merchant";
}
