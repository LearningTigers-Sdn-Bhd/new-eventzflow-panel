import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
	return (
		<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
			{[1, 2, 3, 4].map((i) => (
				<Card key={i}>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-3 w-20" />
							</div>
							<Skeleton className="h-10 w-10 rounded-full" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
