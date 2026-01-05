"use client";

import { AlertCircle, CheckCircle2, FileSpreadsheet, Info, Upload } from "lucide-react";
import { use, useMemo, useState } from "react";
import { EmptyState } from "@/components/data-state";
import { ImportedItem } from "@/components/pages/import/imported-item";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type FilterType, useImportResults } from "@/hooks/use-import-results";
import { EventImportVisitorsForm } from "@/components/pages/import/event-import-visitors-form";

export default function ImportVisitorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	const [currentPage, setCurrentPage] = useState(0);
	const [itemsPerPage] = useState(10);
	const [isGuideOpen, setIsGuideOpen] = useState(false);
	const {
		liveResult,
		setLiveResult,
		filterType,
		setFilterType,
		filteredItems,
	} = useImportResults();

	// Handle filter change and reset page
	const handleFilterChange = (value: FilterType) => {
		setFilterType(value);
		setCurrentPage(0);
	};

	// Calculate pagination
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const paginatedItems = useMemo(() => {
		const startIndex = currentPage * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredItems.slice(startIndex, endIndex);
	}, [filteredItems, currentPage, itemsPerPage]);

	// Generate page numbers for select dropdown (1-indexed)
	const pageNumbers = useMemo(() => {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}, [totalPages]);

	return (
		<div className="p-0">
			{/* Import Guidelines - Collapsible */}
			<Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
				<CollapsibleTrigger asChild>
					<div className="flex cursor-pointer items-center justify-between border border-dashed bg-muted/30 p-4 hover:bg-muted/50">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
								<FileSpreadsheet className="h-4 w-4 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-sm">Import Guidelines</h3>
								<p className="text-muted-foreground text-xs">
									Click to {isGuideOpen ? "hide" : "view"} step-by-step instructions for importing visitors
								</p>
							</div>
						</div>
						<Button variant="ghost" size="sm" className="rounded-none border">
							{isGuideOpen ? "Hide" : "Show"} Guide
						</Button>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="space-y-4 border-x border-dashed bg-muted/20 p-4">
						{/* Step 1: Download Template */}
						<div className="flex gap-3">
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
								1
							</div>
							<div>
								<h4 className="font-medium text-sm">Download the Template</h4>
								<p className="text-muted-foreground text-xs mt-1">
									Click the "Download Template" button to get an Excel file with the correct column headers.
									The template includes pre-filled event title and any custom fields configured for this event.
								</p>
							</div>
						</div>

						{/* Step 2: Fill in Data */}
						<div className="flex gap-3">
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
								2
							</div>
							<div>
								<h4 className="font-medium text-sm">Fill in Visitor Data</h4>
								<p className="text-muted-foreground text-xs mt-1">
									Add your visitor information to the template. Required and optional columns:
								</p>
								<div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
									<div className="rounded border bg-background p-2">
										<p className="font-medium text-xs text-green-600">Required</p>
										<ul className="mt-1 space-y-0.5 text-muted-foreground text-xs">
											<li className="flex items-center gap-1">
												<CheckCircle2 className="h-3 w-3 text-green-600" />
												Full Name
											</li>
											<li className="flex items-center gap-1">
												<CheckCircle2 className="h-3 w-3 text-green-600" />
												Event Title (must match exactly)
											</li>
										</ul>
									</div>
									<div className="rounded border bg-background p-2">
										<p className="font-medium text-xs text-blue-600">Optional</p>
										<ul className="mt-1 space-y-0.5 text-muted-foreground text-xs">
											<li>Email (recommended for duplicate detection)</li>
											<li>Phone</li>
											<li>Gender</li>
											<li>Age</li>
											<li>Custom fields (if configured)</li>
										</ul>
									</div>
								</div>
							</div>
						</div>

						{/* Step 3: Upload */}
						<div className="flex gap-3">
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
								3
							</div>
							<div>
								<h4 className="font-medium text-sm">Upload and Import</h4>
								<p className="text-muted-foreground text-xs mt-1">
									Drag and drop your file or click to browse. Supported formats: .xlsx, .xls, .csv (max 10MB).
									Click "Import Visitors" to process the file.
								</p>
							</div>
						</div>

						{/* Tips */}
						<div className="rounded border border-amber-500/30 bg-amber-500/5 p-3">
							<h4 className="flex items-center gap-2 font-medium text-amber-700 text-sm dark:text-amber-400">
								<AlertCircle className="h-4 w-4" />
								Tips for Successful Import
							</h4>
							<ul className="mt-2 space-y-1 text-muted-foreground text-xs">
								<li>• Keep the header row exactly as provided in the template</li>
								<li>• Event Title must match your event name exactly (case-sensitive)</li>
								<li>• Provide email or phone for better duplicate detection</li>
								<li>• Matching visitors will be updated with new data (including name)</li>
								<li>• Check the "Import Results" section after upload to see details</li>
							</ul>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>

			<Banner
				title="Duplicate Detection"
				description="Visitors are matched by: 1) Email (if provided), 2) Phone (if provided), 3) Name (as fallback). Two visitors with the same name but different emails are treated as different people."
				leadingIcon={<AlertCircle />}
				onCloser={true}
				className="border-amber-500/20 bg-amber-500/5 [&_div:first-child]:border-amber-500/30 [&_div:first-child]:bg-amber-500/10"
			/>

			<div className="grid min-h-[65vh] grid-cols-1 gap-8 divide-x-0 divide-dashed border-t border-dashed pt-6 lg:grid-cols-2 lg:gap-0 lg:divide-x">
				<div className="col-span-1 mb-8 flex flex-col border-y border-dashed">
					<div className="flex items-center gap-2 border-b border-dashed p-2 md:p-4">
						<Upload className="h-5 w-5 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-sm">Upload Visitors File</h3>
							<p className="text-muted-foreground text-xs">
								Upload your visitors data from an XLSX or CSV file.
							</p>
						</div>
					</div>
					<EventImportVisitorsForm eventId={eventId} onResult={setLiveResult} />
				</div>
				<div className="col-span-1 mb-8 flex flex-col border-y border-dashed">
					<div className="flex items-center gap-2 border-b border-dashed p-2 md:p-4">
						<Info className="h-5 w-5 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-sm">Import Results</h3>
							<p className="text-muted-foreground text-xs">
								View the results of your import.
							</p>
						</div>
					</div>
					<div className="border-b border-dashed p-2 md:p-4">
						<Select
							value={filterType}
							onValueChange={(value) => handleFilterChange(value as FilterType)}
							disabled={!liveResult}
						>
							<SelectTrigger className="w-full rounded-none border md:w-auto">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								<SelectItem className="rounded-none" value="all">
									All Results
								</SelectItem>
								<SelectItem className="rounded-none" value="created">
									Created
								</SelectItem>
								<SelectItem className="rounded-none" value="updated">
									Updated
								</SelectItem>
								<SelectItem className="rounded-none" value="skipped">
									Skipped
								</SelectItem>
								<SelectItem className="rounded-none" value="errors">
									Errors
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-0">
						{!liveResult ? (
							<EmptyState
								title="No import results"
								description="Upload and import a file to see results here."
								height="h-auto"
								className="min-h-[200px]"
							/>
						) : filteredItems.length === 0 ? (
							<EmptyState
								title="No items found"
								description={`No ${filterType === "all" ? "" : filterType} items match the current filter.`}
								height="h-auto"
								className="min-h-[200px]"
							/>
						) : (
							<>
								<div className="max-h-[calc(100vh-500px)] overflow-y-auto bg-muted/30 p-2 md:p-4">
									<div className="grid grid-cols-1 gap-2">
										{paginatedItems.map((item, index) => (
											<ImportedItem
												key={`${item.category}-${index}`}
												item={item.data}
												category={item.category}
											/>
										))}
									</div>
								</div>
								{totalPages > 1 && (
									<div className="flex flex-col items-center justify-center gap-4 border-t border-dashed p-2 md:p-4 lg:flex-row">
										<div className="flex-1 text-muted-foreground text-sm">
											{filteredItems.length} item(s) total.
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												className="rounded-none"
												onClick={() =>
													setCurrentPage((prev) => Math.max(0, prev - 1))
												}
												disabled={currentPage === 0}
											>
												Previous
											</Button>
											<Select
												value={(currentPage + 1).toString()}
												onValueChange={(value) =>
													setCurrentPage(Number.parseInt(value, 10) - 1)
												}
											>
												<SelectTrigger className="w-auto min-w-[100px] rounded-none border">
													<SelectValue placeholder="Select page" />
												</SelectTrigger>
												<SelectContent className="h-[250px] rounded-none">
													{pageNumbers.map((page) => (
														<SelectItem
															className="rounded-none"
															key={page}
															value={page.toString()}
														>
															Page {page}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Button
												variant="outline"
												className="rounded-none"
												size="sm"
												onClick={() =>
													setCurrentPage((prev) =>
														Math.min(totalPages - 1, prev + 1),
													)
												}
												disabled={currentPage >= totalPages - 1}
											>
												Next
											</Button>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
