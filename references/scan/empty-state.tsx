import { ScanLine } from "lucide-react";

interface EmptyStateProps {
	hasScans: boolean;
}

export function EmptyState({ hasScans }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
			<div className="relative mb-6">
				<div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
				<div className="relative bg-muted/30 p-10 rounded-3xl border-2 border-dashed border-muted-foreground/20">
					<ScanLine className="h-16 w-16 text-muted-foreground/30" />
				</div>
			</div>
			<h3 className="text-lg font-bold mb-2">
				{hasScans ? "No Results Found" : "No Scans Yet"}
			</h3>
			<p className="text-sm text-muted-foreground max-w-xs">
				{hasScans
					? "Try adjusting your search or filters"
					: "Scanned tickets will appear here in real-time"}
			</p>
		</div>
	);
}
