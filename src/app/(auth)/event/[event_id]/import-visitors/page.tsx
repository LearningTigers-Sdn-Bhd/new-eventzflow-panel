"use client";

import { AlertCircle, Info } from "lucide-react";
import { use, useMemo, useState } from "react";
import { EmptyState } from "@/components/data-state";
import { ImportDataFlow } from "@/components/pages/import/import-data-flow";
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
import { type FilterType, useImportResults } from "@/hooks/use-import-results";

export default function ImportVisitorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	const [currentPage, setCurrentPage] = useState(0);
	const [itemsPerPage] = useState(10);
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
			<Banner
				title="Duplicate Detection"
				description="Visitors are matched by: 1) Email (if provided), 2) Phone (if provided), 3) Name (as fallback). Two visitors with the same name but different emails are treated as different people."
				leadingIcon={<AlertCircle />}
				onCloser={true}
				className="border-amber-500/20 bg-amber-500/5 [&_div:first-child]:border-amber-500/30 [&_div:first-child]:bg-amber-500/10"
			/>

			{/* Inline two-pane import flow: guidelines/steps left, preview right. */}
			<div className="flex min-h-[65vh] flex-col border-t border-dashed">
				<ImportDataFlow
					importType="visitors"
					lockedEventId={eventId}
					onImported={setLiveResult}
				/>
			</div>

			{/* Post-import results (from the last committed import). */}
			<div className="grid grid-cols-1 gap-8 border-t border-dashed pt-6">
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
