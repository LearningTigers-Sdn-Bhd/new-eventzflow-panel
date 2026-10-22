"use client";

import { Button } from "@/components/ui/button";
import { useChunkErrorReload } from "@/hooks/use-chunk-error-reload";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const isChunkError = useChunkErrorReload(error);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="font-semibold text-2xl">
				{isChunkError ? "A new version is available" : "Something went wrong"}
			</h1>
			<p className="max-w-md text-muted-foreground">
				{isChunkError
					? "We just updated the system. Reload to continue — you will stay signed in."
					: "An unexpected error occurred. Try again, or reload the page."}
			</p>
			<div className="flex gap-2">
				{!isChunkError && <Button onClick={reset}>Try again</Button>}
				<Button
					variant={isChunkError ? "default" : "outline"}
					onClick={() => window.location.reload()}
				>
					Reload page
				</Button>
			</div>
		</div>
	);
}
