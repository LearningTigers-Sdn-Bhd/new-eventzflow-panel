"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import { NameAnimation } from "@/components/welcome-screen/name-animation";
import { Button } from "@/components/ui/button";
import {
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
	fetchCheckInDisplay,
	updateCheckInDisplay,
	type AnimationType,
	type CheckInDisplayFormData,
} from "@/lib/api/check-in-display";
import { DEFAULT_FONT, getFontNames, getGoogleFontsUrl } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { API_BASE_URL, queryClient } from "@/utils/rest-api";

const FONT_SIZES = [24, 32, 48, 56, 64, 72, 84, 96, 120, 144, 168, 200];

const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
	{ value: "fade_in", label: "Fade in" },
	{ value: "slide_up", label: "Slide up" },
	{ value: "zoom_in", label: "Zoom in" },
	{ value: "bounce", label: "Bounce" },
	{ value: "typewriter", label: "Typewriter" },
	{ value: "no_animation", label: "None" },
];

const NAME_COLORS: { value: string; label: string }[] = [
	{ value: "#FFFFFF", label: "White" },
	{ value: "#000000", label: "Black" },
	{ value: "#FFD700", label: "Gold" },
	{ value: "#FF6B6B", label: "Red" },
	{ value: "#4ECDC4", label: "Teal" },
	{ value: "#45B7D1", label: "Blue" },
	{ value: "#96CEB4", label: "Green" },
	{ value: "#FFEAA7", label: "Yellow" },
	{ value: "#DDA0DD", label: "Plum" },
	{ value: "#F39C12", label: "Orange" },
];

