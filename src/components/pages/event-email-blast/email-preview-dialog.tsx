"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

/** Shows the exact HTML recipients receive (rendered by the backend mailer). */
export function EmailPreviewDialog({
	html,
	onClose,
}: {
	html: string | null;
	onClose: () => void;
}) {
	return (
		<Dialog open={html !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="rounded-none sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Email preview</DialogTitle>
				</DialogHeader>
				<iframe
					title="Email preview"
					sandbox=""
					srcDoc={html ?? ""}
					className="h-[70vh] w-full border bg-white"
				/>
			</DialogContent>
		</Dialog>
	);
}
