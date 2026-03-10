"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import type { Visitor } from "@/lib/api/visitor";

interface RsvpLinkModalProps {
	visitor: Visitor;
	eventSlug: string;
}

export function RsvpLinkModal({ visitor, eventSlug }: RsvpLinkModalProps) {
	const { closeDialog } = useDialog();
	const [isCopied, setIsCopied] = useState(false);

	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
	const rsvpLink = `${baseUrl}/events/${eventSlug}/rsvp/${visitor.public_id}`;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(rsvpLink);
		setIsCopied(true);
		toast.success("RSVP link copied to clipboard!");
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleOpen = () => {
		window.open(rsvpLink, "_blank");
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm leading-relaxed">
					Share this link with{" "}
					<span className="text-foreground font-medium">{visitor.full_name}</span>{" "}
					so they can respond to your invitation.
				</p>
			</div>

			<div className="rounded-none border bg-muted/30 p-4">
				<div className="space-y-2.5 min-w-0">
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
						Unique RSVP Link
					</p>
					<div className="flex gap-2">
						<Input
							readOnly
							value={rsvpLink}
							className="rounded-none font-mono text-xs h-9 bg-background"
							onFocus={(e) => e.target.select()}
						/>
						<div className="flex gap-1.5">
							<Button
								variant="outline"
								size="icon"
								onClick={handleCopy}
								className="size-9 shrink-0 rounded-none bg-background"
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
								onClick={handleOpen}
								className="size-9 shrink-0 rounded-none bg-background"
								title="Open link in new tab"
							>
								<ExternalLink className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-end pt-2">
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
