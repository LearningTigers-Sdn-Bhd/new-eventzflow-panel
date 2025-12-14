"use client";

import { Eye, EyeOff, Lock, Mail, Phone, User, UserCircle } from "lucide-react";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	emailSchema,
	nameSchema,
	passwordSchema,
	phoneSchema,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils";

interface FieldApi {
	name: string;
	state: {
		value: string;
		meta: { errors: (string | undefined)[] };
	};
	handleBlur: () => void;
	handleChange: (value: string) => void;
}

interface AccountInfoSectionProps {
	fullNameField: FieldApi;
	emailField: FieldApi;
	phoneField: FieldApi;
	passwordField: FieldApi;
	passwordConfirmationField: FieldApi;
}

export function AccountInfoSection({
	fullNameField,
	emailField,
	phoneField,
	passwordField,
	passwordConfirmationField,
}: AccountInfoSectionProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 border-b pb-2">
				<UserCircle className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Account Information</h3>
			</div>

			<div className="grid gap-5">
				{/* Full Name */}
				<div className="space-y-2">
					<Label htmlFor={fullNameField.name}>Full Name *</Label>
					<InputGroup
						className={cn(
							"h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20",
							fullNameField.state.meta.errors.length > 0
								? "border-red-500 ring-2 ring-red-500/10"
								: "",
						)}
					>
						<InputGroupAddon className="bg-muted/30 text-muted-foreground">
							<User className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							id={fullNameField.name}
							type="text"
							placeholder="John Doe"
							value={fullNameField.state.value}
							onBlur={fullNameField.handleBlur}
							onChange={(e) => fullNameField.handleChange(e.target.value)}
						/>
					</InputGroup>
					{fullNameField.state.meta.errors.length > 0 && (
						<p className="text-red-500 text-sm">
							{fullNameField.state.meta.errors[0]}
						</p>
					)}
				</div>

				{/* Email and Phone */}
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={emailField.name}>Email Address *</Label>
						<InputGroup
							className={cn(
								"h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20",
								emailField.state.meta.errors.length > 0
									? "border-red-500 ring-2 ring-red-500/10"
									: "",
							)}
						>
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<Mail className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={emailField.name}
								type="email"
								placeholder="vendor@example.com"
								value={emailField.state.value}
								onBlur={emailField.handleBlur}
								onChange={(e) => emailField.handleChange(e.target.value)}
							/>
						</InputGroup>
						{emailField.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{emailField.state.meta.errors[0]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={phoneField.name}>Phone Number</Label>
						<InputGroup
							className={cn(
								"h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20",
								phoneField.state.meta.errors.length > 0
									? "border-red-500 ring-2 ring-red-500/10"
									: "",
							)}
						>
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<Phone className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={phoneField.name}
								type="tel"
								placeholder="+1234567890"
								value={phoneField.state.value}
								onBlur={phoneField.handleBlur}
								onChange={(e) => phoneField.handleChange(e.target.value)}
							/>
						</InputGroup>
						{phoneField.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{phoneField.state.meta.errors[0]}
							</p>
						)}
					</div>
				</div>

				{/* Password and Confirm Password */}
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={passwordField.name}>Password *</Label>
						<InputGroup
							className={cn(
								"h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20",
								passwordField.state.meta.errors.length > 0
									? "border-red-500 ring-2 ring-red-500/10"
									: "",
							)}
						>
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<Lock className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={passwordField.name}
								type={showPassword ? "text" : "password"}
								placeholder="Min 8 characters"
								value={passwordField.state.value}
								onBlur={passwordField.handleBlur}
								onChange={(e) => passwordField.handleChange(e.target.value)}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									variant="ghost"
									size="icon-sm"
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
						{passwordField.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{passwordField.state.meta.errors[0]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={passwordConfirmationField.name}>
							Confirm Password *
						</Label>
						<InputGroup
							className={cn(
								"h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20",
								passwordConfirmationField.state.meta.errors.length > 0
									? "border-red-500 ring-2 ring-red-500/10"
									: "",
							)}
						>
							<InputGroupAddon className="bg-muted/30 text-muted-foreground">
								<Lock className="h-4 w-4" />
							</InputGroupAddon>
							<InputGroupInput
								id={passwordConfirmationField.name}
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm password"
								value={passwordConfirmationField.state.value}
								onBlur={passwordConfirmationField.handleBlur}
								onChange={(e) =>
									passwordConfirmationField.handleChange(e.target.value)
								}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									variant="ghost"
									size="icon-sm"
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
						{passwordConfirmationField.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{passwordConfirmationField.state.meta.errors[0]}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export const accountInfoValidators = {
	fullName: {
		onChange: ({ value }: { value: string }) => {
			const result = nameSchema.safeParse(value);
			if (!result.success) {
				return result.error.issues[0]?.message;
			}
			return undefined;
		},
	},
	email: {
		onChange: ({ value }: { value: string }) => {
			const result = emailSchema.safeParse(value);
			if (!result.success) {
				return result.error.issues[0]?.message;
			}
			return undefined;
		},
	},
	phone: {
		onChange: ({ value }: { value: string }) => {
			if (!value) return undefined;
			const result = phoneSchema.safeParse(value);
			if (!result.success) {
				return result.error.issues[0]?.message;
			}
			return undefined;
		},
	},
	password: {
		onChange: ({ value }: { value: string }) => {
			const result = passwordSchema.safeParse(value);
			if (!result.success) {
				return result.error.issues[0]?.message;
			}
			return undefined;
		},
	},
};
