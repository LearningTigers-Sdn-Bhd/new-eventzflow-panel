"use client";

import { useState } from "react";
import { Search, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import type { RentableItem } from "@/lib/api/rentable-item";

interface LinkItemDialogProps {
	availableItems: RentableItem[];
	onLink: (rentableItemId: number) => void;
}

export function LinkItemDialog({
	availableItems,
	onLink,
}: LinkItemDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
	const { closeDialog } = useDialog();

	const filteredItems = availableItems.filter(
		(item) =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.itemCategory?.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleLink = () => {
		if (selectedItemId) {
			onLink(selectedItemId);
		}
	};

	const toggleSelection = (itemId: number) => {
		setSelectedItemId(selectedItemId === itemId ? null : itemId);
	};

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search items..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-9 rounded-none pl-9"
				/>
			</div>

			<div className="max-h-[400px] overflow-y-auto">
				{filteredItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<Package className="mb-2 h-8 w-8 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">
							{searchQuery
								? "No items found matching your search"
								: "No available items to link"}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3">
						{filteredItems.map((item) => {
							const isSelected = selectedItemId === item.id;
							return (
								<div
									key={item.id}
									onClick={() => toggleSelection(item.id)}
									className={cn(
										"relative cursor-pointer rounded-none border-2 p-4 transition-all hover:border-primary/50 hover:bg-accent/50",
										isSelected
											? "border-primary bg-primary/5"
											: "border-border"
									)}
								>
									{/* Selection indicator */}
									<div
										className={cn(
											"absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-sm border-2 transition-all",
											isSelected
												? "border-primary bg-primary text-primary-foreground"
												: "border-muted-foreground/30"
										)}
									>
										{isSelected && <Check className="h-3 w-3" />}
									</div>

									<div className="space-y-2 pr-6">
										<div className="flex flex-col gap-1">
											<h4 className="font-medium leading-tight">{item.name}</h4>
											{item.itemCategory && (
												<Badge variant="outline" className="w-fit rounded-none text-xs">
													{item.itemCategory.name}
												</Badge>
											)}
										</div>
										{item.description && (
											<p className="line-clamp-2 text-muted-foreground text-xs">
												{item.description}
											</p>
										)}
										<div className="flex flex-col gap-0.5 text-muted-foreground text-xs">
											<span>Unit: {item.unitOfMeasure}</span>
											<span className="font-medium text-foreground">
												RM {Number(item.defaultPrice).toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					onClick={handleLink}
					disabled={!selectedItemId}
					className="rounded-none"
				>
					Link Selected Item
				</Button>
			</div>
		</div>
	);
}
