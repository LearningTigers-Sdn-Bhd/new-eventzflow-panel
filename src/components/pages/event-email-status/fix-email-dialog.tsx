"use client";

import { useQuery } from "@tanstack/react-query";
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
import { getEventVendors } from "@/lib/api/event-vendor/endpoints";
import {
	findExhibitorEmailTargets,
	isExhibitorEmail,
} from "./fix-exhibitor-email";

interface FixEmailDialogProps {
	eventId: string;
	delivery: EventEmailDelivery | null;
	pending: boolean;
	onClose: () => void;
	onSubmit: (email: string, options: { vendorLogin: boolean }) => void;
}

export function FixEmailDialog({
	eventId,
	delivery,
	pending,
	onClose,
	onSubmit,
}: FixEmailDialogProps) {
	const [email, setEmail] = useState("");
	const exhibitor = !!delivery && isExhibitorEmail(delivery.emailType);
	const [vendorLogin, setVendorLogin] = useState(true);
	const { data: vendors } = useQuery({
		queryKey: ["event-email-status", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
		enabled: exhibitor,
	});
	const { kitCount, vendor } =
		vendors && delivery?.recipient
			? findExhibitorEmailTargets(vendors, delivery.recipient)
			: { kitCount: 0, vendor: null };

	useEffect(() => {
		setEmail(delivery?.recipient ?? "");
		setVendorLogin(true);
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
								Correct the address and we'll send it again.{" "}
								{exhibitor
									? "The exhibitor's contact email is updated too."
									: "The attendee's ticket is updated too."}
							</p>
						</div>
					</DialogDescription>
				</DialogHeader>
				{exhibitor && kitCount > 1 && (
					<p className="border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">
						This will update {kitCount} exhibitor kits sharing this email.
					</p>
				)}
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
				{exhibitor && vendor && (
					<label
						htmlFor="fix-vendor-login"
						className="flex items-start gap-2 text-sm"
					>
						<input
							id="fix-vendor-login"
							type="checkbox"
							className="mt-1"
							checked={vendorLogin}
							onChange={(e) => setVendorLogin(e.target.checked)}
						/>
						<span>
							Also change the login email of <strong>{vendor.full_name}</strong>
							. This address is their sign-in email too.
						</span>
					</label>
				)}
				<DialogFooter>
					<Button variant="outline" className="rounded-none" onClick={onClose}>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						disabled={pending || !email.trim()}
						onClick={() =>
							onSubmit(email.trim(), { vendorLogin: !!vendor && vendorLogin })
						}
					>
						{pending && <Loader2 className="size-4 animate-spin" />}
						Save & resend
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
