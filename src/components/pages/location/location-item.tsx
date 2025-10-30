"use client";

import { Copy, MapPin, Scan, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { LocationActionsMenu } from "./action-menu";
import type { BaseLocation } from "./columns";

interface LocationItemProps {
	location: BaseLocation;
}

export function LocationItem({ location }: LocationItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Location ID copied to clipboard",
	});
	const isMobile = useIsMobile();
	const handleCopyId = () => {
		copyToClipboard(location.id);
	};

	const assignedCount = location.assignedMembers.length;

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				{!isMobile ? (
					<ItemTitle className="min-h-12 w-full justify-between">
						<h3 className="text-balance font-bold text-xl">{location.name}</h3>
					</ItemTitle>
				) : (
					<ItemTitle className="min-h-12 w-full justify-start">
						<div className="flex items-center gap-2 rounded-md border bg-muted p-2">
							<MapPin className="size-4 text-muted-foreground" />
						</div>
						<h3 className="text-balance font-bold text-xl">{location.name}</h3>
					</ItemTitle>
				)}
				<ItemDescription className="flex w-full justify-start gap-2">
					<span className="bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
						ID: {location.id}
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
			<ItemContent className="flex-1">
				<div className="flex items-center gap-2">
					<Users className="size-4 text-muted-foreground" />
					<h4 className="text-muted-foreground text-sm">
						Assigned members: {assignedCount}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Scan className="size-4 text-muted-foreground" />
					<h4 className="text-muted-foreground text-sm">
						Scan limit: {('isUnlimited' in location && (location as any).isUnlimited) ? "Unlimited" : (location.scanLimit ?? "N/A")}
					</h4>
				</div>
			</ItemContent>
			<ItemFooter className="flex justify-end">
				<ItemActions>
					<LocationActionsMenu location={location} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
