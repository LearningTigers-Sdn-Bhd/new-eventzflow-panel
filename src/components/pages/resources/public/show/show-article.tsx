"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { RichDisplay } from "@/components/admin-ui/rich-editor/display/display";
import { RichDisplayContent } from "@/components/admin-ui/rich-editor/display/display-content";
import { RichDisplayOutline } from "@/components/admin-ui/rich-editor/display/display-outline";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createResourceLead } from "@/lib/api/resource/lead/endpoints";
import type { Resource } from "@/lib/api/resource/response";

interface ShowArticleProps {
	resource: Resource;
	hasAccess: boolean;
}

const leadFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company: z.string().optional(),
});

function GatedForm({ resource }: { resource: Resource }) {
	const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			company: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmittingLocal(true);
			try {
				await createResourceLead({
					resource_id: resource.id,
					...value,
				});
				toast.success("Access granted!");

				// Set cookie for 1 day
				const d = new Date();
				d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
				const expires = `expires=${d.toUTCString()}`;
				document.cookie = `resource-access-${resource.id}=true;${expires};path=/`;

				window.location.reload();
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong. Please try again.");
			} finally {
				setIsSubmittingLocal(false);
			}
		},
	});

	return (
		<div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
			<div className="grid gap-12 lg:grid-cols-2">
				{/* Left: Post Preview (Blurred/Locked) */}
				<div className="flex flex-col gap-6">
					<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg">
						{resource.coverImageUrl ? (
							<Image
								src={resource.coverImageUrl}
								alt={resource.title}
								fill
								className="object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-gray-400">
								No Image
							</div>
						)}
					</div>
					<div>
						<div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
							<span className="font-semibold text-primary uppercase tracking-wider">
								{resource.topic?.name}
							</span>
							<span>•</span>
							<span>{resource.mediaType?.name}</span>
						</div>
						<h1 className="mb-4 font-bold text-3xl text-gray-900 leading-tight md:text-4xl">
							{resource.title}
						</h1>
						{resource.metaDescription && (
							<p className="text-gray-600 text-lg leading-relaxed">
								{resource.metaDescription}
							</p>
						)}
					</div>

					<div className="relative mt-8 h-64 w-full overflow-hidden rounded-lg bg-gray-50 p-6">
						<div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md">
							<div className="flex flex-col items-center gap-4 text-center">
								<div className="rounded-full bg-primary/10 p-4">
									<Lock className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="font-bold text-gray-900 text-xl">
										Premium Content
									</h3>
									<p className="text-gray-500">
										Fill out the form to access the full resource.
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-4 opacity-30">
							<div className="h-4 w-3/4 rounded bg-gray-300" />
							<div className="h-4 w-full rounded bg-gray-300" />
							<div className="h-4 w-5/6 rounded bg-gray-300" />
							<div className="h-4 w-full rounded bg-gray-300" />
							<div className="h-4 w-2/3 rounded bg-gray-300" />
						</div>
					</div>
				</div>

				{/* Right: Lead Form */}
				<div className="flex flex-col justify-center">
					<div className="rounded-2xl border bg-white p-8 shadow-sm md:p-10">
						<div className="mb-8">
							<h2 className="mb-2 font-bold text-2xl text-gray-900">
								Get Access Now
							</h2>
							<p className="text-gray-500">
								Enter your details to unlock this exclusive content immediately.
							</p>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-6"
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
								name="company"
								validators={{
									onChange: ({ value }) => {
										const result =
											leadFormSchema.shape.company.safeParse(value);
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
										className="w-full"
										size="lg"
										disabled={!canSubmit || isSubmittingLocal || isSubmitting}
									>
										{isSubmittingLocal || isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Unlocking...
											</>
										) : (
											"Unlock Content"
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

export default function ShowArticle({ resource, hasAccess }: ShowArticleProps) {
	if (!hasAccess) {
		return <GatedForm resource={resource} />;
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
			<RichDisplay
				content={resource.article || ""}
				className="h-full w-full border-none shadow-none"
				theme="light"
			>
				<RichDisplayOutline
					style="block"
					side="left"
					className="border-black!"
				/>
				<RichDisplayContent className="border-none! shadow-none!">
					{/* Article content is rendered here */}
				</RichDisplayContent>
			</RichDisplay>
		</div>
	);
}
