"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import type { ApiKey } from "./columns";
import DeleteApiKeyDialog from "./delete-api-key-dialog";

interface ApiKeyActionsMenuProps {
	apiKey: ApiKey;
}

export function ApiKeyActionsMenu({ apiKey }: ApiKeyActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleDelete = () => {
		setIsDropdownOpen(false);
		openDialog({
			component: DeleteApiKeyDialog,
			props: {
				apiKey,
				onClose: closeDialog,
			},
			config: {
				title: "Revoke API Key",
				description:
					"Are you sure you want to revoke this API key? This action cannot be undone.",
				size: "md",
			},
		});
	};

	return (
		<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDelete}
					className="text-red-600 focus:text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Revoke Key
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
