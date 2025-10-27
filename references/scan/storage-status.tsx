/**
 * Storage Status Component
 * Displays offline data storage status for scan feature
 * Syncs events and tickets from backend for offline scanning
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpcClient } from "@/utils/trpc";
import { STORAGE_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";

interface StorageData {
	events: number;
	tickets: number;
	lastSyncedAt?: Date;
}

interface OfflineEvent {
	id: number;
	title: string;
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
			const lastSynced = localStorage.getItem(STORAGE_CONFIG.OFFLINE_LAST_SYNCED_KEY);

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
			toast.info("Syncing data...", { description: "Fetching events and tickets" });

			// Fetch all events and tickets for offline use
			const data = await trpcClient.event.ticket.getAllForOffline.query();

			// Map tickets to offline format
			const offlineTickets: OfflineTicket[] = data.tickets.map((ticket) => ({
				publicId: ticket.id,
				eventId: ticket.eventId!,
				eventName: ticket.eventName!,
				name: ticket.name,
				email: ticket.email,
				phone: ticket.phone,
				ticketTypeName: ticket.ticketTypeName,
				value: ticket.value,
				checkedIn: ticket.checkedIn,
				checkInAt: ticket.checkInAt,
			}));

			// Store in localStorage
			localStorage.setItem(STORAGE_CONFIG.OFFLINE_EVENTS_KEY, JSON.stringify(data.events));
			localStorage.setItem(STORAGE_CONFIG.OFFLINE_TICKETS_KEY, JSON.stringify(offlineTickets));
			localStorage.setItem(STORAGE_CONFIG.OFFLINE_LAST_SYNCED_KEY, new Date().toISOString());

			setStorageData({
				events: data.events.length,
				tickets: offlineTickets.length,
				lastSyncedAt: new Date(),
			});

			toast.success(SUCCESS_MESSAGES.DATA_SYNCED, {
				description: `${data.events.length} events, ${offlineTickets.length} tickets`,
			});
		} catch (error: any) {
			toast.error(ERROR_MESSAGES.SYNC_DATA_FAILED, {
				description: error.message || "Please check your connection",
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
							<RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
							Sync Data
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Events Card */}
					<div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
						<div className="p-3 rounded-lg bg-blue-500/10">
							<Database className="h-6 w-6 text-blue-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Downloaded Events
							</p>
							<p className="text-3xl font-bold tracking-tight">
								{storageData.events}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Total events stored
							</p>
						</div>
					</div>

					{/* Tickets Card */}
					<div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
						<div className="p-3 rounded-lg bg-green-500/10">
							<Database className="h-6 w-6 text-green-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Downloaded Tickets
							</p>
							<p className="text-3xl font-bold tracking-tight">
								{storageData.tickets}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Total tickets stored
							</p>
						</div>
					</div>
				</div>

				{/* Last Synced Info */}
				{storageData.lastSyncedAt && (
					<div className="mt-4 pt-4 border-t">
						<p className="text-xs text-muted-foreground">
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

