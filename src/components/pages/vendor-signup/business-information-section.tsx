"use client";

import {
	Building2,
	FileText,
	Handshake,
	ImageIcon,
	Package,
	Tag,
} from "lucide-react";
import { useState } from "react";
import ImageUpload from "@/components/file-upload/image-upload";
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

const BUSINESS_CATEGORIES = [
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
	"Manufacturing",
	"Technology",
	"Automotive",
	"Real Estate",
	"Finance & Banking",
	"Others",
] as const;

interface BusinessInformationSectionProps {
	categoryField: FieldApi;
	customCategoryField: FieldApi;
	descriptionField: FieldApi;
	companyProfileField: FieldApi;
	notesField: FieldApi;
	image: File | null;
	onImageChange: (file: File | null) => void;
}

export function BusinessInformationSection({
	categoryField,
	customCategoryField,
	descriptionField,
	companyProfileField,
	notesField,
	image,
	onImageChange,
}: BusinessInformationSectionProps) {
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
				<Building2 className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Business Information</h3>
			</div>

			<div className="grid gap-5">
				{/* Business Category */}
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={categoryField.name}>Business Category</Label>
						<InputGroup className="h-11">
							<InputGroupAddon>
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
									{BUSINESS_CATEGORIES.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</InputGroup>
					</div>

					{showCustomCategory && (
						<div className="space-y-2">
							<Label htmlFor={customCategoryField.name}>
								Custom Category Name
							</Label>
							<InputGroup className="h-11">
								<InputGroupAddon>
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
					)}
				</div>

				{/* Business Information / Products/Projects/Services to be Exhibited */}
				<div className="space-y-2">
					<Label htmlFor={descriptionField.name}>
						Business Information / Products / Projects / Services to be
						Exhibited
					</Label>
					<div className="relative">
						<Package className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Textarea
							id={descriptionField.name}
							placeholder="Describe the products, projects, or services you will be exhibiting..."
							className="min-h-[100px] resize-none pl-10"
							value={descriptionField.state.value}
							onBlur={descriptionField.handleBlur}
							onChange={(e) => descriptionField.handleChange(e.target.value)}
						/>
					</div>
				</div>

				{/* Company Profile */}
				<div className="space-y-2">
					<Label htmlFor={companyProfileField.name}>Company Profile</Label>
					<div className="relative">
						<FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Textarea
							id={companyProfileField.name}
							placeholder="Brief description of your company, history, and expertise..."
							className="min-h-[100px] resize-none pl-10"
							value={companyProfileField.state.value}
							onBlur={companyProfileField.handleBlur}
							onChange={(e) => companyProfileField.handleChange(e.target.value)}
						/>
					</div>
				</div>

				{/* Wishing to Connect With */}
				<div className="space-y-2">
					<Label htmlFor={notesField.name}>
						Wishing to Connect With (Sector's) / Additional Notes
					</Label>
					<div className="relative">
						<Handshake className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Textarea
							id={notesField.name}
							placeholder="Sectors or types of businesses you'd like to connect with, or any additional notes..."
							className="min-h-[80px] resize-none pl-10"
							value={notesField.state.value}
							onBlur={notesField.handleBlur}
							onChange={(e) => notesField.handleChange(e.target.value)}
						/>
					</div>
				</div>

				{/* Vendor Profile Image */}
				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						<ImageIcon className="h-4 w-4" />
						Vendor Profile Image
					</Label>
					<p className="text-muted-foreground text-xs">
						Upload your company logo or profile image (max 5MB)
					</p>
					<ImageUpload value={image || undefined} onChange={onImageChange} />
				</div>
			</div>
		</div>
	);
}
