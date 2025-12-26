"use client";

import { AlertCircle, Import, Info, Ticket, Upload, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/data-state";
import { ImportFullForm } from "@/components/pages/import/import-full-form";
import { ImportedItem } from "@/components/pages/import/imported-item";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type FilterType, useImportResults } from "@/hooks/use-import-results";
import type { ImportType } from "@/lib/api/imports/types";

const IMPORT_OPTIONS = [
	{
		value: "tickets" as ImportType,
		label: "Tickets",
		description: "Import ticket holders and attendees",
		icon: Ticket,
	},
	{
		value: "visitors" as ImportType,
		label: "Visitors",
		description: "Import event visitors and guests",
		icon: Users,
	},
];

export default function ImportPage() {
	const [selectedImportType, setSelectedImportType] =
		useState<ImportType | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [itemsPerPage] = useState(10);
	const {
		liveResult,
		setLiveResult,
		filterType,
		setFilterType,
		filteredItems,
	} = useImportResults();

	const selectedOption = selectedImportType
		? IMPORT_OPTIONS.find((opt) => opt.value === selectedImportType)
		: null;

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

	// Show selection screen if no type selected
	if (!selectedImportType) {
		return (
			<div className="p-0">
				<div className="page-header">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Import}
							title="Import Data"
							description="Select the type of data you want to import."
						/>
					</div>
				</div>

				<Banner
					title="Import Guide"
					description="Choose an import type below, then upload your XLSX or CSV file to import data."
					leadingIcon={<Info />}
					onCloser={true}
				/>

				<div className="flex min-h-[60vh] items-center justify-center border-t border-dashed p-4 md:p-8">
					<div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
						{IMPORT_OPTIONS.map((option) => {
							const Icon = option.icon;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setSelectedImportType(option.value)}
									className="group flex flex-col items-center gap-4 rounded-none border-2 border-dashed border-muted-foreground/30 bg-background p-8 transition-all hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									<div className="rounded-full border-2 border-muted-foreground/30 p-4 transition-colors group-hover:border-primary group-hover:bg-primary/10">
										<Icon className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
									</div>
									<div className="space-y-1 text-center">
										<h3 className="font-semibold text-lg transition-colors group-hover:text-primary">
											{option.label}
										</h3>
										<p className="text-muted-foreground text-sm">
											{option.description}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	// Show import layout after selection
	return (
		<div className="p-0">
			<div className="page-header">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={selectedOption?.icon || Import}
						title={`Import ${selectedOption?.label} Data`}
						description={`Import ${selectedOption?.label.toLowerCase()} from a XLSX or CSV file.`}
					/>
				</div>
				<div className="w-full px-0 md:w-auto md:px-4">
					<Select
						value={selectedImportType}
						onValueChange={(value) => setSelectedImportType(value as ImportType)}
					>
						<SelectTrigger className="w-full rounded-none border md:w-auto">
							<SelectValue placeholder="Select import type" />
						</SelectTrigger>
						<SelectContent>
							{IMPORT_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<Banner
				title="Import Guide"
				description="You can import your data from a XLSX or CSV file. Only once is allowed for each import type."
				leadingIcon={<Info />}
				onCloser={true}
			/>

			{selectedImportType === "visitors" && (
				<Banner
					title="Duplicate Detection"
					description="Visitors are matched by: 1) Email (if provided), 2) Phone (if provided), 3) Name (as fallback). Two visitors with the same name but different emails are treated as different people."
					leadingIcon={<AlertCircle />}
					onCloser={true}
					className="border-amber-500/20 bg-amber-500/5 [&_div:first-child]:border-amber-500/30 [&_div:first-child]:bg-amber-500/10"
				/>
			)}

			<div className="grid min-h-[65vh] grid-cols-1 gap-8 divide-x-0 divide-dashed border-t border-dashed pt-6 lg:grid-cols-2 lg:gap-0 lg:divide-x">
				<div className="col-span-1 mb-8 flex flex-col border-y border-dashed">
					<div className="p-2 md:p-4">
						<IconTitle
							icon={Upload}
							title={`Upload ${selectedOption?.label} File`}
							description={`Upload your ${selectedOption?.label.toLowerCase()} data from a XLSX or CSV file.`}
						/>
					</div>
					<ImportFullForm
						key={selectedImportType}
						importType={selectedImportType}
						onResult={setLiveResult}
					/>
				</div>
				<div className="col-span-1 mb-8 flex flex-col border-y border-dashed">
					<div className="border-b border-dashed p-2 md:p-4">
						<IconTitle
							icon={Info}
							title="Import Results"
							description="View the results of your import."
						/>
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
