"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { approveResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";
import { RejectForm } from "./form-modals/reject-form";

interface PostApprovalActionMenuProps {
	post: Resource;
}

export function PostApprovalActionMenu({ post }: PostApprovalActionMenuProps) {
	const { openConfirm } = useConfirmDialog();
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const approvalMutation = useMutation({
		mutationFn: approveResource,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["resources-approval"] });
			toast.success(
				`Post ${variables.status === "published" ? "approved" : "rejected"} successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error("Failed to update post status", {
				description: error.message,
			});
		},
	});

	const handleApprove = () => {
		openConfirm({
			title: "Approve Post",
			message: "Are you sure you want to approve and publish this post?",
			confirmLabel: "Approve",
			cancelLabel: "Cancel",
			type: "success",
			icon: "check",
			onConfirm: () =>
				approvalMutation.mutate({
					id: post.id,
					status: "published",
				}),
		});
	};

	const handleReject = () => {
		openDialog({
			component: RejectForm,
			config: {
				title: "Reject Post",
				description: "Provide a reason for rejecting this post.",
			},
			props: {
				resource: post,
			},
		});
	};

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={handleApprove}
				title="Approve Post"
			>
				<Check className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
				onClick={handleReject}
				title="Reject Post"
			>
				<X className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
