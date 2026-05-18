"use client";

import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useResourceMutations } from "@/hooks/resources/use-resource-mutations";
import { useDialog } from "@/hooks/use-dialog";
import {
	deleteResourceMediaType,
	forceDeleteResourceMediaType,
	restoreResourceMediaType,
} from "@/lib/api/resource/media-type";
import type { ResourceMediaType } from "@/lib/api/resource/media-type/response";
import { EditMediaTypeForm } from "./form-modals/edit-media-type-form";

interface MediaTypeActionMenuProps {
	mediaType: ResourceMediaType;
}

export function MediaTypeActionMenu({ mediaType }: MediaTypeActionMenuProps) {
	const { openDialog } = useDialog();

	const { handleArchive, handleDelete, handleRestore } = useResourceMutations({
		resourceName: "Media Type",
		queryKey: ["resource-media-types"],
		archiveFn: deleteResourceMediaType,
		deleteFn: forceDeleteResourceMediaType,
		restoreFn: restoreResourceMediaType,
	});

	const isDeleted = !!mediaType.deletedAt;

	const handleEdit = () => {
		openDialog({
			component: EditMediaTypeForm,
			props: { mediaType },
			config: {
				title: "Edit Media Type",
				description: "Edit the details of the media type.",
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
						title="Edit Media Type"
					>
						<Pencil className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-amber-500 hover:bg-amber-50 hover:text-amber-600 [&_svg]:text-amber-500 hover:[&_svg]:text-amber-600"
						onClick={() => handleArchive(mediaType.id)}
						title="Archive Media Type"
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
						onClick={() => handleRestore(mediaType.id)}
						title="Restore Media Type"
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
						onClick={() => handleDelete(mediaType.id)}
						title="Delete Permanently"
					>
						<Trash2 className="size-4" />
					</Button>
				</>
			)}
		</ButtonGroup>
	);
}
