"use client";

import { Building2, ExternalLink, FileText, Hash, Mail, Phone, Ruler, Tag, User } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

// Define the form values interface for exhibitor kit fields
interface ExhibitorKitFormValues {
	booth_number: string;
	booth_type: string;
	booth_dimensions: string;
	side_wall_left_required: boolean;
	side_wall_right_required: boolean;
	name_on_fascia: string;
	fascia_upgrade_required: boolean;
	company_name: string;
	company_address: string;
	pic_full_name: string;
	pic_contact_number: string;
	pic_email_address: string;
}

// Form type that has at least the exhibitor kit fields
interface FormWithExhibitorKitFields {
	Field: React.ComponentType<{
		name: keyof ExhibitorKitFormValues;
		children: (field: {
			name: string;
			state: {
				value: string | boolean;
				meta: { errors: (string | undefined)[] };
			};
			handleBlur: () => void;
			handleChange: (value: string | boolean) => void;
		}) => React.ReactNode;
	}>;
}

interface ExhibitorKitSectionProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: FormWithExhibitorKitFields | any;
	guidelinesPdfUrl?: string | null;
	customBoothTypes?: string[];
}

export function ExhibitorKitSection({
	form,
	guidelinesPdfUrl,
	customBoothTypes = [],
}: ExhibitorKitSectionProps) {
	const boothTypeOptions = useMemo(() => {
		const defaults = [
			{ value: "shell_scheme", label: "Shell Scheme" },
			{ value: "raw_space", label: "Raw Space" },
		];
		for (const type of customBoothTypes) {
			if (!defaults.some((o) => o.value === type)) {
				defaults.push({
					value: type,
					label: type
						.split("_")
						.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
						.join(" "),
				});
			}
		}
		return defaults;
	}, [customBoothTypes]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-2">
				<div className="flex items-center gap-2">
					<Building2 className="h-5 w-5 text-primary" />
					<h3 className="font-semibold text-lg">Exhibitor Details</h3>
				</div>
				{guidelinesPdfUrl && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="w-full rounded-none sm:w-auto"
						asChild
					>
						<a
							href={guidelinesPdfUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FileText className="mr-2 h-4 w-4" />
							View Guidelines
							<ExternalLink className="ml-2 h-3 w-3" />
						</a>
					</Button>
				)}
			</div>

			<p className="text-muted-foreground text-sm">
				Please provide your booth and company information for the exhibition.
			</p>

			{guidelinesPdfUrl && (
				<div className="bg-muted/50 border border-dashed p-3">
					<p className="text-muted-foreground text-sm">
						Make sure to review the exhibitor guidelines before submitting your registration.
					</p>
				</div>
			)}

			{/* Booth Information */}
			<div className="space-y-4">
				<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
					Booth Information
				</h4>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="booth_number">
						{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Booth Number</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<Hash className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="e.g., A-101"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
							</div>
						)}
					</form.Field>

					<form.Field name="booth_type">
						{(field: { name: string; state: { value: string }; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Booth Type</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger className="!h-11 w-full">
										<SelectValue placeholder="Select booth type" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{boothTypeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="booth_dimensions">
						{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Booth Dimensions</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<Ruler className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="e.g., 3m x 3m"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
							</div>
						)}
					</form.Field>

					<form.Field name="name_on_fascia">
						{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name on Fascia</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<Tag className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Company name to display (max 25 chars)"
										maxLength={25}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
								<p className="text-muted-foreground text-xs">
									{field.state.value.length}/25 characters
								</p>
							</div>
						)}
					</form.Field>
				</div>

				{/* Booth Options */}
				<div className="space-y-3">
					<div>
						<Label className="text-muted-foreground text-sm">Booth Options</Label>
						<p className="text-muted-foreground text-xs mt-1">
							Tick the boxes below if you need any of these options for your booth
						</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						<form.Field name="side_wall_left_required">
							{(field: { name: string; state: { value: boolean }; handleChange: (value: boolean) => void }) => (
								<div className="flex items-center space-x-2 border bg-muted p-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										className="bg-background"
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<Label
										htmlFor={field.name}
										className="font-normal text-sm cursor-pointer"
									>
										Left Side Wall Required
									</Label>
								</div>
							)}
						</form.Field>

						<form.Field name="side_wall_right_required">
							{(field: { name: string; state: { value: boolean }; handleChange: (value: boolean) => void }) => (
								<div className="flex items-center space-x-2 border bg-muted p-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										className="bg-background"
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<Label
										htmlFor={field.name}
										className="font-normal text-sm cursor-pointer"
									>
										Right Side Wall Required
									</Label>
								</div>
							)}
						</form.Field>

						<form.Field name="fascia_upgrade_required">
							{(field: { name: string; state: { value: boolean }; handleChange: (value: boolean) => void }) => (
								<div className="flex items-center space-x-2 border bg-muted p-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										className="bg-background"
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<Label
										htmlFor={field.name}
										className="font-normal text-sm cursor-pointer"
									>
										Fascia Upgrade Required
									</Label>
								</div>
							)}
						</form.Field>
					</div>
				</div>
			</div>

			{/* Company Information */}
			<div className="space-y-4">
				<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
					Company Information
				</h4>
				<div className="space-y-4">
					<form.Field name="company_name">
						{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Company Name</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<Building2 className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Your company name"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
							</div>
						)}
					</form.Field>

					<form.Field name="company_address">
						{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Company Address</Label>
								<Textarea
									id={field.name}
									placeholder="Full company address"
									rows={2}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Person In Charge */}
			<div className="space-y-4">
				<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
					Person In Charge (PIC) <span className="text-destructive">*</span>
				</h4>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="pic_full_name">
						{(field: { name: string; state: { value: string; meta: { errors: (string | undefined)[] } }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Full Name <span className="text-destructive">*</span>
								</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<User className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="PIC full name"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
									/>
								</InputGroup>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-xs">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="pic_contact_number">
						{(field: { name: string; state: { value: string; meta: { errors: (string | undefined)[] } }; handleBlur: () => void; handleChange: (value: string) => void }) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Contact Number <span className="text-destructive">*</span>
								</Label>
								<InputGroup className="h-11">
									<InputGroupAddon>
										<Phone className="h-4 w-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="+60 12-345 6789"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										required
									/>
								</InputGroup>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-xs">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name="pic_email_address">
					{(field: { name: string; state: { value: string }; handleBlur: () => void; handleChange: (value: string) => void }) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email Address</Label>
							<InputGroup className="h-11">
								<InputGroupAddon>
									<Mail className="h-4 w-4" />
								</InputGroupAddon>
								<InputGroupInput
									id={field.name}
									type="email"
									placeholder="pic@company.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value)
									}
								/>
							</InputGroup>
						</div>
					)}
				</form.Field>
			</div>
		</div>
	);
}
