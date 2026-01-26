"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEventById, updateEvent } from "@/lib/api/event";
import { queryClient } from "@/utils/rest-api";

interface CustomLabel {
	id: string;
	value: string;
}

interface CustomLabelFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function CustomLabelForm({
	eventId,
	onClose,
}: CustomLabelFormProps) {
	const [labels, setLabels] = useState<CustomLabel[]>([
		{ id: crypto.randomUUID(), value: "" },
	]);

	// Fetch event data to get existing labels
	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	// Update event mutation
	const updateEventMutation = useMutation({
		mutationFn: async (labelsData: Record<string, string>) => {
			return await updateEvent(eventId.toString(), {
				labels_data: labelsData,
			});
		},
		onSuccess: () => {
			toast.success("Custom labels saved successfully!");
			// Invalidate queries to refetch data
			queryClient.invalidateQueries({
				queryKey: ["event", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			// Close modal on success
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save custom labels");
		},
	});

	// Load existing labels when event data is fetched
	useEffect(() => {
		if (event?.labels_data && Object.keys(event.labels_data).length > 0) {
			const existingLabels = Object.entries(event.labels_data).map(
				([_key, value]: [string, string | unknown]) => ({
					id: crypto.randomUUID(),
					value: typeof value === "string" ? value : "",
				}),
			);
			setLabels(existingLabels);
		}
	}, [event]);

	const handleAddLabel = () => {
		setLabels([...labels, { id: crypto.randomUUID(), value: "" }]);
	};

	const handleRemoveLabel = (id: string) => {
		if (labels.length === 1) {
			toast.error("You must have at least one label field");
			return;
		}
		setLabels(labels.filter((label) => label.id !== id));
	};

	const handleLabelChange = (id: string, value: string) => {
		setLabels(
			labels.map((label) => (label.id === id ? { ...label, value } : label)),
		);
	};

	const handleSave = async () => {
		// Filter out empty labels
		const nonEmptyLabels = labels.filter((label) => label.value.trim());

		if (nonEmptyLabels.length === 0) {
			toast.error("Please add at least one custom label");
			return;
		}

		// Convert labels array to labels_data object
		// Format: { "role": "Role", "company": "Company", ... }
		// Keys are slugified versions of the values (lowercase, underscores)
		const labelsData = nonEmptyLabels.reduce(
			(acc, label) => {
				const trimmedValue = label.value.trim();
				// Convert "Phone Number" -> "phone_number", "T-shirt Size" -> "t_shirt_size"
				const key = trimmedValue
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "_") // Replace non-alphanumeric with underscore
					.replace(/^_|_$/g, ""); // Remove leading/trailing underscores
				acc[key] = trimmedValue;
				return acc;
			},
			{} as Record<string, string>,
		);

		// Update event with labels_data
		await updateEventMutation.mutateAsync(labelsData);
	};

	const handleReset = () => {
		// Reset to existing labels from backend or empty
		if (event?.labels_data && Object.keys(event.labels_data).length > 0) {
			const existingLabels = Object.entries(event.labels_data).map(
				([_key, value]: [string, string | unknown]) => ({
					id: crypto.randomUUID(),
					value: typeof value === "string" ? value : "",
				}),
			);
			setLabels(existingLabels);
		} else {
			setLabels([{ id: crypto.randomUUID(), value: "" }]);
		}
		toast.info("Form reset");
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading custom labels..."
				description="Please wait while we fetch the event labels"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load custom labels. Please try again.
			</div>
		);
	}

	return (
		<section className="h-full w-full">
			<FieldSet className="h-full w-full gap-1">
				<div className="flex flex-col items-start justify-between gap-2 pb-2 md:flex-row">
					<div className="flex-1">
						<FieldLegend className="font-bold text-xl!">
							Custom Labels
						</FieldLegend>
						<FieldDescription>
							Add custom fields for ticket registration. Example: Phone Number,
							T-shirt Size, Dietary Preferences, Emergency Contact, etc.
						</FieldDescription>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddLabel}
						disabled={updateEventMutation.isPending}
						className="w-full rounded-none py-6 md:w-auto md:py-2"
					>
						<Plus className="mr-2 size-4" />
						Add Another Label
					</Button>
				</div>
				<FieldSeparator />

				{/* Label Fields - Grid Layout: 2 columns on desktop, 1 on mobile */}
				<ScrollArea className="h-[calc(100vh-31rem)] w-full p-2 md:h-[calc(100vh-10rem)]">
					<div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2">
						{labels.map((label, index) => (
							<InputActionLabel
								key={label.id}
								label={`Label ${index + 1}`}
								htmlFor={label.id}
								value={label.value}
								onChange={(value) => handleLabelChange(label.id, value)}
								placeholder="e.g., Phone Number, T-shirt Size"
								disabled={updateEventMutation.isPending}
								variant="no-rounded"
								onAction={() => handleRemoveLabel(label.id)}
								actionIcon={<Trash2 className="size-4" />}
								actionLabel="Remove label"
								actionVariant="destructive"
								actionDisabled={labels.length === 1}
							/>
						))}
					</div>
				</ScrollArea>

				{/* Action Buttons */}
				<FieldGroup className="flex flex-col items-stretch justify-end gap-2 pt-4 md:flex-row md:items-end">
					<Button
						type="button"
						variant="outline"
						onClick={handleReset}
						disabled={updateEventMutation.isPending}
						className="w-full rounded-none py-6 md:w-auto md:py-2"
					>
						Reset
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={updateEventMutation.isPending}
						className="w-full rounded-none py-6 md:w-auto md:py-2"
					>
						{updateEventMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</FieldGroup>
			</FieldSet>
		</section>
	);
}
