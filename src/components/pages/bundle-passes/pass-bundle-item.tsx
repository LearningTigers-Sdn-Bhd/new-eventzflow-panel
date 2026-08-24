"use client";

import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PassBundle } from "@/lib/api/pass-bundle";
import { PassBundleActionsMenu } from "./pass-bundle-action-menu";
import {
	passBundleStatusLabel,
	paymentModeLabel,
	paymentStatusLabel,
} from "./pass-bundle-labels";

interface PassBundleItemProps {
	bundle: PassBundle;
	onEdit: (bundle: PassBundle) => void;
	onQr: (bundle: PassBundle) => void;
	onDelete: (bundle: PassBundle) => void;
}

export function PassBundleItem({
	bundle,
	onEdit,
	onQr,
	onDelete,
}: PassBundleItemProps) {
	return (
		<Card className="rounded-none border-dashed">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="font-medium text-base">{bundle.name}</CardTitle>
					<p className="text-muted-foreground text-sm">
						{bundle.ticketType.name}
					</p>
				</div>
				<PassBundleActionsMenu
					bundle={bundle}
					onEdit={onEdit}
					onQr={onQr}
					onDelete={onDelete}
				/>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-wrap gap-2">
					<Badge
						variant={bundle.status === "active" ? "default" : "secondary"}
						className="rounded-none"
					>
						{passBundleStatusLabel[bundle.status]}
					</Badge>
					<Badge variant="outline" className="rounded-none">
						{paymentModeLabel[bundle.paymentMode]}
					</Badge>
					<Badge className="rounded-none">
						{paymentStatusLabel[bundle.paymentStatus]}
					</Badge>
				</div>
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div>
						<p className="text-muted-foreground">Registration Form</p>
						<p className="font-medium">{bundle.registrationForm.name}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Usage</p>
						<p className="font-medium">
							{bundle.usedCount} of {bundle.passLimit} used
						</p>
					</div>
					<div>
						<p className="text-muted-foreground">Remaining</p>
						<p className="font-medium">{bundle.remainingCount}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Expiry</p>
						<p className="font-medium">
							{bundle.expiresAt
								? new Date(bundle.expiresAt).toLocaleDateString()
								: "-"}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground">Table</p>
						<p className="font-medium">
							{bundle.planObject ? bundle.planObject.label : "Unassigned"}
						</p>
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full gap-1.5 rounded-none"
					onClick={async () => {
						await navigator.clipboard.writeText(bundle.bundleLink);
						toast.success("Bundle link copied");
					}}
				>
					<Link2 className="h-3.5 w-3.5" />
					Copy Bundle Link
					<Copy className="ml-auto h-3.5 w-3.5" />
				</Button>
			</CardContent>
		</Card>
	);
}