interface WelcomeScreenFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function WelcomeScreenForm({
	eventId,
	onClose,
}: WelcomeScreenFormProps) {
	const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);
	const [fontSize, setFontSize] = useState(72);
	const [animationType, setAnimationType] = useState<AnimationType>("fade_in");
	const [isBold, setIsBold] = useState(false);
	const [nameColor, setNameColor] = useState("#FFFFFF");
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
	const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);
	const [previewKey, setPreviewKey] = useState(0);

	// Fetch existing settings
	const {
		data: displaySettings,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["check-in-display", eventId],
		queryFn: () => fetchCheckInDisplay(eventId.toString()),
	});

	// File upload hook
	const [{ isDragging, errors }, { handleDrop, handleDragOver, handleDragEnter, handleDragLeave, getInputProps, clearFiles }] =
		useFileUpload({
			accept: "image/*",
			maxSize: 5 * 1024 * 1024, // 5MB
			multiple: false,
			onFilesChange: (files) => {
				if (files.length > 0 && files[0].file instanceof File) {
					setSelectedImage(files[0].file);
					setRemoveBackgroundImage(false);
				}
			},
			onError: (errors) => {
				errors.forEach((err) => toast.error(err));
			},
		});

	// Load existing settings
	useEffect(() => {
		if (displaySettings) {
			setFontFamily(displaySettings.font_family || DEFAULT_FONT);
			setFontSize(displaySettings.font_size || 72);
			setAnimationType(displaySettings.animation_type || "fade_in");
			setIsBold(displaySettings.is_bold || false);
			setNameColor(displaySettings.name_color || "#FFFFFF");
			setExistingImageUrl(displaySettings.background_image_url);
		}
	}, [displaySettings]);

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (data: CheckInDisplayFormData) => {
			return updateCheckInDisplay(eventId.toString(), data);
		},
		onSuccess: () => {
			toast.success("Welcome screen settings saved successfully!");
			queryClient.invalidateQueries({
				queryKey: ["check-in-display", eventId],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save settings");
		},
	});

	const handleSave = async () => {
		const data: CheckInDisplayFormData = {
			font_family: fontFamily,
			font_size: fontSize,
			animation_type: animationType,
			is_bold: isBold,
			name_color: nameColor,
		};

		if (selectedImage) {
			data.background_image = selectedImage;
		}

		if (removeBackgroundImage) {
			data.remove_background_image = true;
		}

		await updateMutation.mutateAsync(data);
		setRemoveBackgroundImage(false);
	};

	const handleRestoreDefaults = () => {
		setFontFamily(DEFAULT_FONT);
		setFontSize(72);
		setAnimationType("fade_in");
		setIsBold(false);
		setNameColor("#FFFFFF");
		setSelectedImage(null);
		setExistingImageUrl(null);
		setRemoveBackgroundImage(true);
		clearFiles();
		toast.info("Restored to defaults");
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setExistingImageUrl(null);
		setRemoveBackgroundImage(true);
		clearFiles();
	};

	const triggerPreviewAnimation = () => {
		setPreviewKey((prev) => prev + 1);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading welcome screen settings..."
				description="Please wait while we fetch the settings"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load welcome screen settings. Please try again.
			</div>
		);
	}

	// Build preview URL - for selectedImage use blob URL, for existing API URL prepend API_BASE_URL
	const previewImageUrl = selectedImage
		? URL.createObjectURL(selectedImage)
		: existingImageUrl
			? `${API_BASE_URL}${existingImageUrl}`
			: null;

	return (
		<>
			{/* Load Google Fonts for preview */}
			{/* eslint-disable-next-line @next/next/no-page-custom-font */}
			<link rel="stylesheet" href={getGoogleFontsUrl()} />

			<section className="h-full w-full">
				<FieldSet className="h-full w-full gap-1">
					<div className="flex flex-col items-start justify-between gap-2 pb-2">
						<div className="flex-1">
							<FieldLegend className="font-bold text-xl!">
							Welcome Screen
						</FieldLegend>
						<FieldDescription>
							Configure the check-in welcome display that shows attendee names
							when they check in.
						</FieldDescription>
					</div>
				</div>
				<FieldSeparator />

				<div className="space-y-6 py-4">
					{/* Settings Row - Font Family, Font Size, Animation, Bold, Name Color */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
						{/* Font Family */}
						<FieldGroup>
							<FieldLabel>Font Family</FieldLabel>
							<Select value={fontFamily} onValueChange={setFontFamily}>
								<SelectTrigger className="w-full rounded-none">
									<SelectValue placeholder="Select font" />
								</SelectTrigger>
								<SelectContent>
									{getFontNames().map((font) => (
										<SelectItem key={font} value={font}>
											<span style={{ fontFamily: font }}>{font}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FieldGroup>

						{/* Font Size */}
						<FieldGroup>
							<FieldLabel>Font Size (px)</FieldLabel>
							<Select
								value={fontSize.toString()}
								onValueChange={(v) => setFontSize(Number(v))}
							>
								<SelectTrigger className="w-full rounded-none">
									<SelectValue placeholder="Select size" />
								</SelectTrigger>
								<SelectContent>
									{FONT_SIZES.map((size) => (
										<SelectItem key={size} value={size.toString()}>
											{size}px
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FieldGroup>

						{/* Animation Type */}
						<FieldGroup>
							<FieldLabel>Animation</FieldLabel>
							<Select
								value={animationType}
								onValueChange={(v) => setAnimationType(v as AnimationType)}
							>
								<SelectTrigger className="w-full rounded-none">
									<SelectValue placeholder="Select animation" />
								</SelectTrigger>
								<SelectContent>
									{ANIMATION_TYPES.map((anim) => (
										<SelectItem key={anim.value} value={anim.value}>
											{anim.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FieldGroup>

						{/* Name Color */}
						<FieldGroup>
							<FieldLabel>Name Color</FieldLabel>
							<Select value={nameColor} onValueChange={setNameColor}>
								<SelectTrigger className="w-full rounded-none">
									<SelectValue placeholder="Select color">
										<div className="flex items-center gap-2">
											<div
												className="h-4 w-4 border border-input"
												style={{ backgroundColor: nameColor }}
											/>
											<span>{NAME_COLORS.find((c) => c.value === nameColor)?.label || "Select color"}</span>
										</div>
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{NAME_COLORS.map((color) => (
										<SelectItem key={color.value} value={color.value}>
											<div className="flex items-center gap-2">
												<div
													className="h-4 w-4 border border-input"
													style={{ backgroundColor: color.value }}
												/>
												<span>{color.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FieldGroup>

						{/* Bold Toggle */}
						<FieldGroup>
							<FieldLabel>Bold Text</FieldLabel>
							<div className="flex h-9 items-center border border-input px-3">
								<Switch
									checked={isBold}
									onCheckedChange={setIsBold}
								/>
								<span className="ml-2 text-sm text-muted-foreground">
									{isBold ? "On" : "Off"}
								</span>
							</div>
						</FieldGroup>
					</div>

					{/* Background Image and Live Preview - Side by Side */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Background Image Upload */}
						<FieldGroup>
							<div className="flex h-7 items-center">
								<FieldLabel className="mb-0">Background Image</FieldLabel>
							</div>
							<div
								className={cn(
									"relative flex h-[280px] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-4 transition-colors",
									isDragging
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-primary/50",
								)}
								onDrop={handleDrop}
								onDragOver={handleDragOver}
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onClick={() =>
									document.getElementById("welcome-screen-image-input")?.click()
								}
							>
								<input
									{...getInputProps()}
									id="welcome-screen-image-input"
									className="hidden"
								/>

								{previewImageUrl ? (
									<div className="relative h-full w-full">
										<img
											src={previewImageUrl}
											alt="Background preview"
											className="h-full w-full object-contain"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute top-1 right-1 size-6 rounded-none"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveImage();
											}}
										>
											<X className="size-3" />
										</Button>
									</div>
								) : (
									<>
										<ImageIcon className="mb-2 size-8 text-muted-foreground" />
										<p className="text-center text-muted-foreground text-xs">
											Click or drag to upload<br />(PNG, JPG, GIF up to 5MB)
										</p>
									</>
								)}
							</div>
							{errors.length > 0 && (
								<p className="mt-1 text-destructive text-sm">{errors[0]}</p>
							)}
						</FieldGroup>

						{/* Live Preview */}
						<FieldGroup>
							<div className="flex h-7 items-center justify-between">
								<FieldLabel className="mb-0">Live Preview</FieldLabel>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={triggerPreviewAnimation}
									className="h-7 rounded-none text-xs"
								>
									Replay Animation
								</Button>
							</div>
							<div
								className="relative flex h-[280px] items-center justify-center overflow-hidden border"
								style={{
									backgroundColor: "#1a1a2e",
								}}
							>
								{/* Background Image */}
								{previewImageUrl && (
									<div
										className="absolute inset-0 bg-cover bg-center bg-no-repeat"
										style={{
											backgroundImage: `url(${previewImageUrl})`,
										}}
									>
										<div className="absolute inset-0 bg-black/20" />
									</div>
								)}

								{/* Preview Content */}
								<div className="relative z-10 px-4 text-center text-black">
									<p
										className="mb-2 text-xs uppercase tracking-widest opacity-80"
										style={{
											color: nameColor,
											fontWeight: isBold ? "bold" : "normal",
										}}
									>
										Welcome
									</p>
									<NameAnimation
										key={previewKey}
										name="John Doe"
										animationType={animationType}
										fontFamily={fontFamily}
										fontSize={Math.round(16 + (fontSize - 24) * (48 - 16) / (200 - 24))}
										isBold={isBold}
										nameColor={nameColor}
									/>
								</div>
							</div>
							<p className="text-muted-foreground text-xs">
								Preview shows how attendee names will appear on check-in
							</p>
						</FieldGroup>
					</div>
				</div>

				{/* Action Buttons */}
				<FieldGroup className="flex flex-col items-stretch justify-end gap-2 pt-4 md:flex-row md:items-end">
					<Button
						type="button"
						variant="outline"
						onClick={handleRestoreDefaults}
						disabled={updateMutation.isPending}
						className="w-full rounded-none py-6 md:w-auto md:py-2"
					>
						Restore Defaults
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={updateMutation.isPending}
						className="w-full rounded-none py-6 md:w-auto md:py-2"
					>
						{updateMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</FieldGroup>
			</FieldSet>
		</section>
		</>
	);
}
