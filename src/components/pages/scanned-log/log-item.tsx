"use client";

import { Calendar, CircleCheck, Clock, Copy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ScannedLog } from "./columns";

interface ScannedLogItemProps {
	scannedLog: ScannedLog;
}

export function ScannedLogItem({ scannedLog }: ScannedLogItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Scanned Log ID copied to clipboard",
	});

	const handleCopyId = () => {
		copyToClipboard(scannedLog.id);
	};

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between">
					<h3 className="text-balance font-bold text-xl">{scannedLog.name}</h3>
				</ItemTitle>
				<ItemDescription className="flex w-full justify-start gap-2">
					<span className="bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
						ID: {scannedLog.id}
					</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 hover:border"
						onClick={handleCopyId}
					>
						<Copy className="size-3" />
					</Button>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="grid grid-cols-2 gap-2 md:flex md:flex-col">
				<div className="flex items-center gap-2">
					<MapPin className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{scannedLog.locationName}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<CircleCheck className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{scannedLog.status === "scanned" ? "Scanned" : "Not Scanned"}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Calendar className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{new Date(scannedLog.checkedInAt).toLocaleString().split(",")[0]}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Clock className="size-4 text-muted-foreground" />
					<h4 className="font-medium text-muted-foreground text-sm">
						{new Date(scannedLog.checkedInAt).toLocaleString().split(",")[1]}
					</h4>
				</div>
			</ItemContent>
		</Item>
	);
}
