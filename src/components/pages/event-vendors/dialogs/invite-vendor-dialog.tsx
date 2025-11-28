"use client";

import { useMutation } from "@tanstack/react-query";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateVendorInviteLink } from "@/lib/api/vendor-invitation";

interface InviteVendorDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

export function InviteVendorDialog({ eventId, trigger }: InviteVendorDialogProps) {
	const [open, setOpen] = useState(false);
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [expiresAt, setExpiresAt] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const generateMutation = useMutation({
		mutationFn: () => generateVendorInviteLink(eventId),
		onSuccess: (response) => {
			setInviteUrl(response.data.invite_url);
			setExpiresAt(response.data.expires_at);
		},
		onError: (error: Error) => {
			toast.error("Failed to generate link", {
				description: error.message,
			});
		},
	});

	// Generate link immediately when dialog opens
	useEffect(() => {
		if (open && !inviteUrl && !generateMutation.isPending) {
			generateMutation.mutate();
		}
	}, [open]);

	const handleCopy = async () => {
		if (inviteUrl) {
			await navigator.clipboard.writeText(inviteUrl);
			setCopied(true);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset state when dialog closes
			setInviteUrl(null);
			setExpiresAt(null);
			setCopied(false);
		}
	};

	const formatExpiryDate = (isoDate: string) => {
		return new Date(isoDate).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline">
						<Link2 className="mr-2 h-4 w-4" />
						Invite Vendor
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Invite Vendor</DialogTitle>
					<DialogDescription>
						Share this invitation link with vendors. They can use it to register
						and join your event.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-4">
					{generateMutation.isPending || (!inviteUrl && !generateMutation.isError) ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								Generating invitation link...
							</p>
						</div>
					) : inviteUrl ? (
						<>
							<div className="space-y-2">
								<Label>Invitation Link</Label>
								<div className="flex gap-2">
									<Input
										value={inviteUrl}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={handleCopy}
										className="shrink-0"
									>
										{copied ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
								{expiresAt && (
									<p className="text-muted-foreground text-xs">
										This link expires on {formatExpiryDate(expiresAt)}
									</p>
								)}
							</div>

							<div className="rounded-lg border bg-muted/50 p-4">
								<h4 className="mb-2 font-medium text-sm">How to use:</h4>
								<ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
									<li>Copy the invitation link above</li>
									<li>Share it with the vendor (email, WhatsApp, etc.)</li>
									<li>The vendor clicks the link and registers their account</li>
									<li>They will automatically be added to this event</li>
								</ol>
							</div>

							<div className="flex justify-end pt-2">
								<Button onClick={handleCopy}>
									{copied ? (
										<Check className="mr-2 h-4 w-4" />
									) : (
										<Copy className="mr-2 h-4 w-4" />
									)}
									{copied ? "Copied!" : "Copy Link"}
								</Button>
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div className="mb-4 rounded-full bg-destructive/10 p-4">
								<Link2 className="h-8 w-8 text-destructive" />
							</div>
							<p className="mb-4 text-muted-foreground text-sm">
								Failed to generate invitation link. Please try again.
							</p>
							<Button
								onClick={() => generateMutation.mutate()}
								disabled={generateMutation.isPending}
							>
								Retry
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
