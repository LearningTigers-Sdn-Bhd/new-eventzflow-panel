"use client";

import { Plus, X } from "lucide-react";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

interface AddPrizeCardProps {
	isOpen: boolean;
	name: string;
	quantity: number;
	image: File | null;
	onNameChange: (name: string) => void;
	onQuantityChange: (quantity: number) => void;
	onImageChange: (image: File | null) => void;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}

export function AddPrizeCard({
	isOpen,
	name,
	quantity,
	image,
	onNameChange,
	onQuantityChange,
	onImageChange,
	onOpenChange,
	onSubmit,
	onCancel,
	isSubmitting,
}: AddPrizeCardProps) {
	return (
		<Card
			className="gap-0! rounded-none border-dashed py-4 shadow-none"
			onClick={() => {
				if (!isOpen) {
					onOpenChange(true);
				}
			}}
		>
			{isOpen ? (
				<>
					<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
						<CardTitle>Add Prize Item</CardTitle>
						<CardDescription>
							Add a new prize item to the list for roulette draws.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-6 py-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="new-prize-image">Prize Image</Label>
							<div className="h-40 w-full">
								<ImageUpload
									value={image || undefined}
									onChange={onImageChange}
									fillHeight
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="new-prize-name">Prize Name</Label>
							<Input
								id="new-prize-name"
								placeholder="e.g., Gift Card, Cash Prize, etc."
								value={name}
								onChange={(e) => onNameChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										onSubmit();
									}
								}}
								className="rounded-none"
							/>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div className="col-span-2 flex flex-col justify-center gap-1">
								<Label className="text-balance">Quantity</Label>
								<p className="text-balance text-muted-foreground text-sm">
									Enter the total quantity available for this prize.
								</p>
							</div>
							<div className="col-span-1 flex items-center justify-end">
								<NumberInput
									value={quantity}
									onChange={onQuantityChange}
									min={1}
									max={999}
									className="rounded-none"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end gap-2 border-t">
						<Button
							variant="outline"
							onClick={(e) => {
								e.stopPropagation();
								onCancel();
							}}
							className="gap-2 rounded-none"
						>
							<X className="size-4" />
							Cancel
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onSubmit();
							}}
							disabled={isSubmitting}
							className="gap-2 rounded-none"
						>
							<Plus className="size-4" />
							Submit
						</Button>
					</CardFooter>
				</>
			) : (
				<CardContent className="flex cursor-pointer items-center justify-center gap-2 p-4 text-muted-foreground">
					<Plus className="size-4" />
					Add Prize
				</CardContent>
			)}
		</Card>
	);
}
