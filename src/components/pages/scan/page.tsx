"use client";

import { Download, ScanQrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
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
		<div className="p-0">
			{/* Header */}
			<div className="page-header mb-4 border-b border-dashed sm:mb-6 md:mb-8">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={ScanQrCode}
						title="Ticket Scanner"
						description="Scan and validate event tickets instantly"
					/>
				</div>

				{/* Quick Actions */}
				{scanResults.length > 0 && (
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleExport}
							variant="outline"
							size="sm"
							className="w-full gap-2 rounded-none"
						>
							<Download className="h-4 w-4" />
							<span>Export</span>
						</Button>
					</div>
				)}
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

			{/* Storage Status Section */}
			<div className="mt-4 mb-4 sm:mt-8 sm:mb-6">
				<StorageStatus />
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
