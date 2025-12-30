"use client";

import { Building2, ExternalLink, FileText, Hash, Mail, Phone, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ExhibitorKitSectionProps {
	boothNumberField: FieldApi;
	boothTypeField: FieldApi;
	nameOnFasciaField: FieldApi;
	companyNameField: FieldApi;
	companyAddressField: FieldApi;
	picFullNameField: FieldApi;
	picContactNumberField: FieldApi;
	picEmailAddressField: FieldApi;
	guidelinesPdfUrl?: string | null;
}

export function ExhibitorKitSection({
	boothNumberField,
	boothTypeField,
	nameOnFasciaField,
	companyNameField,
	companyAddressField,
	picFullNameField,
	picContactNumberField,
	picEmailAddressField,
	guidelinesPdfUrl,
}: ExhibitorKitSectionProps) {
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
						className="w-full sm:w-auto"
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
					<div className="space-y-2">
						<Label htmlFor={boothNumberField.name}>Booth Number</Label>
						<InputGroup className="h-11">
							<InputGroupAddon>
								<Hash className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={boothNumberField.name}
								placeholder="e.g., A-101"
								value={boothNumberField.state.value}
								onBlur={boothNumberField.handleBlur}
								onChange={(e) => boothNumberField.handleChange(e.target.value)}
							/>
						</InputGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor={boothTypeField.name}>Booth Type</Label>
						<Select
							value={boothTypeField.state.value}
							onValueChange={boothTypeField.handleChange}
						>
							<SelectTrigger className="h-11 w-full">
								<SelectValue placeholder="Select booth type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="shell_scheme">Shell Scheme</SelectItem>
								<SelectItem value="raw_space">Raw Space</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor={nameOnFasciaField.name}>Name on Fascia</Label>
					<InputGroup className="h-11">
						<InputGroupAddon>
							<Tag className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							id={nameOnFasciaField.name}
							placeholder="Company name to display (max 25 chars)"
							maxLength={25}
							value={nameOnFasciaField.state.value}
							onBlur={nameOnFasciaField.handleBlur}
							onChange={(e) => nameOnFasciaField.handleChange(e.target.value)}
						/>
					</InputGroup>
					<p className="text-muted-foreground text-xs">
						{nameOnFasciaField.state.value.length}/25 characters
					</p>
				</div>
			</div>

			{/* Company Information */}
			<div className="space-y-4">
				<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
					Company Information
				</h4>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={companyNameField.name}>Company Name</Label>
						<InputGroup className="h-11">
							<InputGroupAddon>
								<Building2 className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={companyNameField.name}
								placeholder="Your company name"
								value={companyNameField.state.value}
								onBlur={companyNameField.handleBlur}
								onChange={(e) => companyNameField.handleChange(e.target.value)}
							/>
						</InputGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor={companyAddressField.name}>Company Address</Label>
						<Textarea
							id={companyAddressField.name}
							placeholder="Full company address"
							rows={2}
							value={companyAddressField.state.value}
							onBlur={companyAddressField.handleBlur}
							onChange={(e) => companyAddressField.handleChange(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Person In Charge */}
			<div className="space-y-4">
				<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
					Person In Charge (PIC) <span className="text-destructive">*</span>
				</h4>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={picFullNameField.name}>
							Full Name <span className="text-destructive">*</span>
						</Label>
						<InputGroup className="h-11">
							<InputGroupAddon>
								<User className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={picFullNameField.name}
								placeholder="PIC full name"
								value={picFullNameField.state.value}
								onBlur={picFullNameField.handleBlur}
								onChange={(e) => picFullNameField.handleChange(e.target.value)}
								required
							/>
						</InputGroup>
						{picFullNameField.state.meta.errors.length > 0 && (
							<p className="text-destructive text-xs">
								{picFullNameField.state.meta.errors[0]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={picContactNumberField.name}>
							Contact Number <span className="text-destructive">*</span>
						</Label>
						<InputGroup className="h-11">
							<InputGroupAddon>
								<Phone className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={picContactNumberField.name}
								placeholder="+60 12-345 6789"
								value={picContactNumberField.state.value}
								onBlur={picContactNumberField.handleBlur}
								onChange={(e) =>
									picContactNumberField.handleChange(e.target.value)
								}
								required
							/>
						</InputGroup>
						{picContactNumberField.state.meta.errors.length > 0 && (
							<p className="text-destructive text-xs">
								{picContactNumberField.state.meta.errors[0]}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor={picEmailAddressField.name}>Email Address</Label>
					<InputGroup className="h-11">
						<InputGroupAddon>
							<Mail className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							id={picEmailAddressField.name}
							type="email"
							placeholder="pic@company.com"
							value={picEmailAddressField.state.value}
							onBlur={picEmailAddressField.handleBlur}
							onChange={(e) =>
								picEmailAddressField.handleChange(e.target.value)
							}
						/>
					</InputGroup>
				</div>
			</div>
		</div>
	);
}
