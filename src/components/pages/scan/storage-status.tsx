/**
 * Storage Status Component
 * Displays offline data storage status for scan feature
 * Syncs events and tickets from backend for offline scanning
 */

"use client";

import { Database, HardDrive, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	type Indicator,
	ProgressStatsCard,
} from "@/components/admin-ui/analytic/stats-card";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { Button } from "@/components/ui/button";
import { getAllForOffline } from "@/lib/api/ticket";
import { ERROR_MESSAGES, STORAGE_CONFIG, SUCCESS_MESSAGES } from "./constants";

interface StorageData {
	events: number;
	tickets: number;
	lastSyncedAt?: Date;
}

interface OfflineTicket {
	publicId: string;
	eventId: number;
	eventName: string;
	name: string;
	email: string;
	phone: string;
	ticketTypeName?: string;
	value: number;
	checkedIn?: boolean;
	checkInAt?: string | null;
}

export function StorageStatus() {
	const [storageData, setStorageData] = useState<StorageData>({
		events: 0,
		tickets: 0,
	});
	const [isSyncing, setIsSyncing] = useState(false);
	const [isClearing, setIsClearing] = useState(false);

	/**
	 * Load storage data from localStorage on mount
	 */
	useEffect(() => {
		if (typeof window !== "undefined") {
			const events = localStorage.getItem(STORAGE_CONFIG.OFFLINE_EVENTS_KEY);
			const tickets = localStorage.getItem(STORAGE_CONFIG.OFFLINE_TICKETS_KEY);
			const lastSynced = localStorage.getItem(
				STORAGE_CONFIG.OFFLINE_LAST_SYNCED_KEY,
			);

			setStorageData({
				events: events ? JSON.parse(events).length : 0,
				tickets: tickets ? JSON.parse(tickets).length : 0,
				lastSyncedAt: lastSynced ? new Date(lastSynced) : undefined,
			});
		}
	}, []);

	/**
	 * Sync data from server to localStorage
	 * Fetches all events and their tickets for offline scanning
	 */
	const handleSyncData = async () => {
		setIsSyncing(true);
		try {
			toast.info("Syncing data...", {
				description: "Fetching events and tickets",
			});

			// Fetch all events and tickets for offline use using REST API
			const data = await getAllForOffline();

			// Map tickets to offline format
			const offlineTickets: OfflineTicket[] = data.tickets.map((ticket) => ({
				publicId: ticket.publicId,
				eventId: ticket.eventId,
				eventName: ticket.eventName,
				name: ticket.name,
				email: ticket.email,
				phone: ticket.phone,
				ticketTypeName: ticket.ticketTypeName,
				value: ticket.value,
				checkedIn: ticket.checkedIn,
				checkInAt: ticket.checkInAt,
			}));

			// Store in localStorage
			localStorage.setItem(
				STORAGE_CONFIG.OFFLINE_EVENTS_KEY,
				JSON.stringify(data.events),
			);
			localStorage.setItem(
				STORAGE_CONFIG.OFFLINE_TICKETS_KEY,
				JSON.stringify(offlineTickets),
			);
			localStorage.setItem(
				STORAGE_CONFIG.OFFLINE_LAST_SYNCED_KEY,
				new Date().toISOString(),
			);

			setStorageData({
				events: data.events.length,
				tickets: offlineTickets.length,
				lastSyncedAt: new Date(),
			});

			toast.success(SUCCESS_MESSAGES.DATA_SYNCED, {
				description: `${data.events.length} events, ${offlineTickets.length} tickets`,
			});
		} catch (error: unknown) {
			toast.error(ERROR_MESSAGES.SYNC_DATA_FAILED, {
				description:
					error instanceof Error
						? error.message
						: "Please check your connection",
			});
			console.error("Sync error:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	/**
	 * Clear all offline data
	 */
	const handleClearData = () => {
		setIsClearing(true);
		try {
			// Clear localStorage
			localStorage.removeItem(STORAGE_CONFIG.OFFLINE_EVENTS_KEY);
			localStorage.removeItem(STORAGE_CONFIG.OFFLINE_TICKETS_KEY);
			localStorage.removeItem(STORAGE_CONFIG.OFFLINE_LAST_SYNCED_KEY);

			setStorageData({
				events: 0,
				tickets: 0,
				lastSyncedAt: undefined,
			});

			toast.info(SUCCESS_MESSAGES.DATA_CLEARED);
		} catch (error) {
			toast.error(ERROR_MESSAGES.CLEAR_DATA_FAILED);
			console.error("Clear error:", error);
		} finally {
			setIsClearing(false);
		}
	};

	return (
		<div className="flex h-full flex-col border md:border-0">
			{/* Header */}
			<div className="flex flex-col gap-4 pb-4">
				<div className="w-full">
					<IconTitle
						icon={HardDrive}
						title="Scan Data Storage"
						description="Manage downloaded data for offline ticket scanning"
					/>
				</div>

				{/* Quick Actions */}
				<div className="grid w-full grid-cols-2 gap-2">
					<Button
						onClick={handleClearData}
						variant="destructive"
						size="sm"
						disabled={isClearing || storageData.events === 0}
						className="gap-2 rounded-none py-6 md:py-0"
					>
						<Trash2 className="mr-2.5 size-4" />
						Clear Data
					</Button>
					<Button
						onClick={handleSyncData}
						size="sm"
						disabled={isSyncing}
						className="gap-2 rounded-none py-6 md:py-0"
					>
						<RefreshCw
							className={`mr-2.5 size-4 ${isSyncing ? "animate-spin" : ""}`}
						/>
						Sync Data
					</Button>
				</div>
			</div>
			<div className="h-full border-b border-dashed">
				<ProgressStatsCard
					data={{
						icon: Database,
						title: "Downloaded Data",
						subtitle: `Total events and tickets stored offline. ${storageData.lastSyncedAt ? `Last synced: ${storageData.lastSyncedAt?.toLocaleString()}` : ""}`,
						indicators: [
							{
								label: "Events",
								count: storageData.events,
								color: "blue",
							},
							{
								label: "Tickets",
								count: storageData.tickets,
								color: "green",
							},
						] satisfies Indicator[],
					}}
				/>
			</div>
		</div>
	);
}
