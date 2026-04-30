"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { LoadingState } from "@/components/data-state";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import {
	getEventById,
	removeEventPoster,
	uploadEventPoster,
} from "@/lib/api/event";
import { API_BASE_URL, queryClient } from "@/utils/rest-api";

interface BrandingFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function BrandingForm({ eventId, onClose }: BrandingFormProps) {
	const [selectedPoster, setSelectedPoster] = useState<File | null>(null);
	const [removePoster, setRemovePoster] = useState(false);

	const { data: event, isLoading, error } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	// Reset local state when event data loads
	useEffect(() => {
		if (event) {
			setSelectedPoster(null);
			setRemovePoster(false);
		}
	}, [event?.id]);

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadEventPoster(eventId.toString(), file),
		onSuccess: () => {
			toast.success("Poster saved successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save poster");
		},
	});

	const removeMutation = useMutation({
		mutationFn: () => removeEventPoster(eventId.toString()),
		onSuccess: () => {
			toast.success("Poster removed successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove poster");
		},
	});

	const handleSave = async () => {
		if (selectedPoster) {
			await uploadMutation.mutateAsync(selectedPoster);
		} else if (removePoster) {
			await removeMutation.mutateAsync();
		}
	};

	const handleChange = (file: File | null) => {
		setSelectedPoster(file);
		setRemovePoster(file === null && !!event?.poster_url);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading poster settings..."
				description="Please wait while we fetch the event details"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load poster settings. Please try again.
			</div>
		);
	}

	const isPending = uploadMutation.isPending || removeMutation.isPending;

	// Build the value passed to ImageUpload:
	// - If user picked a new file, pass the File
	// - If remove was requested, pass nothing (null → component shows empty)
	// - Otherwise show the existing poster from API
	const existingPosterUrl = event?.poster_url
		? `${API_BASE_URL}${event.poster_url}`
		: undefined;

	const imageValue: string | File | undefined = selectedPoster
		? selectedPoster
		: removePoster
			? undefined
			: existingPosterUrl;

	const hasChanges = selectedPoster !== null || removePoster;

	return (
		<section className="h-full w-full px-0 pb-8 md:px-6">
			<FormGroupContainer
				title={{
					icon: ImageIcon,
					label: "Event Poster",
					description:
						"Upload your poster to display it on the public registration page.",
				}}
			>
				<div className="flex flex-col gap-6">
					<ImageUpload
						value={imageValue}
						onChange={handleChange}
						disabled={isPending}
						maxSize={2 * 1024 * 1024}
					/>

					<div className="flex justify-end">
						<Button
							type="button"
							onClick={handleSave}
							disabled={isPending || !hasChanges}
							className="w-full rounded-none py-6 lg:w-auto lg:py-0"
						>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>
			</FormGroupContainer>
		</section>
	);
}
