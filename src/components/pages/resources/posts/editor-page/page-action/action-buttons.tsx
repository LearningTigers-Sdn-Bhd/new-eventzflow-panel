"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EditPostForm } from "@/components/pages/resources/posts/form-modals/edit-post-form";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { updateResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";

interface ResourceEditorActionButtonsProps {
	resource: Resource;
	isPreviewMode: boolean;
	onTogglePreviewMode: () => void;
}

export function ResourceEditorActionButtons({
	resource,
	isPreviewMode,
	onTogglePreviewMode,
}: ResourceEditorActionButtonsProps) {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const updateStatusMutation = useMutation({
		mutationFn: updateResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			queryClient.invalidateQueries({
				queryKey: ["resource", resource.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["resource", resource.slug],
			});
			toast.success("Resource status updated");
		},
		onError: (error: Error) => {
			toast.error("Failed to update status", {
				description: error.message,
			});
		},
	});

	const handleStatusUpdate = (newStatus: "pending_review" | "draft") => {
		updateStatusMutation.mutate({
			id: resource.id,
			status: newStatus,
		});
	};

	const openResourceSettings = () => {
		openDialog({
			component: EditPostForm,
			config: {
				title: "Edit Post Details",
				size: "full",
			},
			props: {
				resource,
			},
		});
	};

	return (
		<div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
			{resource.status === "draft" && (
				<Button
					className="rounded-none border py-6 md:py-4"
					variant="secondary"
					onClick={() => handleStatusUpdate("pending_review")}
					disabled={updateStatusMutation.isPending}
				>
					<Send className="mr-2 h-4 w-4" />
					<span>Submit Post</span>
				</Button>
			)}

			{resource.status === "pending_review" && (
				<Button
					className="rounded-none border py-6 md:py-4"
					variant="secondary"
					onClick={() => handleStatusUpdate("draft")}
					disabled={updateStatusMutation.isPending}
				>
					<XCircle className="mr-2 h-4 w-4" />
					<span>Cancel Review</span>
				</Button>
			)}

			<Button
				className="rounded-none border py-6 md:py-4"
				variant="secondary"
				onClick={onTogglePreviewMode}
			>
				{isPreviewMode ? (
					<>
						<EyeOff className="mr-2 h-4 w-4" />
						<span>Edit Mode</span>
					</>
				) : (
					<>
						<Eye className="mr-2 h-4 w-4" />
						<span>Preview Mode</span>
					</>
				)}
			</Button>

			<Button
				className="rounded-none border py-6 md:py-4"
				variant="outline"
				onClick={openResourceSettings}
			>
				<Pencil className="mr-2 h-4 w-4" />
				<span>
					Edit Post <span className="inline md:hidden lg:inline">Details</span>
				</span>
			</Button>
		</div>
	);
}
