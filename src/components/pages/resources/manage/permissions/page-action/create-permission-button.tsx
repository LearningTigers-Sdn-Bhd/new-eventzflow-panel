"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import CreatePermissionForm from "./create-permission-form";

export function PermissionsPageButton() {
	const { openDialog, closeDialog } = useDialog();

	const handleGrantPermission = () => {
		openDialog({
			component: CreatePermissionForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Grant Resource Permission",
				description: "Grant write permission to team members",
				size: "md",
			},
		});
	};

	return (
		<div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
			<Button
				onClick={handleGrantPermission}
				className="w-full rounded-none py-6 md:w-auto md:py-4"
			>
				<Plus className="mr-2 h-4 w-4" />
				Grant Permission
			</Button>
		</div>
	);
}
