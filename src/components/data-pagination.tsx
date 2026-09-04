"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface DataPaginationProps<TData> {
	table: Table<TData>;
	// Server-paginated tables only hold one page of rows, so the derived
	// `rows.length` undercounts. Pass the real total from the server to label
	// the footer correctly ("N row(s) total").
	totalRows?: number;
}

export function DataPagination<TData>({
	table,
	totalRows,
}: DataPaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex;
	const pageCount = table.getPageCount();

	const getPageNumbers = () => {
		if (pageCount <= 7) {
			return Array.from({ length: pageCount }, (_, i) => i);
		}

		const nums = new Set<number>();
		nums.add(0);
		nums.add(pageCount - 1);

		if (currentPage <= 2) {
			const firstWindow = [1, 2, 3];
			for (const n of firstWindow) {
				if (n < pageCount - 1) nums.add(n);
			}
		} else if (currentPage >= pageCount - 3) {
			const lastWindow = [pageCount - 4, pageCount - 3, pageCount - 2];
			for (const n of lastWindow) {
				if (n > 0 && n < pageCount - 1) nums.add(n);
			}
		} else {
			const midWindow = [currentPage - 1, currentPage, currentPage + 1];
			for (const n of midWindow) {
				if (n > 0 && n < pageCount - 1) nums.add(n);
			}
		}

		const sorted = Array.from(nums).sort((a, b) => a - b);
		const result: (number | string)[] = [];
		for (let i = 0; i < sorted.length; i++) {
			const n = sorted[i];
			if (i > 0 && n - sorted[i - 1] > 1) {
				result.push("...");
			}
			result.push(n);
		}
		return result;
	};

	return (
		<div className="-mx-4 -mb-8 flex flex-col items-center justify-center gap-4 border-y border-dashed bg-accent py-12 lg:mx-0 lg:mb-0 lg:flex-row lg:px-4 lg:py-9">
			<div className="flex-1 text-muted-foreground text-sm">
				{totalRows ?? table.getFilteredRowModel().rows.length} row(s) total.
			</div>
			<div className="space-x-2">
				<Button
					variant="outline"
					size="sm"
					className="rounded-none"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				{getPageNumbers().map((page, index) => {
					const uniqueKey =
						typeof page === "number"
							? `page-${page}-${index}`
							: `ellipsis-${currentPage}-${pageCount}-${index}`;

					return typeof page === "number" ? (
						<Button
							className="h-8 w-8 rounded-none p-0"
							key={uniqueKey}
							onClick={() => table.setPageIndex(page)}
							size="sm"
							variant={currentPage === page ? "default" : "outline"}
						>
							{page + 1}
						</Button>
					) : (
						<span className="rounded-none px-2" key={uniqueKey}>
							{page}
						</span>
					);
				})}
				<Button
					variant="outline"
					className="rounded-none"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
