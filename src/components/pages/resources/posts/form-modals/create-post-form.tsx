"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	FileText,
	Image as ImageIcon,
	Layers,
	Loader2,
	Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/auth/use-user-permissions";
import { useDialog } from "@/hooks/use-dialog";
import { createResource } from "@/lib/api/resource";
import { getResourceCategories } from "@/lib/api/resource/category";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type";
import { getResourceTopics } from "@/lib/api/resource/topic";

const createPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	metaDescription: z.string().optional(),
	topicId: z.string().min(1, "Topic is required"),
	categoryId: z.string().min(1, "Category is required"),
	mediaTypeId: z.string().min(1, "Media type is required"),
	isGated: z.boolean().default(false),
	isOfficial: z.boolean().default(false),
	priority: z.number().int().min(1).max(10).optional(),
	headerImg: z.any().optional(),
});

export function CreatePostForm() {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const {
		isOrgOwner,
		isOfficial: isOfficialWriter,
		isLoading: isLoadingPermissions,
	} = useUserPermissions();

	// Data Fetching
	const { data: topicsData, isLoading: isLoadingTopics } = useQuery({
		queryKey: ["resource-topics"],
		queryFn: () => getResourceTopics({ filter: "active" }),
	});

	const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
		queryKey: ["resource-categories"],
		queryFn: () => getResourceCategories({ filter: "active" }),
	});

	const { data: mediaTypesData, isLoading: isLoadingMediaTypes } = useQuery({
		queryKey: ["resource-media-types"],
		queryFn: () => getResourceMediaTypes({ filter: "active" }),
	});

	const topics = topicsData?.data;
	const categories = categoriesData?.data;
	const mediaTypes = mediaTypesData?.data;

	const createMutation = useMutation({
		mutationFn: createResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			toast.success("Post created successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to create post", {
				description: error.message,
			});
		},
	});

	const canSetOfficial = isOrgOwner || isOfficialWriter;

	const form = useForm({
		defaultValues: {
			title: "",
			metaDescription: "",
			topicId: "",
			categoryId: "",
			mediaTypeId: "",
			isGated: false,
			isOfficial: false,
			priority: 10,
			headerImg: null as File | null,
		},
		onSubmit: async ({ value }) => {
			createMutation.mutate({
				title: value.title.trim(),
				metaDescription: value.metaDescription?.trim() || undefined,
				topicId: value.topicId,
				categoryId: value.categoryId,
				mediaTypeId: value.mediaTypeId,
				isGated: value.isGated,
				isOfficial: canSetOfficial ? value.isOfficial : false,
				priority: isOrgOwner ? value.priority : undefined,
				status: "draft",
				headerImg: value.headerImg,
			});
		},
	});

	const isPending = createMutation.isPending;
	const isLoading =
		isLoadingTopics ||
		isLoadingCategories ||
		isLoadingMediaTypes ||
		isLoadingPermissions;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col justify-between gap-4 px-4 md:px-6"
		>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{/* Group (Post) */}
				<div className="flex flex-col gap-4">
					<FormGroupContainer
						title={{
							icon: FileText,
							label: "Post Content",
							description: "Main identifying information for the post.",
						}}
					>
						<div className="flex flex-col gap-4">
							<form.Field
								name="title"
								validators={{
									onChange: ({ value }) => {
										const result =
											createPostSchema.shape.title.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<InputLabel
										label="Title"
										description="The title of your post"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										placeholder="e.g. My First Post"
										disabled={isPending || isLoading}
										required
										isInvalid={field.state.meta.errors.length > 0}
										errors={
											field.state.meta.errors.length > 0
												? [{ message: String(field.state.meta.errors[0]) }]
												: undefined
										}
									/>
								)}
							</form.Field>

							<form.Field name="metaDescription">
								{(field) => (
									<InputLabel
										label="Description (Meta Description)"
										description="A brief description for SEO and previews"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										placeholder="e.g. This post covers the basics of..."
										disabled={isPending || isLoading}
										type="textarea"
									/>
								)}
							</form.Field>
						</div>
					</FormGroupContainer>

					<FormGroupContainer
						title={{
							icon: ImageIcon,
							label: "Header Image",
							description: "The main image shown at the top of your post.",
						}}
					>
						<form.Field name="headerImg">
							{(field) => (
								<ImageUpload
									value={field.state.value || ""}
									onChange={(file) => field.handleChange(file)}
									disabled={isPending || isLoading}
								/>
							)}
						</form.Field>
					</FormGroupContainer>
				</div>

				{/* Group (Details) */}
				<div className="flex flex-col gap-4">
					<FormGroupContainer
						title={{
							icon: Layers,
							label: "Details",
							description: "Classification and media type settings.",
						}}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<form.Field
								name="topicId"
								validators={{
									onChange: ({ value }) => {
										const result =
											createPostSchema.shape.topicId.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<SelectLabel
										label="Topic"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										options={
											topics?.map((t) => ({ value: t.id, label: t.name })) || []
										}
										placeholder="Select Topic"
										disabled={isPending || isLoading}
										required
										isInvalid={field.state.meta.errors.length > 0}
										errors={
											field.state.meta.errors.length > 0
												? [{ message: String(field.state.meta.errors[0]) }]
												: undefined
										}
									/>
								)}
							</form.Field>

							<form.Field
								name="categoryId"
								validators={{
									onChange: ({ value }) => {
										const result =
											createPostSchema.shape.categoryId.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<SelectLabel
										label="Category"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										options={
											categories?.map((c) => ({
												value: c.id,
												label: c.name,
											})) || []
										}
										placeholder="Select Category"
										disabled={isPending || isLoading}
										required
										isInvalid={field.state.meta.errors.length > 0}
										errors={
											field.state.meta.errors.length > 0
												? [{ message: String(field.state.meta.errors[0]) }]
												: undefined
										}
									/>
								)}
							</form.Field>

							<form.Field
								name="mediaTypeId"
								validators={{
									onChange: ({ value }) => {
										const result =
											createPostSchema.shape.mediaTypeId.safeParse(value);
										if (!result.success) return result.error.issues[0].message;
										return undefined;
									},
								}}
							>
								{(field) => (
									<SelectLabel
										label="Media Type"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										options={
											mediaTypes?.map((m) => ({
												value: m.id,
												label: m.name,
											})) || []
										}
										placeholder="Select Type"
										disabled={isPending || isLoading}
										required
										isInvalid={field.state.meta.errors.length > 0}
										errors={
											field.state.meta.errors.length > 0
												? [{ message: String(field.state.meta.errors[0]) }]
												: undefined
										}
									/>
								)}
							</form.Field>
						</div>
					</FormGroupContainer>

					{/* Group (Additional Settings) */}
					<FormGroupContainer
						title={{
							icon: Settings2,
							label: "Additional Settings",
							description: "Control visibility and access.",
						}}
					>
						<div className="flex flex-col gap-4">
							<form.Field name="isGated">
								{(field) => (
									<SwitchCardInput
										label="Gated Content"
										description="Only authenticated users can view this"
										checked={field.state.value}
										onCheckedChange={(checked) => field.handleChange(checked)}
										disabled={isPending || isLoading}
										variant="no-rounded"
									/>
								)}
							</form.Field>

							{canSetOfficial && (
								<form.Field name="isOfficial">
									{(field) => (
										<SwitchCardInput
											label="Official Post"
											description="Mark this post as an official publication"
											checked={field.state.value}
											onCheckedChange={(checked) => field.handleChange(checked)}
											disabled={isPending || isLoading}
											variant="no-rounded"
										/>
									)}
								</form.Field>
							)}

							{isOrgOwner && (
								<form.Field
									name="priority"
									validators={{
										onChange: ({ value }) => {
											const result =
												createPostSchema.shape.priority.safeParse(value);
											if (!result.success)
												return result.error.issues[0].message;
											return undefined;
										},
									}}
								>
									{(field) => (
										<NumberInputLabel
											label="Priority"
											description="Set the priority level (1-10, higher is more important)"
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											min={1}
											max={10}
											disabled={isPending || isLoading}
											isInvalid={field.state.meta.errors.length > 0}
											errors={
												field.state.meta.errors.length > 0
													? [{ message: String(field.state.meta.errors[0]) }]
													: undefined
											}
										/>
									)}
								</form.Field>
							)}
						</div>
					</FormGroupContainer>
				</div>
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending || isLoading}
					className="w-full rounded-none py-6 md:w-auto md:py-2"
				>
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, _isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isPending || isLoading}
							className="w-full rounded-none py-6 md:w-auto md:py-2"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Post
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
