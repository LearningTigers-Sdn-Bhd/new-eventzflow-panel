"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { ScanResult, FilterType, SortType } from "./types";
import { ScannerCard } from "./scanner-card";
import { StatsGrid } from "./stats-grid";
import { ActivityFeed } from "./activity-feed";
import { StorageStatus } from "./storage-status";
import { exportToCSV } from "./utils";
import { useScanHistory } from "@/hooks/use-scan-history";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { UI_TIMING, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";

export default function ScanContent() {
	const [isScanning, setIsScanning] = useState(false);
	const { scanResults, isLoading, addScanResult, clearHistory } = useScanHistory();
	const { isOnline, hasOfflineData } = useTicketValidation();
	const [scannedTicketIds, setScannedTicketIds] = useState<Set<string>>(new Set());
	// Use ref to track scanned IDs immediately without waiting for React re-render
	const scannedTicketIdsRef = useRef<Set<string>>(new Set());
	const [recentScan, setRecentScan] = useState<ScanResult | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [sortType, setSortType] = useState<SortType>("oldest");
	
	/**
	 * Rebuild scannedTicketIds set from loaded history
	 */
	useEffect(() => {
		if (!isLoading) {
			const successfulIds = new Set(
				scanResults
					.filter((r) => r.status === "success")
					.map((r) => r.ticketId.toLowerCase())
			);
			setScannedTicketIds(successfulIds);
			scannedTicketIdsRef.current = successfulIds;
		}
	}, [scanResults, isLoading]);
	
	// Keep last N scans for the recent panel
	const recentScans = scanResults.slice(0, UI_TIMING.MAX_RECENT_SCANS);

	/**
	 * Handle scan result from scanner
	 */
	const handleScanResult = (result: ScanResult) => {
		// Add to persistent storage
		addScanResult(result);
		
		// Add ticket ID to the ref AND state if it's a successful scan (not duplicate or error)
		if (result.status === "success") {
			const normalizedId = result.ticketId.toLowerCase();
			
			// Update ref immediately (synchronous)
			scannedTicketIdsRef.current.add(normalizedId);
			
			// Also update state for UI consistency
			setScannedTicketIds((prev) => {
				const newSet = new Set(prev);
				newSet.add(normalizedId);
				return newSet;
			});
		}
		
		// Highlight recent scan temporarily
		setRecentScan(result);
		setTimeout(() => setRecentScan(null), UI_TIMING.RECENT_SCAN_DISPLAY_MS);
	};

	/**
	 * Export scan results to CSV
	 */
	const handleExport = () => {
		exportToCSV(scanResults);
	};

	/**
	 * Clear local scan history
	 * Note: Backend scanned tickets cannot be cleared as they represent actual check-ins
	 */
	const handleClearAll = () => {
		clearHistory(); // Only clears local scans from this session
		// Note: We don't clear scannedTicketIds because backend tickets should still prevent duplicates
		setRecentScan(null);
		setSearchQuery("");
		setFilterType("all");
		toast.info("Local scan history cleared");
	};

	return (
		<div className="p-2 mx-auto">
			{/* Header */}
			<div className="mb-4 sm:mb-6 md:mb-8">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
					<div>
						<h1 className="font-bold text-2xl sm:text-3xl tracking-tight">Ticket Scanner</h1>
						<p className="text-sm sm:text-base text-muted-foreground mt-1">
							Scan and validate event tickets instantly
						</p>
					</div>

					{/* Quick Actions */}
					{scanResults.length > 0 && (
						<div className="flex items-center gap-2">
							<Button
								onClick={handleExport}
								variant="outline"
								size="sm"
								className="gap-2 flex-1 sm:flex-none"
							>
								<Download className="h-4 w-4" />
								<span>Export</span>
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Storage Status Section */}
			<div className="mb-4 sm:mb-6">
				<StorageStatus />
			</div>

			{/* Scanner Section - Hero Element */}
			<div className="mb-4 sm:mb-6">
				<ScannerCard
					isScanning={isScanning}
					onScanningChange={setIsScanning}
					onScanResult={handleScanResult}
					scannedTicketIds={scannedTicketIdsRef.current}
					recentScans={recentScans}
				/>
			</div>

			{/* Statistics Bar */}
			{scanResults.length > 0 && (
				<div className="mb-4 sm:mb-6">
					<StatsGrid scanResults={scanResults} />
				</div>
			)}

			{/* Activity Feed - Full Width */}
			<ActivityFeed
				scanResults={scanResults}
				recentScan={recentScan}
				searchQuery={searchQuery}
				filterType={filterType}
				sortType={sortType}
				onSearchChange={setSearchQuery}
				onFilterChange={setFilterType}
				onSortChange={setSortType}
				onExport={handleExport}
			/>
		</div>
	);
}
