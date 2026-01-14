"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreatePostForm } from "../form-modals/create-post-form";

export function CreatePostButton() {
	const { openDialog } = useDialog();

	const handleOpen = () => {
		openDialog({
			component: CreatePostForm,
			config: {
				title: "Create Post",
				description: "Add a new resource post.",
				size: "full",
			},
		});
	};

	return (
		<Button onClick={handleOpen} className="w-full rounded-none md:w-auto">
			<Plus className="mr-2 h-4 w-4" />
			Create Post
		</Button>
	);
}
