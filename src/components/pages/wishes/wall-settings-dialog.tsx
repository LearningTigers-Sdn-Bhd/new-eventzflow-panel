"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { EventDetails } from "@/lib/api/event";
import { restClient } from "@/utils/rest-api";
import { AnimatedWallRenderer } from "../wishes-wall/animated-wall-renderer";
import { CardWallRenderer } from "../wishes-wall/card-wall-renderer";
import { wallPreviewWishes } from "../wishes-wall/wall-preview-data";
import { normalizeWallSettings } from "../wishes-wall/wall-settings";
import {
	DEFAULT_ACCENT_COLOR,
	DEFAULT_CARD_BACKGROUND_COLOR,
	DEFAULT_HEADER_TEXT_COLOR,
	normalizeWallStyle,
} from "../wishes-wall/wall-style";
import { WishesWallShell } from "../wishes-wall/wishes-wall-shell";

type DisplayMode = "cards" | "animation";
type AnimationShape = "heart" | "infinity" | "butterfly";

export type WishWallSettingsDialogContentProps = {
	eventId: string;
	event: EventDetails | undefined;
	onClose?: () => void;
};

const SHAPE_OPTIONS: Array<{ value: AnimationShape; label: string }> = [
	{ value: "heart", label: "Heart" },
	{ value: "infinity", label: "Infinity" },
	{ value: "butterfly", label: "Butterfly" },
];

const COLOR_OPTIONS = [
	{ value: "#D4A373", label: "Champagne Gold" },
	{ value: "#FFF7ED", label: "Soft Ivory" },
	{ value: "#F5E6D3", label: "Blush Linen" },
	{ value: "#E8B7C8", label: "Romantic Rose" },
	{ value: "#A06AB4", label: "Mulberry Bloom" },
	{ value: "#B9415D", label: "Berry Kiss" },
	{ value: "#C63D4F", label: "Velvet Red" },
	{ value: "#DDE5D0", label: "Sage Mist" },
	{ value: "#C08A6B", label: "Rose Clay" },
	{ value: "#8C6A5D", label: "Mocha Taupe" },
	{ value: "#2F241F", label: "Warm Charcoal" },
] as const;

type ColorOption = (typeof COLOR_OPTIONS)[number];

function findColorOption(value: string) {
	return COLOR_OPTIONS.find((option) => option.value === value) ?? null;
}

function renderColorOption(option: ColorOption) {
	return (
		<div className="flex items-center gap-3">
			<span
				className="h-4 w-4 rounded-full border border-black/10"
				style={{ backgroundColor: option.value }}
			/>
			<span>{option.label}</span>
		</div>
	);
}

function toNullableColor(value: string) {
	return value === "" ? null : value;
}

