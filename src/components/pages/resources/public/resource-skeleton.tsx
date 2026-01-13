import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-0 border border-black lg:grid-cols-3">
			<div className="lg:col-span-2">
				<Skeleton className="h-[400px] w-full rounded-none md:h-[500px]" />
			</div>
			<div className="flex flex-col justify-center gap-6 rounded-none bg-black p-6 lg:col-span-1">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-32 bg-white/20" />
					<Skeleton className="h-10 w-full bg-white/20" />
					<Skeleton className="h-10 w-3/4 bg-white/20" />
				</div>
				<div className="mt-auto flex flex-col gap-2">
					<Skeleton className="h-12 w-full rounded-none bg-white/20" />
					<Skeleton className="h-12 w-full rounded-none bg-white/20" />
				</div>
			</div>
		</div>
	);
}

export function GridCardSkeleton() {
	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-none bg-card">
			<div className="relative aspect-3/2 w-full overflow-hidden bg-black sm:aspect-4/3">
				<Skeleton className="h-full w-full rounded-none opacity-20" />
				<div className="absolute right-0 bottom-0 left-0 flex flex-col gap-4 p-6">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-20 bg-white/20" />
						<Skeleton className="h-6 w-20 bg-white/20" />
					</div>
					<div className="flex flex-col gap-2">
						<Skeleton className="h-8 w-full bg-white/20" />
						<Skeleton className="h-4 w-3/4 bg-white/20" />
					</div>
					<div className="flex gap-4">
						<Skeleton className="h-4 w-24 bg-white/20" />
						<Skeleton className="h-4 w-24 bg-white/20" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function FeaturedGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-0 bg-black md:grid-cols-2 lg:grid-cols-3">
			{["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
				<GridCardSkeleton key={id} />
			))}
		</div>
	);
}
