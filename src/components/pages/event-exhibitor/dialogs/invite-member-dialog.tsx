"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";

interface InviteMemberDialogProps {
	kit: ExhibitorKit;
}

export function InviteMemberDialog({ kit }: InviteMemberDialogProps) {
	const { closeDialog } = useDialog();
	const [isCopied, setIsCopied] = useState(false);

	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
	const inviteLink = `${baseUrl}/exhibitor-kit/${kit.public_id}/team-members`;

	if (!kit.public_id) {
		return (
			<div className="p-6 text-center text-muted-foreground text-sm">
				This kit has no public link yet. Save the kit first.
			</div>
		);
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(inviteLink);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<div className="space-y-5">
			<div className="border-t border-b py-4">
				<p className="font-semibold text-sm">{kit.company_name}</p>
				<p className="text-muted-foreground text-xs">
					Booth {kit.booth_number || "TBD"}
				</p>
			</div>

			<div className="flex justify-center">
				<div className="inline-block border-4 border-foreground bg-white p-4">
					<QRCode
						value={inviteLink}
						size={200}
						level="H"
						style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
					Invite Link
				</p>
				<div className="flex gap-2">
					<Input
						readOnly
						value={inviteLink}
						className="h-9 rounded-none bg-muted/40 font-mono text-xs"
						onFocus={(e) => e.target.select()}
					/>
					<Button
						variant="outline"
						size="icon"
						onClick={handleCopy}
						className="size-9 shrink-0 rounded-none"
						title="Copy to clipboard"
					>
						{isCopied ? (
							<Check className="size-4 text-green-600" />
						) : (
							<Copy className="size-4" />
						)}
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => window.open(inviteLink, "_blank")}
						className="size-9 shrink-0 rounded-none"
						title="Open link in new tab"
					>
						<ExternalLink className="size-4" />
					</Button>
				</div>
			</div>

			<div className="flex justify-end border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					className="rounded-none px-8"
				>
					Done
				</Button>
			</div>
		</div>
	);
}
