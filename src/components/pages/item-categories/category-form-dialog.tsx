"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { createItemCategory } from "@/lib/api/item-category";

export function CategoryFormContent() {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [active, setActive] = useState(true);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const createMutation = useMutation({
		mutationFn: createItemCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["item-categories"] });
			toast.success("Category created successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to create category", {
				description: error.message,
			});
		},
	});

	const isPending = createMutation.isPending;

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		} else if (name.length > 100) {
			newErrors.name = "Name is too long (max 100 characters)";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		createMutation.mutate({
			name: name.trim(),
			active,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex h-full flex-col justify-between gap-4 p-0 md:p-4"
		>
			<div className="space-y-4">
				<FormGroupContainer
					title={{
						icon: Tag,
						label: "Item Category's Information",
						description: "Enter the details for the new category.",
					}}
				>
					<div className="flex flex-col gap-4">
						<InputLabel
							label="Name"
							description="Enter the name of the category"
							value={name}
							onChange={setName}
							placeholder="Enter category name"
							disabled={isPending}
							required
							isInvalid={!!errors.name}
							errors={errors.name ? [{ message: errors.name }] : undefined}
						/>
						<SwitchCardInput
							label="Active"
							description="Toggle for active/inactive categories. Inactive categories will not be available for selection"
							checked={active}
							onCheckedChange={setActive}
							disabled={isPending}
							variant="no-rounded"
							border={true}
							className="px-0"
						/>
					</div>
				</FormGroupContainer>
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
					className="w-full rounded-none py-6 md:w-auto md:py-2"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isPending}
					className="w-full rounded-none py-6 md:w-auto md:py-2"
				>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Create
				</Button>
			</div>
		</form>
	);
}
