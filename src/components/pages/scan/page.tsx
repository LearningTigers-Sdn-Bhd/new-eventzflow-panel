"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useScanHistory } from "@/hooks/use-scan-history";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { ActivityFeed } from "./activity-feed";
import { UI_TIMING } from "./constants";
import { ScannerCard } from "./scanner-card";
import { StatsGrid } from "./stats-grid";
import { StorageStatus } from "./storage-status";
import type { FilterType, ScanResult, SortType } from "./types";
import { exportToCSV } from "./utils";

export default function ScanContent() {
	const [isScanning, setIsScanning] = useState(false);
	const { scanResults, isLoading, addScanResult } = useScanHistory();
	// Ticket validation hook is used by scanner-card component
	useTicketValidation();
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
					.map((r) => r.ticketId.toLowerCase()),
			);
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

			// State is managed via ref for immediate updates
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

	return (
		<div className="mx-auto p-2">
			{/* Header */}
			<div className="mb-4 sm:mb-6 md:mb-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<div>
						<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
							Ticket Scanner
						</h1>
						<p className="mt-1 text-muted-foreground text-sm sm:text-base">
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
								className="flex-1 gap-2 sm:flex-none"
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
			isLoading={isLoading}
			onSearchChange={setSearchQuery}
			onFilterChange={setFilterType}
			onSortChange={setSortType}
			onExport={handleExport}
		/>
		</div>
	);
}
