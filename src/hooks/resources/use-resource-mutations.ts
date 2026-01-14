import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";

interface UseResourceMutationsProps {
	resourceName: string;
	queryKey: string[];
	archiveFn?: (id: string) => Promise<unknown>;
	deleteFn: (id: string) => Promise<unknown>;
	restoreFn?: (id: string) => Promise<unknown>;
	duplicateFn?: (id: string) => Promise<unknown>;
}

export function useResourceMutations({
	resourceName,
	queryKey,
	archiveFn,
	deleteFn,
	restoreFn,
	duplicateFn,
}: UseResourceMutationsProps) {
	const queryClient = useQueryClient();
	const { closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();

	const archiveMutation = useMutation({
		mutationFn: archiveFn || (async () => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${resourceName} archived successfully`);
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(`Failed to archive ${resourceName}`, {
				description: error.message,
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${resourceName} removed successfully`);
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(`Failed to remove ${resourceName}`, {
				description: error.message,
			});
		},
	});

	const restoreMutation = useMutation({
		mutationFn: restoreFn || (async () => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${resourceName} restored successfully`);
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(`Failed to restore ${resourceName}`, {
				description: error.message,
			});
		},
	});

	const duplicateMutation = useMutation({
		mutationFn: duplicateFn || (async () => {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${resourceName} duplicated successfully`);
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(`Failed to duplicate ${resourceName}`, {
				description: error.message,
			});
		},
	});

	const handleArchive = (id: string) => {
		if (!archiveFn) return;
		openConfirm({
			title: `Archive ${resourceName}`,
			message: `Are you sure you want to archive this ${resourceName.toLowerCase()}? It can be restored later.`,
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			onConfirm: () => archiveMutation.mutate(id),
		});
	};

	const handleDelete = (id: string, customMessage?: string) => {
		openConfirm({
			title: `Remove ${resourceName}`,
			message:
				customMessage ||
				`Are you sure you want to permanently delete this ${resourceName.toLowerCase()}? This action cannot be undone.`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => deleteMutation.mutate(id),
		});
	};

	const handleRestore = (id: string) => {
		if (!restoreFn) return;
		openConfirm({
			title: `Restore ${resourceName}`,
			message: `Are you sure you want to restore this ${resourceName.toLowerCase()}?`,
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			icon: "check",
			onConfirm: () => restoreMutation.mutate(id),
		});
	};

	const handleDuplicate = (id: string) => {
		if (!duplicateFn) return;
		openConfirm({
			title: `Duplicate ${resourceName}`,
			message: `Are you sure you want to duplicate this ${resourceName.toLowerCase()}? A copy will be created in draft status.`,
			confirmLabel: "Duplicate",
			cancelLabel: "Cancel",
			type: "info",
			icon: "info",
			onConfirm: () => duplicateMutation.mutate(id),
		});
	};

	return {
		handleArchive,
		handleDelete,
		handleRestore,
		handleDuplicate,
		isArchiving: archiveMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isRestoring: restoreMutation.isPending,
		isDuplicating: duplicateMutation.isPending,
	};
}
