"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export function ApiKeysSkeleton() {
	const isMobile = useIsMobile();

	return (
		<div className="space-y-4">
			{/* Search and filters skeleton */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<Skeleton className="h-8 w-full sm:w-[300px]" />
				<div className="flex w-full items-center justify-between gap-2 sm:w-auto">
					<Skeleton className="h-8 w-[120px] sm:w-[150px]" />
					<Skeleton className="h-8 w-[100px]" />
				</div>
			</div>

			{/* Table/Cards skeleton */}
			{!isMobile ? (
				<div className="rounded-md border">
					<div className="w-full">
						{/* Table header skeleton */}
						<div className="border-b bg-muted/50">
							<div className="flex h-12 items-center px-4">
								<div className="flex w-full gap-4">
									<Skeleton className="h-4 w-[120px]" />
									<Skeleton className="h-4 w-[150px]" />
									<Skeleton className="h-4 w-[100px]" />
									<Skeleton className="h-4 w-[150px]" />
									<Skeleton className="ml-auto h-4 w-[80px]" />
								</div>
							</div>
						</div>

						{/* Table rows skeleton */}
						<div>
							{Array.from({ length: 5 }).map((_, index) => (
								<div
									key={index}
									className="flex h-16 items-center border-b px-4 last:border-0"
								>
									<div className="flex w-full gap-4">
										<Skeleton className="h-4 w-[120px]" />
										<Skeleton className="h-4 w-[150px]" />
										<Skeleton className="h-4 w-[100px]" />
										<Skeleton className="h-4 w-[150px]" />
										<Skeleton className="ml-auto h-8 w-8" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="rounded-lg border bg-card p-4 shadow-sm"
						>
							<div className="mb-3 flex items-start justify-between">
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-[100px]" />
									<Skeleton className="h-3 w-[140px]" />
								</div>
								<Skeleton className="h-8 w-8" />
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-[60px]" />
									<Skeleton className="h-3 w-[100px]" />
								</div>
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-[60px]" />
									<Skeleton className="h-3 w-[120px]" />
								</div>
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-[60px]" />
									<Skeleton className="h-3 w-[80px]" />
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Pagination skeleton */}
			<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<Skeleton className="h-4 w-[150px]" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
				</div>
			</div>
		</div>
	);
}
