"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Image as ImageIcon, Layers, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { updateResource } from "@/lib/api/resource";
import { getResourceCategories } from "@/lib/api/resource/category";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type";
import type { Resource } from "@/lib/api/resource/response";
import { getResourceTopics } from "@/lib/api/resource/topic";
import { getResourceImage } from "@/lib/utils/resource-image";

const editPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	metaDescription: z.string().optional(),
	topicId: z.string().min(1, "Topic is required"),
	categoryId: z.string().min(1, "Category is required"),
	mediaTypeId: z.string().min(1, "Media type is required"),
	isGated: z.boolean().default(false),
	isOfficial: z.boolean().default(false),
	headerImg: z.any().optional(),
});

interface EditPostFormProps {
	resource: Resource;
}

export function EditPostForm({ resource }: EditPostFormProps) {
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

	const updateMutation = useMutation({
		mutationFn: updateResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			queryClient.invalidateQueries({ queryKey: ["resource", resource.slug] });
			toast.success("Post updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update post", {
				description: error.message,
			});
		},
	});

	const isPending = updateMutation.isPending;
	const isLoading =
		isLoadingTopics ||
		isLoadingCategories ||
		isLoadingMediaTypes ||
		isLoadingPermissions;

	const canSetOfficial = isOrgOwner || isOfficialWriter;

	// Track if resource originally had an image
	const hadOriginalImage = resource.headerImgUrl !== null && resource.headerImgUrl !== undefined;

	const form = useForm({
		defaultValues: {
			title: resource.title,
			metaDescription: resource.metaDescription || "",
			topicId: resource.topic?.id || "",
			categoryId: resource.category?.id || "",
			mediaTypeId: resource.mediaType?.id || "",
			isGated: resource.isGated,
			isOfficial: resource.isOfficial,
			// Initialize with existing image URL if available, so we can track removal
			headerImg: hadOriginalImage
				? (getResourceImage(resource.headerImgUrl, "original") || null)
				: null as File | string | null,
		},
		onSubmit: async ({ value }) => {
			// Determine if image should be deleted
			// If resource originally had an image and headerImg is now null (removed by user), delete it
			// Note: headerImg will be null if user clicked "Remove", or a File if they uploaded a new one
			const headerImgValue = value.headerImg;
			const isFile = headerImgValue instanceof File;
			const shouldDeleteImage = hadOriginalImage &&
				headerImgValue === null &&
				!isFile;

			updateMutation.mutate({
				id: resource.id,
				title: value.title.trim(),
				metaDescription: value.metaDescription?.trim() || undefined,
				topicId: value.topicId,
				categoryId: value.categoryId,
				mediaTypeId: value.mediaTypeId,
				isGated: value.isGated,
				headerImg: isFile ? headerImgValue : undefined,
				removeHeaderImg: shouldDeleteImage ? true : undefined,
				// Backend might not allow changing official status if not authorized,
				// but we handle visibility in UI
			});
		},
	});

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
										const result = editPostSchema.shape.title.safeParse(value);
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
							{(field) => {
								// Display the current value (URL string or File), or empty string if null
								// When user clicks "Remove", onChange(null) will be called, setting field value to null
								const displayValue = field.state.value || "";

								return (
									<ImageUpload
										value={displayValue}
										onChange={(file) => {
											// When user removes image, file will be null
											// When user uploads new image, file will be a File object
											field.handleChange(file);
										}}
										disabled={isPending || isLoading}
									/>
								);
							}}
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
											editPostSchema.shape.topicId.safeParse(value);
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
											editPostSchema.shape.categoryId.safeParse(value);
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
											editPostSchema.shape.mediaTypeId.safeParse(value);
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
							Update Post
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
