"use client";

import { Pencil, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PassBundle } from "@/lib/api/pass-bundle";

interface PassBundleActionsMenuProps {
	bundle: PassBundle;
	onEdit: (bundle: PassBundle) => void;
	onQr: (bundle: PassBundle) => void;
	onDelete: (bundle: PassBundle) => void;
}

export function PassBundleActionsMenu({
	bundle,
	onEdit,
	onQr,
	onDelete,
}: PassBundleActionsMenuProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={() => onEdit(bundle)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Edit</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={() => onQr(bundle)}
						>
							<QrCode className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">QR Code</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none text-red-600 hover:text-red-600"
							onClick={() => onDelete(bundle)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Delete</TooltipContent>
				</Tooltip>
			</ButtonGroup>
		</TooltipProvider>
	);
}
