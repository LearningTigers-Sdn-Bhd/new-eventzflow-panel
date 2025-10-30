"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
				([key, value]: [string, string | unknown]) => ({
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
		// Format: { "Label 1": "Display Name", "Label 2": "Another Name", ... }
		const labelsData = nonEmptyLabels.reduce(
			(acc, label, index) => {
				acc[`Label ${index + 1}`] = label.value.trim();
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
				([key, value]: [string, string | unknown]) => ({
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
		<section className="w-full">
			<FieldSet>
				<div className="flex items-start justify-between">
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
						className="ml-4 shrink-0"
					>
						<Plus className="mr-2 size-4" />
						Add Another Label
					</Button>
				</div>
				<FieldSeparator />

				{/* Label Fields - Grid Layout: 2 columns on desktop, 1 on mobile */}
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{labels.map((label, index) => (
						<div key={label.id} className="flex items-end gap-2">
							<div className="flex-1">
								<Field orientation="vertical">
									<FieldLabel htmlFor={label.id} className="mb-2">
										Label {index + 1}
									</FieldLabel>
									<Input
										id={label.id}
										value={label.value}
										onChange={(e) =>
											handleLabelChange(label.id, e.target.value)
										}
										placeholder={"e.g., Phone Number, T-shirt Size"}
										disabled={updateEventMutation.isPending}
									/>
								</Field>
							</div>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => handleRemoveLabel(label.id)}
								disabled={labels.length === 1 || updateEventMutation.isPending}
								className="shrink-0"
								title="Remove label"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					))}
				</div>

				<FieldSeparator className="mt-6" />

				{/* Action Buttons */}
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleReset}
						disabled={updateEventMutation.isPending}
					>
						Reset
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={updateEventMutation.isPending}
					>
						{updateEventMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</FieldSet>
		</section>
	);
}
