"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventEmailDelivery } from "@/lib/api/event-email-status";

interface FixEmailDialogProps {
	delivery: EventEmailDelivery | null;
	pending: boolean;
	onClose: () => void;
	onSubmit: (email: string) => void;
}

export function FixEmailDialog({
	delivery,
	pending,
	onClose,
	onSubmit,
}: FixEmailDialogProps) {
	const [email, setEmail] = useState("");

	useEffect(() => {
		setEmail(delivery?.recipient ?? "");
	}, [delivery]);

	return (
		<Dialog
			open={delivery !== null}
			onOpenChange={(open) => !open && onClose()}
		>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Fix email address</DialogTitle>
					<DialogDescription asChild>
						<div className="space-y-2">
							<p>
								This email didn't reach{" "}
								<strong className="text-foreground">
									{delivery?.recipient}
								</strong>
								. Common reasons:
							</p>
							<ul className="list-disc pl-5 font-semibold text-foreground">
								<li>Wrong address or a typo</li>
								<li>The address doesn't exist</li>
								<li>The mailbox is full</li>
								<li>The address blocks our emails</li>
							</ul>
							<p>
								Correct the address and we'll send it again. The attendee's
								ticket is updated too.
							</p>
						</div>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-1.5">
					<Label htmlFor="fix-email">Correct email address</Label>
					<Input
						id="fix-email"
						type="email"
						className="rounded-none"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" className="rounded-none" onClick={onClose}>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						disabled={pending || !email.trim()}
						onClick={() => onSubmit(email.trim())}
					>
						{pending && <Loader2 className="size-4 animate-spin" />}
						Save & resend
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
