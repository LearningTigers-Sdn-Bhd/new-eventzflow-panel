"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface DataPaginationProps<TData> {
	table: Table<TData>;
}

export function DataPagination<TData>({ table }: DataPaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex;
	const pageCount = table.getPageCount();

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const showEllipsisStart = currentPage > 2;
		const showEllipsisEnd = currentPage < pageCount - 3;

		if (pageCount <= 7) {
			return Array.from({ length: pageCount }, (_, i) => i);
		}
		pages.push(0);
		if (showEllipsisStart) {
			pages.push("...");
			pages.push(currentPage - 1, currentPage, currentPage + 1);
		} else {
			pages.push(1, 2, 3);
		}
		if (showEllipsisEnd) {
			pages.push("...");
		} else if (currentPage < pageCount - 3) {
			pages.push(pageCount - 3, pageCount - 2);
		}
		if (currentPage >= pageCount - 3) {
			for (let i = Math.max(4, currentPage - 1); i < pageCount - 1; i++) {
				if (!pages.includes(i)) {
					pages.push(i);
				}
			}
		}
		pages.push(pageCount - 1);
		return pages;
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4 border-y border-dashed bg-accent px-0 py-9 lg:flex-row lg:px-4">
			<div className="flex-1 text-muted-foreground text-sm">
				{table.getFilteredRowModel().rows.length} row(s) total.
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
							? `page-${page}`
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
