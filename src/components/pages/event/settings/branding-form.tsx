"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { LoadingState } from "@/components/data-state";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { getEventById, removeEventLogo, uploadEventLogo } from "@/lib/api/event";
import { API_BASE_URL, queryClient } from "@/utils/rest-api";

interface BrandingFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function BrandingForm({ eventId, onClose }: BrandingFormProps) {
	const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
	const [removeLogo, setRemoveLogo] = useState(false);

	const { data: event, isLoading, error } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	// Reset local state when event data loads
	useEffect(() => {
		if (event) {
			setSelectedLogo(null);
			setRemoveLogo(false);
		}
	}, [event?.id]);

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadEventLogo(eventId.toString(), file),
		onSuccess: () => {
			toast.success("Logo saved successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save logo");
		},
	});

	const removeMutation = useMutation({
		mutationFn: () => removeEventLogo(eventId.toString()),
		onSuccess: () => {
			toast.success("Logo removed successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove logo");
		},
	});

	const handleSave = async () => {
		if (selectedLogo) {
			await uploadMutation.mutateAsync(selectedLogo);
		} else if (removeLogo) {
			await removeMutation.mutateAsync();
		}
	};

	const handleChange = (file: File | null) => {
		setSelectedLogo(file);
		setRemoveLogo(file === null && !!event?.logo_url);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading branding settings..."
				description="Please wait while we fetch the event details"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load branding settings. Please try again.
			</div>
		);
	}

	const isPending = uploadMutation.isPending || removeMutation.isPending;

	// Build the value passed to ImageUpload:
	// - If user picked a new file, pass the File
	// - If remove was requested, pass nothing (null → component shows empty)
	// - Otherwise show the existing logo from API
	const existingLogoUrl = event?.logo_url
		? `${API_BASE_URL}${event.logo_url}`
		: undefined;

	const imageValue: string | File | undefined = selectedLogo
		? selectedLogo
		: removeLogo
			? undefined
			: existingLogoUrl;

	const hasChanges = selectedLogo !== null || removeLogo;

	return (
		<section className="h-full w-full px-0 pb-8 md:px-6">
			<FormGroupContainer
				title={{
					icon: ImageIcon,
					label: "Event Branding",
					description:
						"Upload your logo to display it on the public registration page.",
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