export function WishWallSettingsDialogContent({
	eventId,
	event,
	onClose,
}: WishWallSettingsDialogContentProps) {
	const queryClient = useQueryClient();
	const [displayMode, setDisplayMode] = useState<DisplayMode>("cards");
	const [animationShape, setAnimationShape] = useState<AnimationShape>("heart");
	const [accentColor, setAccentColor] = useState("");
	const [headerTextColor, setHeaderTextColor] = useState("");
	const [cardBackgroundColor, setCardBackgroundColor] = useState("");
	const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(
		null,
	);
	const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
		null,
	);
	const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);
	const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<
		string | null
	>(null);

	const currentSetting = event?.wish_wall_setting;

	useEffect(() => {
		const normalizedStyle = normalizeWallStyle(currentSetting);

		setDisplayMode(currentSetting?.display_mode ?? "cards");
		setAnimationShape(
			(currentSetting?.animation_shape as AnimationShape | null) ?? "heart",
		);
		setAccentColor(currentSetting?.accent_color ?? "");
		setHeaderTextColor(currentSetting?.header_text_color ?? "");
		setCardBackgroundColor(currentSetting?.card_background_color ?? "");
		setBackgroundImageFile(null);
		setBackgroundImageUrl(normalizedStyle.backgroundImageUrl);
		setRemoveBackgroundImage(false);
	}, [currentSetting]);

	useEffect(() => {
		if (!backgroundImageFile) {
			setBackgroundImagePreviewUrl(null);
			return;
		}

		const nextPreviewUrl = URL.createObjectURL(backgroundImageFile);
		setBackgroundImagePreviewUrl(nextPreviewUrl);

		return () => {
			URL.revokeObjectURL(nextPreviewUrl);
		};
	}, [backgroundImageFile]);

	const saveMutation = useMutation({
		mutationFn: () => {
			const formData = new FormData();
			formData.append(
				"event[wish_wall_setting_attributes][display_mode]",
				displayMode,
			);
			formData.append(
				"event[wish_wall_setting_attributes][animation_shape]",
				displayMode === "animation" ? animationShape : "",
			);
			formData.append(
				"event[wish_wall_setting_attributes][animation_text]",
				"",
			);
			formData.append(
				"event[wish_wall_setting_attributes][accent_color]",
				toNullableColor(accentColor) ?? "",
			);
			formData.append(
				"event[wish_wall_setting_attributes][header_text_color]",
				toNullableColor(headerTextColor) ?? "",
			);
			formData.append(
				"event[wish_wall_setting_attributes][card_background_color]",
				toNullableColor(cardBackgroundColor) ?? "",
			);

			if (backgroundImageFile) {
				formData.append(
					"event[wish_wall_background_image]",
					backgroundImageFile,
				);
			}

			if (removeBackgroundImage && !backgroundImageFile) {
				formData.append("event[remove_wish_wall_background_image]", "true");
			}

			return restClient.patchFormData<EventDetails>(
				`v1/events/${eventId}`,
				formData,
			);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			toast.success("Wishes wall settings saved");
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save wishes wall settings");
		},
	});

	const previewLabel =
		animationShape === "heart"
			? "Heart"
			: animationShape === "infinity"
				? "Infinity"
				: "Butterfly";
	const previewBackgroundImageUrl = backgroundImagePreviewUrl
		? backgroundImagePreviewUrl
		: !removeBackgroundImage
			? backgroundImageUrl
			: null;
	const previewSettings = normalizeWallSettings({
		display_mode: displayMode,
		animation_shape: displayMode === "animation" ? animationShape : null,
		accent_color: accentColor,
		header_text_color: headerTextColor,
		card_background_color: cardBackgroundColor,
		background_image_url: previewBackgroundImageUrl,
	});

	const handleBackgroundImageChange = (file: File | null) => {
		setBackgroundImageFile(file);
		setRemoveBackgroundImage(file ? false : Boolean(backgroundImageUrl));
		if (file) {
			setBackgroundImageUrl(currentSetting?.background_image_url ?? null);
			return;
		}

		if (backgroundImageUrl) {
			setBackgroundImageUrl(null);
		}
	};

	return (
		<div className="grid min-h-0 lg:grid-cols-[380px_minmax(0,1fr)]">
			<div className="overflow-y-auto border-b bg-background px-6 py-6 lg:border-r lg:border-b-0">
				<div className="space-y-6">
					<div className="space-y-3">
						<Label>Display Mode</Label>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
							<button
								type="button"
								onClick={() => setDisplayMode("cards")}
								className={`rounded-none border p-4 text-left ${displayMode === "cards" ? "border-primary bg-primary/5" : "border-border"}`}
							>
								<p className="font-medium">Classic Card Wall</p>
								<p className="mt-1 text-muted-foreground text-sm">
									Keep the current rotating wishes card layout.
								</p>
							</button>
							<button
								type="button"
								onClick={() => setDisplayMode("animation")}
								className={`rounded-none border p-4 text-left ${displayMode === "animation" ? "border-primary bg-primary/5" : "border-border"}`}
							>
								<p className="font-medium">Animated Shape Wall</p>
								<p className="mt-1 text-muted-foreground text-sm">
									Arrange wishes into a romantic wedding formation.
								</p>
							</button>
						</div>
					</div>

					{displayMode === "animation" ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="animation-shape">Animation Shape</Label>
								<Select
									value={animationShape}
									onValueChange={(value) =>
										setAnimationShape(value as AnimationShape)
									}
								>
									<SelectTrigger
										id="animation-shape"
										className="w-full rounded-none"
									>
										<SelectValue placeholder="Choose a wedding formation" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{SHAPE_OPTIONS.map((shape) => (
											<SelectItem key={shape.value} value={shape.value}>
												{shape.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					) : (
						<div className="rounded-none border bg-muted/30 p-4 text-muted-foreground text-sm">
							Classic card wall stays active with the current rotating card
							layout.
						</div>
					)}

					<div className="space-y-4 border-t pt-6">
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<Label htmlFor="accent-color">Accent color</Label>
								<Button
									type="button"
									variant="outline"
									className="h-8 rounded-none px-3 text-xs"
									onClick={() => setAccentColor("")}
								>
									Clear
								</Button>
							</div>
							<Select
								value={accentColor || DEFAULT_ACCENT_COLOR}
								onValueChange={setAccentColor}
							>
								<SelectTrigger
									id="accent-color"
									className="w-full rounded-none"
								>
									<SelectValue placeholder="Choose a color">
										{findColorOption(accentColor || DEFAULT_ACCENT_COLOR)
											? renderColorOption(
													findColorOption(
														accentColor || DEFAULT_ACCENT_COLOR,
													) as ColorOption,
												)
											: null}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{COLOR_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{renderColorOption(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<Label htmlFor="header-text-color">Header text color</Label>
								<Button
									type="button"
									variant="outline"
									className="h-8 rounded-none px-3 text-xs"
									onClick={() => setHeaderTextColor("")}
								>
									Clear
								</Button>
							</div>
							<Select
								value={headerTextColor || DEFAULT_HEADER_TEXT_COLOR}
								onValueChange={setHeaderTextColor}
							>
								<SelectTrigger
									id="header-text-color"
									className="w-full rounded-none"
								>
									<SelectValue placeholder="Choose a color">
										{findColorOption(
											headerTextColor || DEFAULT_HEADER_TEXT_COLOR,
										)
											? renderColorOption(
													findColorOption(
														headerTextColor || DEFAULT_HEADER_TEXT_COLOR,
													) as ColorOption,
												)
											: null}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{COLOR_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{renderColorOption(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<Label htmlFor="card-background-color">
									Card background color
								</Label>
								<Button
									type="button"
									variant="outline"
									className="h-8 rounded-none px-3 text-xs"
									onClick={() => setCardBackgroundColor("")}
								>
									Clear
								</Button>
							</div>
							<Select
								value={cardBackgroundColor || DEFAULT_CARD_BACKGROUND_COLOR}
								onValueChange={setCardBackgroundColor}
							>
								<SelectTrigger
									id="card-background-color"
									className="w-full rounded-none"
								>
									<SelectValue placeholder="Choose a color">
										{findColorOption(
											cardBackgroundColor || DEFAULT_CARD_BACKGROUND_COLOR,
										)
											? renderColorOption(
													findColorOption(
														cardBackgroundColor ||
															DEFAULT_CARD_BACKGROUND_COLOR,
													) as ColorOption,
												)
											: null}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{COLOR_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{renderColorOption(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="background-image">Background image</Label>
							<ImageUpload
								value={
									backgroundImageFile ??
									(!removeBackgroundImage
										? (backgroundImageUrl ?? undefined)
										: undefined)
								}
								onChange={handleBackgroundImageChange}
								className="rounded-none"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="min-h-0 overflow-y-auto bg-muted/20 px-6 py-6">
				<div className="flex min-h-full flex-col rounded-none border bg-background shadow-sm">
					<div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
						<p className="font-medium text-sm">Preview</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{displayMode === "animation" ? previewLabel : "Classic Card Wall"}
						</p>
					</div>
					<div data-testid="wall-settings-preview" className="min-h-0 flex-1">
						<WishesWallShell
							settings={previewSettings}
							eventTitle={event?.title ?? "Wishes Wall Preview"}
							preview
							className="relative min-h-full overflow-hidden px-6 py-6"
							contentClassName="relative z-10 flex min-h-full flex-col"
						>
							{displayMode === "animation" ? (
								<AnimatedWallRenderer
									wishes={wallPreviewWishes}
									settings={previewSettings}
									preview
								/>
							) : (
								<CardWallRenderer
									visibleWishes={wallPreviewWishes}
									page={0}
									pageNumbers={[0]}
									wishesCount={wallPreviewWishes.length}
									settings={previewSettings}
									preview
								/>
							)}
						</WishesWallShell>
					</div>
				</div>
			</div>

			<div className="sticky bottom-0 z-10 col-span-full flex flex-wrap items-center justify-end gap-2 border-t bg-background px-6 py-4">
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					asChild
				>
					<Link
						href={`/events/${event?.slug}/wishes-wall`}
						target="_blank"
						rel="noopener noreferrer"
					>
						Open Live Wall
						<MonitorPlay className="ml-2 h-4 w-4" />
					</Link>
				</Button>
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					onClick={() => onClose?.()}
				>
					Cancel
				</Button>
				<Button
					type="button"
					className="rounded-none"
					onClick={() => saveMutation.mutate()}
					disabled={saveMutation.isPending}
				>
					Save settings
				</Button>
			</div>
		</div>
	);
}
