"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreateTopicsForm } from "../form-modals/create-topics-form";

export function CreateTopicsButton() {
	const { openDialog } = useDialog();

	const handleOpen = () => {
		openDialog({
			component: CreateTopicsForm,
			config: {
				title: "Create Topic",
				description: "Add a new topic for resources.",
				size: "lg",
			},
		});
	};

	return (
		<Button onClick={handleOpen} className="w-full rounded-none md:w-auto">
			<Plus className="mr-2 h-4 w-4" />
			Create Topic
		</Button>
	);
}
