import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventsOverviewSkeleton() {
	return (
		<div className="space-y-4">
			{/* Banner skeleton */}
			<div className="flex items-center gap-3 rounded-none border border-dashed border-primary/20 bg-primary/5 px-4 py-3">
				<Skeleton className="h-4 w-4 shrink-0" />
				<div className="flex-1 space-y-1">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-64" />
				</div>
				<Skeleton className="h-4 w-4 shrink-0" />
			</div>

			{/* Event cards skeleton */}
			<div className="grid gap-4 lg:grid-cols-2">
				{[1, 2].map((i) => (
					<Card
						key={i}
						className="rounded-none border-dashed p-0"
					>
						<CardHeader className="space-y-2 px-4 pt-4">
							<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between md:gap-2">
								<div className="flex flex-col items-start gap-2">
									{/* Title */}
									<Skeleton className="h-5 w-48" />
									{/* Last activity */}
									<Skeleton className="h-3 w-32" />
									{/* Badges */}
									<div className="flex flex-row items-center gap-1.5">
										<Skeleton className="h-6 w-24 rounded-none" />
										<Skeleton className="h-6 w-24 rounded-none" />
									</div>
								</div>
								{/* Details button */}
								<Skeleton className="h-8 w-20 rounded-none sm:w-24" />
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{/* Stats Grid */}
							<div className="grid grid-cols-3 gap-2 px-3 pb-3">
								{[1, 2, 3].map((j) => (
									<div
										key={j}
										className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2"
									>
										<Skeleton className="h-4 w-4" />
										<Skeleton className="h-3 w-10" />
										<Skeleton className="h-5 w-12" />
									</div>
								))}
							</div>

							{/* Revenue & Progress */}
							<div className="flex items-center border-t">
								<div className="shrink-0 space-y-1 border-r border-dashed p-3 md:p-4">
									<div className="flex items-center gap-1.5">
										<Skeleton className="h-3 w-3" />
										<Skeleton className="h-3 w-12" />
									</div>
									<Skeleton className="h-6 w-20" />
								</div>

								<div className="min-w-0 flex-1 space-y-1 p-3 md:p-4">
									<div className="flex items-center justify-between">
										<Skeleton className="h-3 w-14" />
										<Skeleton className="h-3 w-8" />
									</div>
									<Skeleton className="h-1.5 w-full rounded-none" />
									<Skeleton className="ml-auto h-3 w-16" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
