"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function LoadingPage({ className }: { className?: string }) {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-linear-to-br from-background via-background to-emerald-50/20 dark:to-emerald-950/10">
			<div className="flex w-full max-w-xs flex-col items-center gap-4">
				<Spinner className={cn("size-16 text-emerald-500", className)} />
				<div className="flex flex-col items-center gap-2">
					<p className="text-balance text-center font-medium text-emerald-500 text-lg">
						Preparing the best experience for you
					</p>
					<p className="animate-pulse text-balance text-center text-emerald-800 text-sm">
						Just a moment...
					</p>
				</div>
			</div>
		</div>
	);
}
