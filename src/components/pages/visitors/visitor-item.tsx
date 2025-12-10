"use client";

import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Visitor } from "@/lib/api/visitor";
import QRCode from "react-qr-code";

interface VisitorItemProps {
	visitor: Visitor;
}

export function VisitorItem({ visitor }: VisitorItemProps) {
	return (
		<div className="space-y-3 rounded-lg border bg-card p-4">
			{/* Name and Basic Info */}
			<div>
				<p className="font-semibold text-base">{visitor.full_name}</p>
				<p className="text-muted-foreground text-sm">{visitor.email || "No email"}</p>
				{visitor.phone && (
					<p className="text-muted-foreground text-sm">{visitor.phone}</p>
				)}
			</div>

			{/* Public ID and Date */}
			<div className="grid grid-cols-2 gap-2 border-t pt-3">
				<div>
					<p className="font-medium text-muted-foreground text-xs">Public ID</p>
					<code className="mt-1 block truncate rounded bg-muted px-2 py-1 font-mono text-xs">
						{visitor.public_id}
					</code>
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-xs">Created</p>
					<p className="mt-1 text-xs">
						{new Date(visitor.created_at).toLocaleDateString()}
					</p>
				</div>
			</div>

			{/* QR Code Button */}
			<div className="flex gap-2 pt-2">
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm" className="flex-1">
							<QrCode className="mr-2 h-4 w-4" />
							View QR
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Visitor QR Code</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col items-center space-y-4 py-4">
							<QRCode value={visitor.public_id} size={256} />
							<div className="text-center">
								<p className="font-medium">{visitor.full_name}</p>
								<p className="text-muted-foreground text-sm">
									{visitor.public_id}
								</p>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
