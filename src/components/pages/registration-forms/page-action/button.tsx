"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreateRegistrationFormForm } from "../create-registration-form-form";

interface RegistrationFormPageButtonProps {
	eventId: string;
}

export function RegistrationFormPageButton({
	eventId,
}: RegistrationFormPageButtonProps) {
	const { openDialog, closeDialog } = useDialog();

	const handleCreateClick = () => {
		openDialog({
			component: CreateRegistrationFormForm,
			props: {
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Create Registration Form",
				description: "Add a new registration form for this event",
				size: "full",
			},
		});
	};

	return (
		<Button
			onClick={handleCreateClick}
			className="w-full gap-2 rounded-none lg:w-auto"
		>
			<Plus className="h-4 w-4" />
			Add Registration Form
		</Button>
	);
}
