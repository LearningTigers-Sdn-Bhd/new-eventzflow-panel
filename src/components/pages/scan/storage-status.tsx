/**
 * Storage Status Component
 * Displays offline data storage status for scan feature
 * Syncs events and tickets from backend for offline scanning
 */

"use client";

import { Database, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle>Scan Data Storage</CardTitle>
						<CardDescription>
							Manage downloaded data for offline ticket scanning
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={handleClearData}
							variant="outline"
							size="sm"
							disabled={isClearing || storageData.events === 0}
							className="gap-2"
						>
							<Trash2 className="h-4 w-4" />
							Clear Data
						</Button>
						<Button
							onClick={handleSyncData}
							size="sm"
							disabled={isSyncing}
							className="gap-2"
						>
							<RefreshCw
								className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
							/>
							Sync Data
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{/* Events Card */}
					<div className="flex items-start gap-4 rounded-lg border bg-card p-4">
						<div className="rounded-lg bg-blue-500/10 p-3">
							<Database className="h-6 w-6 text-blue-500" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Downloaded Events
							</p>
							<p className="font-bold text-3xl tracking-tight">
								{storageData.events}
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Total events stored
							</p>
						</div>
					</div>

					{/* Tickets Card */}
					<div className="flex items-start gap-4 rounded-lg border bg-card p-4">
						<div className="rounded-lg bg-green-500/10 p-3">
							<Database className="h-6 w-6 text-green-500" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Downloaded Tickets
							</p>
							<p className="font-bold text-3xl tracking-tight">
								{storageData.tickets}
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Total tickets stored
							</p>
						</div>
					</div>
				</div>

				{/* Last Synced Info */}
				{storageData.lastSyncedAt && (
					<div className="mt-4 border-t pt-4">
						<p className="text-muted-foreground text-xs">
							Last synced:{" "}
							<span className="font-medium text-foreground">
								{storageData.lastSyncedAt.toLocaleString()}
							</span>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
