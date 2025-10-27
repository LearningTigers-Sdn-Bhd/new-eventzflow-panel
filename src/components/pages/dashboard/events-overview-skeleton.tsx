import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventsOverviewSkeleton() {
	return (
		<div className="space-y-4">
			{/* Helper info skeleton */}
			<div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
				<Skeleton className="h-7 w-7 rounded-full" />
				<div className="flex-1 space-y-1">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-64" />
				</div>
			</div>

			{/* Event cards skeleton */}
			<div className="grid gap-4 md:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i} className="transition-all hover:shadow-lg">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-2">
									<div className="flex items-center gap-2">
										<Skeleton className="h-5 w-40" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
									<div className="flex items-center gap-1.5">
										<Skeleton className="h-3 w-3 rounded-full" />
										<Skeleton className="h-3 w-48" />
									</div>
								</div>
								<Skeleton className="h-8 w-20" />
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{/* Stats Grid */}
							<div className="grid grid-cols-3 gap-3">
								{[1, 2, 3].map((j) => (
									<div
										key={j}
										className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2"
									>
										<div className="flex items-center gap-1.5">
											<Skeleton className="h-3 w-3" />
											<Skeleton className="h-3 w-10" />
										</div>
										<Skeleton className="h-6 w-12" />
									</div>
								))}
							</div>

							{/* Revenue & Progress */}
							<div className="flex items-center gap-4 border-t pt-2">
								<div className="space-y-1">
									<div className="flex items-center gap-1.5">
										<Skeleton className="h-3 w-3" />
										<Skeleton className="h-3 w-12" />
									</div>
									<Skeleton className="h-6 w-16" />
								</div>

								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<Skeleton className="h-3 w-12" />
										<Skeleton className="h-3 w-8" />
									</div>
									<Skeleton className="h-2 w-full rounded-full" />
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
