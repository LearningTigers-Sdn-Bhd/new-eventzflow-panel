"use client";

import { FileText, MapPin, Store, Tag, User } from "lucide-react";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FieldApi {
	name: string;
	state: {
		value: string;
		meta: { errors: (string | undefined)[] };
	};
	handleBlur: () => void;
	handleChange: (value: string) => void;
}

const VENDOR_CATEGORIES = [
	"Food & Beverage",
	"Merchandise",
	"Services",
	"Entertainment",
	"Beauty & Wellness",
	"Travel & Transport",
	"Electronics",
	"Fashion & Apparel",
	"Health & Fitness",
	"Education",
	"Photography & Media",
	"Event Services",
	"Others",
] as const;

interface BusinessDetailsSectionProps {
	categoryField: FieldApi;
	customCategoryField: FieldApi;
	personInChargeField: FieldApi;
	descriptionField: FieldApi;
	addressField: FieldApi;
	notesField: FieldApi;
}

export function BusinessDetailsSection({
	categoryField,
	customCategoryField,
	personInChargeField,
	descriptionField,
	addressField,
	notesField,
}: BusinessDetailsSectionProps) {
	const [showCustomCategory, setShowCustomCategory] = useState(false);

	const handleCategoryChange = (value: string) => {
		categoryField.handleChange(value);
		if (value === "Others") {
			setShowCustomCategory(true);
		} else {
			setShowCustomCategory(false);
			customCategoryField.handleChange("");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 border-b pb-2">
				<Store className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Business Details</h3>
				<span className="text-muted-foreground text-sm">(Optional)</span>
			</div>

			<div className="grid gap-5">
				{/* Category and Person in Charge */}
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={categoryField.name}>Business Category</Label>
						<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<Tag className="h-4 w-4" />
							</InputGroupAddon>
							<Select
								value={categoryField.state.value}
								onValueChange={handleCategoryChange}
							>
								<SelectTrigger className="h-full flex-1 rounded-l-none border-0 bg-transparent shadow-none focus:ring-0">
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{VENDOR_CATEGORIES.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</InputGroup>
					</div>

					{showCustomCategory ? (
						<div className="space-y-2">
							<Label htmlFor={customCategoryField.name}>
								Custom Category Name
							</Label>
							<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
								<InputGroupAddon className="bg-muted/30 text-muted-foreground">
									<Tag className="h-4 w-4" />
								</InputGroupAddon>
								<InputGroupInput
									id={customCategoryField.name}
									type="text"
									placeholder="Enter your category"
									value={customCategoryField.state.value}
									onBlur={customCategoryField.handleBlur}
									onChange={(e) =>
										customCategoryField.handleChange(e.target.value)
									}
								/>
							</InputGroup>
						</div>
					) : (
						<div className="space-y-2">
							<Label htmlFor={personInChargeField.name}>Person In Charge</Label>
							<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
								<InputGroupAddon className="bg-muted/30 text-muted-foreground">
									<User className="h-4 w-4" />
								</InputGroupAddon>
								<InputGroupInput
									id={personInChargeField.name}
									type="text"
									placeholder="Contact person name"
									value={personInChargeField.state.value}
									onBlur={personInChargeField.handleBlur}
									onChange={(e) =>
										personInChargeField.handleChange(e.target.value)
									}
								/>
							</InputGroup>
						</div>
					)}
				</div>

				{/* Person in Charge (when custom category is shown) */}
				{showCustomCategory && (
					<div className="space-y-2">
						<Label htmlFor={personInChargeField.name}>Person In Charge</Label>
						<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<User className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={personInChargeField.name}
								type="text"
								placeholder="Contact person name"
								value={personInChargeField.state.value}
								onBlur={personInChargeField.handleBlur}
								onChange={(e) =>
									personInChargeField.handleChange(e.target.value)
								}
							/>
						</InputGroup>
					</div>
				)}

				{/* Description and Address */}
				<div className="grid gap-5 lg:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={descriptionField.name}>Business Description</Label>
						<div className="relative">
							<FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Textarea
								id={descriptionField.name}
								placeholder="Tell us about your business, products, or services..."
								className="min-h-[120px] resize-none pl-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
								value={descriptionField.state.value}
								onBlur={descriptionField.handleBlur}
								onChange={(e) => descriptionField.handleChange(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={addressField.name}>Business Address</Label>
						<div className="relative">
							<MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Textarea
								id={addressField.name}
								placeholder="Your business address"
								className="min-h-[120px] resize-none pl-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
								value={addressField.state.value}
								onBlur={addressField.handleBlur}
								onChange={(e) => addressField.handleChange(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* Notes */}
				<div className="space-y-2">
					<Label htmlFor={notesField.name}>Additional Notes</Label>
					<Textarea
						id={notesField.name}
						placeholder="Any additional information you'd like to share..."
						className="min-h-[80px] resize-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
						value={notesField.state.value}
						onBlur={notesField.handleBlur}
						onChange={(e) => notesField.handleChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
}
