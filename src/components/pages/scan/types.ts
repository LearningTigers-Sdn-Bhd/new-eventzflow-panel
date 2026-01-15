/**
 * Scan Result Types
 * Type definitions for the unified scanning feature (tickets and visitors)
 */

import type { ScanType } from "@/lib/api/scan";

export interface ScanResult {
	scanId: string;
	timestamp: Date;
	status: "success" | "error" | "duplicate";
	message: string;
	type: ScanType;
	role?: string | null;
	name?: string;
	email?: string;
	phone?: string;
	eventName?: string;
	eventId?: number;
	checkedIn?: boolean;
	checkInAt?: string | null;
	ticketType?: string;
	ticketValue?: number;
	gender?: string;
	age?: number;
}

export type ScanStatus = ScanResult["status"];
export type FilterType = string;
export type TypeFilter = "all" | "ticket" | "visitor";
export type SortType = "newest" | "oldest" | "status";
