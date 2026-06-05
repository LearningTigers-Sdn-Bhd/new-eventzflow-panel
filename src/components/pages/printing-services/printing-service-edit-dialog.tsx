"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDialog } from "@/hooks/use-dialog";
import { getItemCategories } from "@/lib/api/item-category";
import type { PrintingService } from "@/lib/api/printing-service";
import { updatePrintingService } from "@/lib/api/printing-service";

interface PrintingServiceEditContentProps {
	service: PrintingService;
}

export function PrintingServiceEditContent({
	service,
}: PrintingServiceEditContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const [name, setName] = useState(service.name);
	const [description, setDescription] = useState(service.description ?? "");
	const [unitOfMeasure, setUnitOfMeasure] = useState(service.unitOfMeasure);
	const [defaultPrice, setDefaultPrice] = useState(
		String(service.defaultPrice),
	);
	const [status, setStatus] = useState<"active" | "inactive">(service.status);
	const [categoryId, setCategoryId] = useState(String(service.itemCategoryId));
	const [image, setImage] = useState<File | null>(null);
	const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(
		service.imageUrl ?? undefined,
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: categories = [], isLoading: categoriesLoading } = useQuery({
		queryKey: ["item-categories"],
		queryFn: getItemCategories,
	});

	const activeCategories = categories.filter((c) => c.active);

	const updateMutation = useMutation({
		mutationFn: updatePrintingService,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["printing-services"] });
			toast.success("Printing service updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update printing service", {
				description: error.message,
			});
		},
	});

	const isPending = updateMutation.isPending;

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		}
		if (!unitOfMeasure.trim()) {
			newErrors.unitOfMeasure = "Unit of measure is required";
		}
		if (!defaultPrice || Number.isNaN(Number(defaultPrice))) {
			newErrors.defaultPrice = "Valid price is required";
		} else if (Number(defaultPrice) < 0) {
			newErrors.defaultPrice = "Price must be 0 or greater";
		}
		if (!categoryId) {
			newErrors.categoryId = "Category is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const removeImage = !image && !currentImageUrl && !!service.imageUrl;

		updateMutation.mutate({
			id: service.id,
			name: name.trim(),
			description: description.trim() || undefined,
			unit_of_measure: unitOfMeasure.trim(),
			default_price: Number(defaultPrice),
			status,
			item_category_id: Number(categoryId),
			image: image ?? undefined,
			remove_image: removeImage,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">
						Name <span className="text-destructive">*</span>
					</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter service name"
						disabled={isPending}
					/>
					{errors.name && (
						<p className="text-destructive text-sm">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="category">
						Category <span className="text-destructive">*</span>
					</Label>
					<Select
						value={categoryId}
						onValueChange={setCategoryId}
						disabled={isPending || categoriesLoading}
					>
						<SelectTrigger className="h-9 w-full rounded-none border border-input bg-transparent px-3 py-1 text-base shadow-xs">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							{activeCategories.map((category) => (
								<SelectItem
									key={category.id}
									value={String(category.id)}
									className="rounded-none"
								>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.categoryId && (
						<p className="text-destructive text-sm">{errors.categoryId}</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Enter service description (optional)"
					disabled={isPending}
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label>Image</Label>
				<ImageUpload
					value={image ?? currentImageUrl}
					onChange={(file) => {
						setImage(file);
						if (file === null) {
							setCurrentImageUrl(undefined);
						}
					}}
					disabled={isPending}
					maxSize={5 * 1024 * 1024}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="unitOfMeasure">
						Unit of Measure <span className="text-destructive">*</span>
					</Label>
					<Input
						id="unitOfMeasure"
						value={unitOfMeasure}
						onChange={(e) => setUnitOfMeasure(e.target.value)}
						placeholder="e.g., sq ft, unit, per meter"
						disabled={isPending}
					/>
					{errors.unitOfMeasure && (
						<p className="text-destructive text-sm">{errors.unitOfMeasure}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="defaultPrice">
						Default Price (MYR) <span className="text-destructive">*</span>
					</Label>
					<Input
						id="defaultPrice"
						type="number"
						step="0.01"
						min="0"
						value={defaultPrice}
						onChange={(e) => setDefaultPrice(e.target.value)}
						placeholder="0.00"
						disabled={isPending}
					/>
					{errors.defaultPrice && (
						<p className="text-destructive text-sm">{errors.defaultPrice}</p>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label htmlFor="status">Active</Label>
					<p className="text-muted-foreground text-sm">
						Inactive services won't be available
					</p>
				</div>
				<Switch
					id="status"
					checked={status === "active"}
					onCheckedChange={(checked) =>
						setStatus(checked ? "active" : "inactive")
					}
					disabled={isPending}
				/>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Changes
				</Button>
			</div>
		</form>
	);
}
