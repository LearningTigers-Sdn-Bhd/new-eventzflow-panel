import { ScanLine } from "lucide-react";

interface EmptyStateProps {
	hasScans: boolean;
}

export function EmptyState({ hasScans }: EmptyStateProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
			<div className="relative mb-6">
				<div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
				<div className="relative rounded-3xl border-2 border-muted-foreground/20 border-dashed bg-muted/30 p-10">
					<ScanLine className="h-16 w-16 text-muted-foreground/30" />
				</div>
			</div>
			<h3 className="mb-2 font-bold text-lg">
				{hasScans ? "No Results Found" : "No Scans Yet"}
			</h3>
			<p className="max-w-xs text-muted-foreground text-sm">
				{hasScans
					? "Try adjusting your search or filters"
					: "Scanned tickets will appear here in real-time"}
			</p>
		</div>
	);
}
