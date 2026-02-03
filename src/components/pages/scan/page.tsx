"use client";

import { ChevronDown, Download, ScanLine, ScanQrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScanHistory } from "@/hooks/use-scan-history";
import { ActivityFeed } from "./activity-feed";
import { UI_TIMING } from "./constants";
import { ScannerCard } from "./cards/scanner-card";
import { StatsGrid } from "./cards/stats-grid";
import { StorageStatus } from "./cards/storage-status";
import type { FilterType, ScanResult, SortType, TypeFilter, StatusFilter } from "./types";
import { exportToCSV } from "./utils";

export default function ScanContent() {
	const isMobile = useIsMobile();
	const [isScanning, setIsScanning] = useState(false);
	const { scanResults, isLoading, addScanResult } = useScanHistory();
	// Use ref to track scanned IDs immediately without waiting for React re-render
	const scannedTicketIdsRef = useRef<Set<string>>(new Set());
	const [recentScan, setRecentScan] = useState<ScanResult | null>(null);
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortType, setSortType] = useState<SortType>("newest");

	/**
	 * Rebuild scannedTicketIds set from loaded history
	 */
	useEffect(() => {
		if (!isLoading) {
			const successfulIds = new Set(
				scanResults
					.filter((r) => r.status === "success")
					.map((r) => r.scanId.toLowerCase()),
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

		// Add ID to the ref if it's a successful scan (not duplicate or error)
		if (result.status === "success") {
			const normalizedId = result.scanId.toLowerCase();

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
				<div className="w-full px-0 md:w-auto md:px-4">
					<IconTitle
						icon={ScanQrCode}
						title="Ticket Scanner"
						description="Scan and validate event tickets instantly"
					/>
				</div>

				{/* Quick Actions */}
				{scanResults.length > 0 && (
					<div className="flex w-full flex-col items-center justify-center px-0 md:w-auto md:px-4">
						<Button
							onClick={handleExport}
							variant="outline"
							size="sm"
							className="w-full gap-2 rounded-none bg-sky-500 py-6 text-white hover:bg-sky-500/90 md:py-0 md:text-sm md:tracking-tight"
						>
							<Download className="mr-2.5 size-4" />
							<span>Export {isMobile ? "Logs" : ""}</span>
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
			{isMobile ? (
				<Collapsible className="mb-4 w-full">
					<CollapsibleTrigger asChild>
						<Button
							variant="outline"
							className="mt-8 mb-4 w-full rounded-none border-foreground/50 py-6"
						>
							Show Scan Statistics
							<ChevronDown className="mr-2.5 size-4" />
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="border border-foreground/50 bg-background py-4 ps-4 pe-1">
						<Carousel className="w-full pb-4">
							<CarouselContent>
								<CarouselItem className="basis-[80%]">
									<div className="h-full">
										<StorageStatus />
									</div>
								</CarouselItem>
								<CarouselItem className="basis-3/4">
									{scanResults.length > 0 ? (
										<div className="h-full">
											<StatsGrid scanResults={scanResults} />
										</div>
									) : (
										<div className="flex flex-col items-center justify-center">
											<div className="border bg-muted p-2">
												<ScanLine className="size-16 text-muted-foreground/30" />
											</div>
											<h3 className="mb-2 font-bold text-lg">No Scans Yet</h3>
											<p className="max-w-xs text-muted-foreground text-sm">
												Scanned tickets will appear here in real-time
											</p>
										</div>
									)}
								</CarouselItem>
							</CarouselContent>
						</Carousel>
					</CollapsibleContent>
				</Collapsible>
			) : (
				<div className="grid grid-cols-2 gap-8 pb-4 md:pb-8">
					<div className="h-full">
						<StorageStatus />
					</div>

					{/* Statistics Bar */}
					{scanResults.length > 0 ? (
						<div className="h-full">
							<StatsGrid scanResults={scanResults} />
						</div>
					) : (
						<div className="flex flex-col items-center justify-center">
							<div className="border bg-muted p-2">
								<ScanLine className="size-16 text-muted-foreground/30" />
							</div>
							<h3 className="mb-2 font-bold text-lg">No Scans Yet</h3>
							<p className="max-w-xs text-muted-foreground text-sm">
								Scanned tickets will appear here in real-time
							</p>
						</div>
					)}
				</div>
			)}

			{/* Activity Feed - Full Width */}
			<ActivityFeed
				scanResults={scanResults}
				recentScan={recentScan}
				filterType={filterType}
				typeFilter={typeFilter}
				statusFilter={statusFilter}
				sortType={sortType}
				isLoading={isLoading}
				onFilterChange={setFilterType}
				onTypeFilterChange={setTypeFilter}
				onStatusFilterChange={setStatusFilter}
				onSortChange={setSortType}
			/>
		</div>
	);
}
