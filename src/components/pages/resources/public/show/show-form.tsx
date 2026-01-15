/** biome-ignore-all lint/performance/noImgElement: will be replaced with next/image */
"use client";

import { useForm } from "@tanstack/react-form";
import { Key, Loader2, Lock, Megaphone, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { grantGatedAccess } from "@/app/(public)/resources/[slug]/actions";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createResourceLead } from "@/lib/api/resource/lead/endpoints";
import type { Resource } from "@/lib/api/resource/response";
import { getResourceImage } from "@/lib/utils/resource-image";

interface GatedFormProps {
	resource: Resource;
}

const leadFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company_name: z.string().optional(),
	job_title: z.string().optional(),
	state: z.string().optional(),
	country: z.string().optional(),
});

export default function GatedForm({ resource }: GatedFormProps) {
	const router = useRouter();
	const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			company_name: "",
			job_title: "",
			state: "",
			country: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmittingLocal(true);
			try {
				await createResourceLead({
					resource_id: resource.id,
					...value,
				});

				// Grant access via server action
				await grantGatedAccess(resource.id);

				toast.success("Access granted!");

				// Refresh the page to show the content
				router.refresh();
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong. Please try again.");
			} finally {
				setIsSubmittingLocal(false);
			}
		},
	});

	const displayImage = getResourceImage(resource.headerImgUrl, "medium");

	return (
		<div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
			<div className="grid grid-cols-1 divide-x divide-black rounded-none border border-black lg:grid-cols-2">
				{/* Left: Post Preview (Blurred/Locked) */}
				<div className="flex w-full flex-col gap-6 p-6">
					{displayImage ? (
						<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg">
							<img
								src={displayImage}
								alt={resource.title}
								className="absolute inset-0 h-full w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						</div>
					) : null}
					<div className="flex flex-col">
						<div className="mb-2 flex items-center">
							<div className="flex items-center gap-2 rounded-none border border-gray-200 px-4 py-2 font-medium text-gray-600 text-sm uppercase tracking-wider">
								<Megaphone className="size-4" />
								You are about to access
							</div>
						</div>
						<h1 className="font-black text-4xl text-gray-900 leading-none tracking-tighter lg:text-5xl">
							{resource.title}
						</h1>
					</div>

					<div className="relative mt-3 h-44 w-full overflow-hidden rounded-none bg-gray-100 p-6 md:mt-6 md:h-full">
						<div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md">
							<div className="flex w-full flex-col items-center gap-4 text-center">
								<div className="rounded-none bg-black/10 p-2">
									<Lock className="h-8 w-8 text-black" />
								</div>
								<div>
									<h3 className="font-black text-gray-900 text-xl uppercase tracking-tight">
										Premium Content
									</h3>
									<p className="text-balance text-gray-500">
										Fill out the form to access the full resource.
									</p>
								</div>
							</div>
						</div>
						<ResponsiveLayout>
							<DesktopView>
								<div className="space-y-3 opacity-20">
									<div className="h-3 w-3/4 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-3/4 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
								</div>
							</DesktopView>
							<MobileTabletView>
								<div className="space-y-3 opacity-20">
									<div className="h-3 w-3/4 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
									<div className="h-3 w-full rounded-none bg-gray-300" />
									<div className="h-3 w-2/3 rounded-none bg-gray-300" />
									<div className="h-3 w-5/6 rounded-none bg-gray-300" />
								</div>
							</MobileTabletView>
						</ResponsiveLayout>
					</div>
				</div>

				{/* Right: Lead Form */}
				<div className="flex flex-col justify-center">
					<div className="flex flex-row items-center gap-2 border-black/10 border-b border-dashed p-6">
						<div className="rounded-none border border-black/10 bg-black/5 p-2">
							<Key className="size-6 text-black" />
						</div>
						<div>
							<h2 className="font-black text-gray-900 text-xl uppercase tracking-tighter">
								Get Access Now
							</h2>
							<p className="text-gray-500 text-sm">
								Enter your details to unlock this exclusive content immediately.
							</p>
						</div>
					</div>
					<div className="p-6">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4 text-black"
						>
							<form.Field
								name="name"
								validators={{
									onChange: ({ value }) => {
										const result = leadFormSchema.shape.name.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Full Name</FieldLabel>
										<Input
											placeholder="John Doe"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										const result = leadFormSchema.shape.email.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Work Email</FieldLabel>
										<Input
											placeholder="john@company.com"
											type="email"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="phone"
								validators={{
									onChange: ({ value }) => {
										const result = leadFormSchema.shape.phone.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Phone Number (Optional)</FieldLabel>
										<Input
											placeholder="+1 234 567 890"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="company_name"
								validators={{
									onChange: ({ value }) => {
										const result =
											leadFormSchema.shape.company_name.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Company Name (Optional)</FieldLabel>
										<Input
											placeholder="Acme Inc."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="job_title"
								validators={{
									onChange: ({ value }) => {
										const result =
											leadFormSchema.shape.job_title.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Job Title (Optional)</FieldLabel>
										<Input
											placeholder="Marketing Manager"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="state"
								validators={{
									onChange: ({ value }) => {
										const result = leadFormSchema.shape.state.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>State (Optional)</FieldLabel>
										<Input
											placeholder="California"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="country"
								validators={{
									onChange: ({ value }) => {
										const result =
											leadFormSchema.shape.country.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel>Country (Optional)</FieldLabel>
										<Input
											placeholder="United States"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="rounded-none border-black/10 bg-stone-50 placeholder:text-gray-600 placeholder:text-sm"
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{field.state.meta.errors[0]?.toString()}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
							>
								{([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										className="w-full rounded-none py-6 uppercase tracking-tighter"
										size="lg"
										disabled={!canSubmit || isSubmittingLocal || isSubmitting}
									>
										{isSubmittingLocal || isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Unlocking...
											</>
										) : (
											<>
												<Unlock className="size-4" />
												<span>Unlock Content</span>
											</>
										)}
									</Button>
								)}
							</form.Subscribe>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
