"use client";

import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Plus } from "lucide-react";
import { useState } from "react";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getCertificateTemplates } from "@/lib/api/certificate";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { CertificateTemplateEditor } from "./certificate-template-editor";
import { NewCertificateTemplateDialog } from "./new-certificate-template-dialog";

type CertificatesDesignerProps = {
	eventId: string;
};

/**
 * One event can have several certificate templates (e.g. peserta vs
 * jawatankuasa), each sent to its own ticket types. This picks which one is
 * being designed; the editor itself lives in CertificateTemplateEditor.
 */
export function CertificatesDesigner({ eventId }: CertificatesDesignerProps) {
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data: templates, isLoading } = useQuery({
		queryKey: ["event", eventId, "certificate-templates"],
		queryFn: () => getCertificateTemplates(eventId),
	});
	const { data: ticketTypes = [] } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	if (isLoading || !templates) {
		return (
			<LoadingState
				title="Loading templates..."
				description="Please wait while we load the certificate designer."
			/>
		);
	}

	const selected =
		templates.find((t) => t.id === selectedId) ?? templates[0] ?? null;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				{selected && (
					<Select
						value={String(selected.id)}
						onValueChange={(v) => setSelectedId(Number(v))}
					>
						<SelectTrigger className="w-64 rounded-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							{templates.map((t) => (
								<SelectItem key={t.id} value={String(t.id)}>
									{t.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
				<Button
					variant="outline"
					className="rounded-none"
					onClick={() => setDialogOpen(true)}
				>
					<Plus className="mr-1 size-4" />
					New template
				</Button>
			</div>

			{selected ? (
				<CertificateTemplateEditor
					key={selected.id}
					eventId={eventId}
					template={selected}
					templates={templates}
					ticketTypes={ticketTypes}
					onDeleted={() => setSelectedId(null)}
				/>
			) : (
				<div className="flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
					<ImageIcon className="size-8 text-muted-foreground" />
					<p className="font-medium text-sm">No certificate designed yet</p>
					<p className="text-muted-foreground text-xs">
						Create a template to upload your design and place fields.
					</p>
				</div>
			)}

			<NewCertificateTemplateDialog
				eventId={eventId}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				templates={templates}
				ticketTypes={ticketTypes}
				onCreated={(t) => setSelectedId(t.id)}
			/>
		</div>
	);
}

export default CertificatesDesigner;
