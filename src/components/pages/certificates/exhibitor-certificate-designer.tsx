"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	createCertificateTemplate,
	getCertificateTemplates,
} from "@/lib/api/certificate";
import { CertificateTemplateEditor } from "./certificate-template-editor";

export const exhibitorTemplatesKey = (eventId: string) => [
	"event",
	eventId,
	"certificate-templates",
	"exhibitor",
];

/** The event's single exhibitor certificate design (company name, booths). */
export function ExhibitorCertificateDesigner({ eventId }: { eventId: string }) {
	const queryClient = useQueryClient();
	const key = exhibitorTemplatesKey(eventId);

	const { data: templates, isLoading } = useQuery({
		queryKey: key,
		queryFn: () => getCertificateTemplates(eventId, "exhibitor"),
	});

	const createMutation = useMutation({
		mutationFn: () =>
			createCertificateTemplate(
				eventId,
				{ name: "Exhibitor" },
				undefined,
				"exhibitor",
			),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
		onError: (e: unknown) =>
			toast.error(e instanceof Error ? e.message : "Failed to create template"),
	});

	if (isLoading || !templates) {
		return <LoadingState title="Loading exhibitor template..." />;
	}

	const template = templates[0];
	if (!template) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
				<ImageIcon className="size-8 text-muted-foreground" />
				<p className="font-medium text-sm">No exhibitor certificate yet</p>
				<p className="text-muted-foreground text-xs">
					One certificate per exhibitor company, however many booths it has.
				</p>
				<Button
					className="rounded-none"
					onClick={() => createMutation.mutate()}
					disabled={createMutation.isPending}
				>
					<Plus className="mr-1 size-4" />
					Create exhibitor template
				</Button>
			</div>
		);
	}

	return (
		<CertificateTemplateEditor
			key={template.id}
			audience="exhibitor"
			eventId={eventId}
			template={template}
			templates={templates}
			ticketTypes={[]}
			onDeleted={() => undefined}
		/>
	);
}
