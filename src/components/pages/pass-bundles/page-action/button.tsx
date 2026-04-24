"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { PassBundleForm } from "../pass-bundle-form";

interface PassBundlePageButtonProps {
	eventId: string;
}

export function PassBundlePageButton({ eventId }: PassBundlePageButtonProps) {
	const { openDialog, closeDialog } = useDialog();

	const handleCreateClick = () => {
		openDialog({
			component: PassBundleForm,
			props: {
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Create Pass Bundle",
				description: "Create a private bundle link for an invited entity.",
				size: "2xl",
				className: "rounded-none",
			},
		});
	};

	return (
		<Button
			onClick={handleCreateClick}
			className="w-full gap-2 rounded-none lg:w-auto"
		>
			<Plus className="h-4 w-4" />
			Add Pass Bundle
		</Button>
	);
}
