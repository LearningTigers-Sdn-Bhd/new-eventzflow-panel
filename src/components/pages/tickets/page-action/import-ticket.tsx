"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { ImportDataDialog } from "@/components/pages/import/import-data-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useFullScreenDialogStore } from "@/stores/full-screen-dialog-store";

// Matches the key ImportDataDialog derives internally (`import-data-dialog-${importType}`)
// when rendered uncontrolled, so the menu item and the dialog share the same store slot.
const IMPORT_TICKETS_DIALOG_KEY = "import-data-dialog-tickets";

/**
 * Event ticket page "Import Ticket" action. As a dropdown menu item, only
 * flips the shared full-screen dialog store — it must NOT render the dialog
 * itself here, since Radix unmounts DropdownMenuContent (and everything
 * inside it) the instant the menu closes on select, which would close the
 * dialog before it ever showed (mirrors the exhibitor settings dropdown fix
 * in event-exhibitor/page-action/button.tsx: dialogs render as siblings
 * outside DropdownMenuContent with a hidden trigger).
 */
export function ImportTicketButton({ asMenuItem }: { asMenuItem?: boolean }) {
	const [open, setOpen] = useState(false);
	const setFullScreenDialogOpen = useFullScreenDialogStore(
		(state) => state.setOpen,
	);

	if (asMenuItem) {
		return (
			<DropdownMenuItem
				onSelect={() =>
					setFullScreenDialogOpen(IMPORT_TICKETS_DIALOG_KEY, true)
				}
				className="rounded-none"
			>
				<FileSpreadsheet className="h-4 w-4" />
				Import Tickets
			</DropdownMenuItem>
		);
	}

	return (
		<>
			<Button
				variant="outline"
				onClick={() => setOpen(true)}
				className="rounded-none"
			>
				<FileSpreadsheet className="mr-2 h-4 w-4" />
				Import Tickets
			</Button>
			<ImportDataDialog
				importType="tickets"
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
