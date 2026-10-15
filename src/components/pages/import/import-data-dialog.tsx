"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";
import type { ImportResponse } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";
import { ImportDataFlow } from "./import-data-flow";

export interface ImportDataDialogProps {
	importType: ImportType;
	trigger?: React.ReactNode;
	onImported?: (data: ImportResponse) => void;
	/** Forwarded to ImportDataFlow — locks the template picker to this event. */
	lockedEventId?: number | string;
	/**
	 * Controlled open state. When provided (with onOpenChange), the dialog is
	 * driven externally — e.g. by a dropdown menu item — and no trigger button
	 * is rendered unless `trigger` is also given.
	 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
	tickets: "Tickets",
	visitors: "Visitors",
	events: "Events",
	users: "Users",
};

/**
 * Full-screen dialog hosting the shared ImportDataFlow. Used by the event
 * ticket page's "Import Ticket" action; the standalone import page renders
 * ImportDataFlow inline instead.
 */
export function ImportDataDialog({
	importType,
	trigger,
	onImported,
	lockedEventId,
	open,
	onOpenChange,
}: ImportDataDialogProps) {
	const typeLabel = IMPORT_TYPE_LABELS[importType] ?? importType;
	const [storeOpen, setStoreOpen] = useFullScreenDialogOpen(
		`import-data-dialog-${importType}`,
	);
	const controlled = open !== undefined;
	const isOpen = controlled ? open : storeOpen;
	const setIsOpen = controlled ? (onOpenChange ?? (() => {})) : setStoreOpen;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{/* When controlled externally (e.g. a menu item drives open state) and no
			    trigger is passed, render no trigger button at all. */}
			{(!controlled || trigger) && (
				<DialogTrigger asChild>
					{trigger || (
						<Button variant="outline" className="w-full rounded-none sm:w-auto">
							<FileSpreadsheet className="mr-2 h-4 w-4" />
							Import {typeLabel}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 !p-0 !gap-0 flex flex-col bg-background shadow-none duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Import {typeLabel}</DialogTitle>
						<DialogDescription>
							Download the template, fill it in, preview the file, then import
							for real.
						</DialogDescription>
					</DialogHeader>
				</div>
				<ImportDataFlow
					importType={importType}
					onImported={onImported}
					lockedEventId={lockedEventId}
				/>
			</DialogContent>
		</Dialog>
	);
}
