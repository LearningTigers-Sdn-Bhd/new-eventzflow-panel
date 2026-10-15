"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type CertificateTemplate,
	createCertificateTemplate,
} from "@/lib/api/certificate";
import type { TicketType } from "@/lib/api/ticket-type";
import { CertificateTemplateSettings } from "./certificate-template-settings";

const BLANK = "blank";

type NewCertificateTemplateDialogProps = {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	templates: CertificateTemplate[];
	ticketTypes: TicketType[];
	onCreated: (template: CertificateTemplate) => void;
};

/**
 * Creates a template. "Copy design from" duplicates another template's
 * background and fields, so a variant only needs its wording changed. The new
 * template is sent to the ticket types picked here.
 */
export function NewCertificateTemplateDialog({
	eventId,
	open,
	onOpenChange,
	templates,
	ticketTypes,
	onCreated,
}: NewCertificateTemplateDialogProps) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [ticketTypeIds, setTicketTypeIds] = useState<number[]>([]);
	const [copyFrom, setCopyFrom] = useState(BLANK);

	// Only one template can be the default (no ticket types), so once one exists
	// every further template must pick at least one ticket type.
	const needsTicketType =
		templates.some((t) => t.ticket_type_ids.length === 0) &&
		ticketTypeIds.length === 0;

	const mutation = useMutation({
		mutationFn: () =>
			createCertificateTemplate(
				eventId,
				{ name: name.trim(), ticket_type_ids: ticketTypeIds },
				copyFrom === BLANK ? undefined : Number(copyFrom),
			),
		onSuccess: (created) => {
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-templates"],
			});
			toast.success("Template created");
			setName("");
			setTicketTypeIds([]);
			setCopyFrom(BLANK);
			onOpenChange(false);
			onCreated(created);
		},
		onError: (e: unknown) =>
			toast.error(e instanceof Error ? e.message : "Failed to create template"),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none">
				<DialogHeader>
					<DialogTitle>New certificate template</DialogTitle>
					<DialogDescription>
						Use a separate template when part of the wording differs, e.g.
						&ldquo;sebagai peserta&rdquo; vs &ldquo;sebagai jawatankuasa&rdquo;.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<CertificateTemplateSettings
						isEditing
						name={name}
						onNameChange={setName}
						ticketTypeIds={ticketTypeIds}
						onTicketTypeIdsChange={setTicketTypeIds}
						ticketTypes={ticketTypes}
						otherTemplates={templates}
					/>
					{templates.length > 0 && (
						<div className="space-y-1">
							<Label>Copy design from</Label>
							<Select value={copyFrom} onValueChange={setCopyFrom}>
								<SelectTrigger className="rounded-none">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									<SelectItem value={BLANK}>Blank template</SelectItem>
									{templates.map((t) => (
										<SelectItem key={t.id} value={String(t.id)}>
											{t.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
				{needsTicketType && (
					<p className="text-muted-foreground text-xs">
						A default template already exists, so pick the ticket types this one
						is for.
					</p>
				)}
				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						onClick={() => mutation.mutate()}
						disabled={!name.trim() || needsTicketType || mutation.isPending}
					>
						{mutation.isPending ? "Creating..." : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
