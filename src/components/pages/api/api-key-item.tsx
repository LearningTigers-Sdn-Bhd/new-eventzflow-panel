"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { ApiKeyActionsMenu } from "./action-menu";
import type { ApiKey } from "./columns";

interface ApiKeyItemProps {
	apiKey: ApiKey;
}

export function ApiKeyItem({ apiKey }: ApiKeyItemProps) {
	const { formatDate } = useFormatDate();
	
	const id = String(apiKey.id || "");

	return (
		<Card>
			<CardContent className="p-4">
				<div className="space-y-3">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1 space-y-1">
							<p className="text-muted-foreground text-xs">Key ID</p>
							<p className="break-all font-mono text-sm">{id}</p>
						</div>
						<ApiKeyActionsMenu apiKey={apiKey} />
					</div>

					<div className="grid grid-cols-2 gap-3 border-t pt-3">
						<div>
							<p className="text-muted-foreground text-xs">Created</p>
							<p className="font-medium text-sm">{formatDate(apiKey.createdAt)}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Last Used</p>
							{apiKey.lastUsedAt ? (
								<p className="font-medium text-sm">{formatDate(apiKey.lastUsedAt)}</p>
							) : (
								<Badge variant="outline" className="text-muted-foreground text-xs">
									Never Used
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
