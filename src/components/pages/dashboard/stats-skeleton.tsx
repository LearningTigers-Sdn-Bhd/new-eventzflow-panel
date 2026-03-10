import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
			{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
				<div
					key={i}
					className="flex items-center justify-between rounded-none border border-dashed p-4"
				>
					<div className="min-w-0 flex-1 space-y-2">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-10 w-10 shrink-0 rounded-md" />
				</div>
			))}
		</div>
	);
}
