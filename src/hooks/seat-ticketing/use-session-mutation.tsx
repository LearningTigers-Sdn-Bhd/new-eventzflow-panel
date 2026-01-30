import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDialog } from "@/hooks/use-dialog";
import type {
	CreateSeatSessionRequest,
	UpdateSeatSessionRequest,
} from "@/lib/api/seat-ticketing";
import {
	archiveSeatSession,
	createSeatSession,
	forceDeleteSeatSession,
	restoreSeatSession,
	updateSeatSession,
} from "@/lib/api/seat-ticketing";

interface UseSeatSessionMutationOptions {
	queryKey: Array<string | number | boolean>;
}

export function useSeatSessionMutation({
	queryKey,
}: UseSeatSessionMutationOptions) {
	const queryClient = useQueryClient();
	const { closeDialog } = useDialog();

	const createMutation = useMutation({
		mutationFn: (data: CreateSeatSessionRequest) => createSeatSession(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("Seat session created successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to create seat session", {
				description: error.message,
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: (params: {
			sessionId: string;
			data: UpdateSeatSessionRequest;
		}) => updateSeatSession(params.sessionId, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("Seat session updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update seat session", {
				description: error.message,
			});
		},
	});

	const archiveMutation = useMutation({
		mutationFn: (sessionId: string) => archiveSeatSession(sessionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("Seat session archived");
		},
		onError: (error: Error) => {
			toast.error("Failed to archive seat session", {
				description: error.message,
			});
		},
	});

	const restoreMutation = useMutation({
		mutationFn: (sessionId: string) => restoreSeatSession(sessionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("Seat session restored");
		},
		onError: (error: Error) => {
			toast.error("Failed to restore seat session", {
				description: error.message,
			});
		},
	});

	const forceDeleteMutation = useMutation({
		mutationFn: (sessionId: string) => forceDeleteSeatSession(sessionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("Seat session deleted");
		},
		onError: (error: Error) => {
			toast.error("Failed to delete seat session", {
				description: error.message,
			});
		},
	});

	return {
		createMutation,
		updateMutation,
		archiveMutation,
		restoreMutation,
		forceDeleteMutation,
	};
}
