"use client";

import { Building2, User, Phone, Mail, Hash, Tag } from "lucide-react";
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
}: ExhibitorKitSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 border-b pb-2">
				<Building2 className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Exhibitor Kit Details</h3>
			</div>

			<p className="text-muted-foreground text-sm">
				Please provide your booth and company information for the exhibition.
			</p>

			{/* Booth Information */}
			<div className="space-y-4">
				<h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
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
				<h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
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
				<h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
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
								onChange={(e) => picContactNumberField.handleChange(e.target.value)}
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
							onChange={(e) => picEmailAddressField.handleChange(e.target.value)}
						/>
					</InputGroup>
				</div>
			</div>
		</div>
	);
}
