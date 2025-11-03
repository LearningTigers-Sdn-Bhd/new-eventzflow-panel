"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useEffect, useId } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCurrentUser, updateCurrentUser } from "@/lib/api/profile";

export function AccountInfoForm() {
	const emailId = useId();

	const {
		data: profile,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["current-user"],
		queryFn: getCurrentUser,
	});

	const form = useForm({
		defaultValues: {
			full_name: "",
			phone: "",
		},
		validators: {
			onSubmit: z.object({
				full_name: z.string().min(1, "Name is required"),
				phone: z.string(),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await updateCurrentUser({
					full_name: value.full_name.trim(),
					phone: value.phone?.trim() || undefined,
				});
				toast.success("Account information updated successfully");
				await refetch();
			} catch (error) {
				console.error("Failed to update account info:", error);
				toast.error("Failed to update account information");
			}
		},
	});

	// Update form when profile loads
	useEffect(() => {
		if (profile) {
			form.reset({
				full_name: profile.full_name || "",
				phone: profile.phone || "",
			});
		}
	}, [profile, form]);

	if (isLoading || !profile) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col justify-between space-y-4 md:min-h-[320px]"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor={emailId}>
						Email Address{" "}
						<span className="text-muted-foreground text-sm">
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Email changes are not currently supported</p>
								</TooltipContent>
							</Tooltip>
						</span>
					</Label>
					<Input
						id={emailId}
						type="email"
						value={profile.email || ""}
						placeholder="Enter your email"
						disabled // Email changes require special handling in Better Auth
						className="rounded-none"
					/>
				</div>
				<form.Field
					name="full_name"
					validators={{
						onChange: ({ value }) => {
							if (!value.trim()) {
								return "Name is required";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter your full name"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				<form.Field
					name="phone"
					validators={{
						onChange: () => {
							// Phone is optional, no validation needed
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor={field.name}>
								Phone Number (Optional)
							</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter your phone number"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>
			</div>
			<div className="flex justify-end">
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							disabled={!state.canSubmit || state.isSubmitting}
							className="min-w-[100px] rounded-none"
						>
							{state.isSubmitting ? (
								<Spinner className="h-4 w-4" />
							) : (
								"Save Changes"
							)}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
