/**
 * Storage Status Component
 * Displays offline data storage status for scan feature
 * Syncs events and tickets from backend for offline scanning
 */

"use client";

import { Database, HardDrive, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatsCard } from "@/components/analytics-card";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
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
		<div>
			{/* Header */}
			<div className="page-header mb-4 border-y border-dashed sm:mb-6 md:mb-8">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={HardDrive}
						title="Scan Data Storage"
						description="Manage downloaded data for offline ticket scanning"
					/>
				</div>

				{/* Quick Actions */}
				<div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:px-4">
					<Button
						onClick={handleClearData}
						variant="outline"
						size="sm"
						disabled={isClearing || storageData.events === 0}
						className="gap-2 rounded-none"
					>
						<Trash2 className="h-4 w-4" />
						Clear Data
					</Button>
					<Button
						onClick={handleSyncData}
						size="sm"
						disabled={isSyncing}
						className="gap-2 rounded-none"
					>
						<RefreshCw
							className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
						/>
						Sync Data
					</Button>
				</div>
			</div>
			{/* <div className="page-header border-y border-dashed">
				<div className="flex w-full flex-col items-start justify-between px-2 md:flex-row md:items-center md:px-4">
					<IconTitle
						icon={HardDrive}
						title="Scan Data Storage"
						description="Manage downloaded data for offline ticket scanning"
					/>
					<div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
						<Button
							onClick={handleClearData}
							variant="outline"
							size="sm"
							disabled={isClearing || storageData.events === 0}
							className="gap-2 rounded-none"
						>
							<Trash2 className="h-4 w-4" />
							Clear Data
						</Button>
						<Button
							onClick={handleSyncData}
							size="sm"
							disabled={isSyncing}
							className="gap-2 rounded-none"
						>
							<RefreshCw
								className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
							/>
							Sync Data
						</Button>
					</div>
				</div>
			</div> */}
			<div className="grid h-full grid-cols-2 gap-2 border-b border-dashed">
				<StatsCard
					label="Downloaded Events"
					value={storageData.events}
					Icon={Database}
					subtitle="Total events stored"
				/>
				<StatsCard
					label="Downloaded Tickets"
					value={storageData.tickets}
					Icon={Database}
					subtitle="Total tickets stored"
				/>
			</div>

			{/* Last Synced Info */}
			{storageData.lastSyncedAt && (
				<div className="border-b border-dashed p-4">
					<p className="text-muted-foreground text-xs">
						Last synced:{" "}
						<span className="font-medium text-foreground">
							{storageData.lastSyncedAt.toLocaleString()}
						</span>
					</p>
				</div>
			)}
		</div>
	);
}
