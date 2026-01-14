"use client";

import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import { useResourceMutations } from "@/hooks/resources/use-resource-mutations";
import {
	deleteResourceTopic,
	forceDeleteResourceTopic,
	restoreResourceTopic,
} from "@/lib/api/resource/topic";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { EditTopicsForm } from "./form-modals/edit-topics-form";

interface TopicsActionMenuProps {
	topic: ResourceTopic;
}

export function TopicsActionMenu({ topic }: TopicsActionMenuProps) {
	const { openDialog } = useDialog();

	const { handleArchive, handleDelete, handleRestore } = useResourceMutations({
		resourceName: "Topic",
		queryKey: ["resource-topics"],
		archiveFn: deleteResourceTopic,
		deleteFn: forceDeleteResourceTopic,
		restoreFn: restoreResourceTopic,
	});

	const isDeleted = !!topic.deletedAt;

	const handleEdit = () => {
		openDialog({
			component: EditTopicsForm,
			props: { topic },
			config: {
				title: "Edit Topic",
				description: "Edit the details of the topic.",
				size: "lg",
			},
		});
	};

	return (
		<ButtonGroup>
			{!isDeleted && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
						onClick={handleEdit}
						title="Edit Topic"
					>
						<Pencil className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-amber-500 hover:bg-amber-50 hover:text-amber-600 [&_svg]:text-amber-500 hover:[&_svg]:text-amber-600"
						onClick={() => handleArchive(topic.id)}
						title="Archive Topic"
					>
						<Archive className="size-4" />
					</Button>
				</>
			)}

			{isDeleted && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
						onClick={() => handleRestore(topic.id)}
						title="Restore Topic"
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
						onClick={() => handleDelete(topic.id)}
						title="Delete Permanently"
					>
						<Trash2 className="size-4" />
					</Button>
				</>
			)}
		</ButtonGroup>
	);
}
