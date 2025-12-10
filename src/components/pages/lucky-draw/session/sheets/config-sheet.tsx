"use client";

import { useForm } from "@tanstack/react-form";
import { Save, Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { FaGift } from "react-icons/fa";
import { MdCasino } from "react-icons/md";
import { RxColorWheel } from "react-icons/rx";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { useLuckyDraw } from "@/hooks/use-lucky-draw";
import { getLuckyDrawSessionBackgroundUrl } from "@/lib/api/lucky-draw";
import type { DrawStyle } from "@/stores/lucky-draw-store";

interface ConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	luckyDraw: ReturnType<typeof useLuckyDraw>;
}

export function ConfigSheet({
	open,
	onOpenChange,
	luckyDraw,
}: ConfigSheetProps) {
	const {
		useGifts,
		drawStyle,
		drawTheme,
		wrapperBackground,
		isLoadingConfig,
		setUseGifts,
		setDrawStyle,
		setDrawTheme,
		setWrapperBackground,
	} = luckyDraw;

	// Determine initial useImage value:
	// - If explicitly set, use that value
	// - Otherwise, infer from existing fields: if backgroundImgUrl exists, useImage should be true
	// - If only backgroundColor exists, useImage should be false
	// - Default to false
	const initialUseImage =
		wrapperBackground.useImage ?? !!wrapperBackground.backgroundImgUrl;

	// Store initial values to detect changes using ref
	const initialValuesRef = useRef({
		drawStyle,
		drawTheme,
		useGifts,
		wrapperBackground: {
			useImage: initialUseImage,
			backgroundImage: null as File | null,
			backgroundColor: wrapperBackground.backgroundColor ?? "",
		},
	});

	const form = useForm({
		defaultValues: {
			drawStyle,
			drawTheme,
			useGifts,
			wrapperBackground: {
				useImage: initialUseImage,
				backgroundImage: null as File | null,
				backgroundColor: wrapperBackground.backgroundColor ?? "",
			},
		},
		onSubmit: async ({ value }) => {
			try {
				// Save all changes
				const promises: Promise<void>[] = [];

				// When drawStyle changes, also update theme if needed
				if (
					value.drawStyle === "box" &&
					(value.drawTheme === "colorful" || value.drawTheme === "cartoon")
				) {
					value.drawTheme = "wireframe";
					form.setFieldValue("drawTheme", "wireframe");
				}

				if (value.drawStyle !== initialValuesRef.current.drawStyle) {
					promises.push(setDrawStyle(value.drawStyle, value.drawTheme));
				} else if (value.drawTheme !== initialValuesRef.current.drawTheme) {
					promises.push(setDrawTheme(value.drawTheme));
				}

				if (value.useGifts !== initialValuesRef.current.useGifts) {
					promises.push(setUseGifts(value.useGifts));
				}

				// Check if wrapperBackground changed
				// For File objects, we compare by checking if a file was actually selected
				// (File objects can't be meaningfully compared by reference)
				const useImageChanged =
					value.wrapperBackground.useImage !==
					initialValuesRef.current.wrapperBackground.useImage;
				const imageFileChanged =
					!!value.wrapperBackground.backgroundImage !==
					!!initialValuesRef.current.wrapperBackground.backgroundImage;
				const backgroundColorChanged =
					value.wrapperBackground.backgroundColor !==
					initialValuesRef.current.wrapperBackground.backgroundColor;

				const bgChanged =
					useImageChanged || imageFileChanged || backgroundColorChanged;

				if (bgChanged) {
					promises.push(
						setWrapperBackground({
							useImage: value.wrapperBackground.useImage,
							backgroundImage:
								value.wrapperBackground.backgroundImage || undefined,
							backgroundColor:
								value.wrapperBackground.backgroundColor || undefined,
						}),
					);
				}

				await Promise.all(promises);

				// Update initial values after successful save
				initialValuesRef.current = {
					drawStyle: value.drawStyle,
					drawTheme: value.drawTheme,
					useGifts: value.useGifts,
					wrapperBackground: value.wrapperBackground,
				};
			} catch (error) {
				// Error handling is done in the individual mutation functions
				console.error("Failed to save config:", error);
			}
		},
	});

	// Update initial values when config loads or sheet opens
	useEffect(() => {
		if (open && !isLoadingConfig) {
			// Determine useImage - infer from existing fields
			const determinedUseImage =
				wrapperBackground.useImage ?? !!wrapperBackground.backgroundImgUrl;

			const defaultWrapperBackground = {
				useImage: determinedUseImage,
				backgroundImage: null as File | null,
				backgroundColor: wrapperBackground.backgroundColor ?? "",
			};
			initialValuesRef.current = {
				drawStyle,
				drawTheme,
				useGifts,
				wrapperBackground: defaultWrapperBackground,
			};
			form.reset({
				drawStyle,
				drawTheme,
				useGifts,
				wrapperBackground: defaultWrapperBackground,
			});
		}
	}, [
		open,
		drawStyle,
		drawTheme,
		useGifts,
		wrapperBackground,
		isLoadingConfig,
		form,
	]);

	// Check if form has changes - will be computed reactively in the render
	const checkHasChanges = (currentValues: typeof form.state.values) => {
		const initial = initialValuesRef.current;
		// For File objects, we compare by checking if a file was actually selected
		const useImageChanged =
			currentValues.wrapperBackground.useImage !==
			initial.wrapperBackground.useImage;
		const imageFileChanged =
			!!currentValues.wrapperBackground.backgroundImage !==
			!!initial.wrapperBackground.backgroundImage;
		const backgroundColorChanged =
			currentValues.wrapperBackground.backgroundColor !==
			initial.wrapperBackground.backgroundColor;
		const bgChanged =
			useImageChanged || imageFileChanged || backgroundColorChanged;

		return (
			currentValues.drawStyle !== initial.drawStyle ||
			currentValues.drawTheme !== initial.drawTheme ||
			currentValues.useGifts !== initial.useGifts ||
			bgChanged
		);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center justify-start gap-2 rounded-none"
				>
					<Settings className="size-4" />
					<span className="hidden text-sm md:block">Draw Settings</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
				<SheetHeader className="gap-0!">
					<SheetTitle>Session Settings</SheetTitle>
					<SheetDescription>
						Configure draw behavior for this session.
					</SheetDescription>
				</SheetHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-1 flex-col"
				>
					<div className="flex flex-1 flex-col gap-6 px-4">
						<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
							<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
								<CardTitle className="text-base">Draw Configuration</CardTitle>
								<CardDescription className="text-sm">
									Control how winners are selected.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6 bg-slate-50 py-4">
								<form.Field name="drawStyle">
									{(field) => (
										<div className="grid grid-cols-3 gap-4">
											<div className="col-span-2">
												<p className="font-semibold">Draw Style</p>
												<p className="text-balance text-muted-foreground text-sm">
													Choose the animation for the draw screen.
												</p>
											</div>
											<div className="col-span-1 flex items-center justify-end">
												<Select
													value={field.state.value}
													onValueChange={(value) => {
														const newStyle = value as DrawStyle;
														field.handleChange(newStyle);
														// Reset theme to wireframe when switching to box style if current theme is colorful or cartoon
														const currentTheme = form.state.values.drawTheme;
														if (
															newStyle === "box" &&
															(currentTheme === "colorful" ||
																currentTheme === "cartoon")
														) {
															form.setFieldValue("drawTheme", "wireframe");
														}
													}}
													disabled={isLoadingConfig}
												>
													<SelectTrigger className="w-full rounded-none bg-background">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="rounded-none border-none">
														<SelectItem value="wheel" className="rounded-none">
															<div className="flex items-center gap-2">
																<RxColorWheel className="h-4 w-4" />
																<span>Wheel</span>
															</div>
														</SelectItem>
														<SelectItem value="slot" className="rounded-none">
															<div className="flex items-center gap-2">
																<MdCasino className="h-4 w-4" />
																<span>Slot Machine</span>
															</div>
														</SelectItem>
														<SelectItem value="box" className="rounded-none">
															<div className="flex items-center gap-2">
																<FaGift className="h-4 w-4" />
																<span>Mystery Box</span>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									)}
								</form.Field>
								<form.Subscribe selector={(state) => state.values.drawStyle}>
									{(drawStyleValue) => (
										<form.Field name="drawTheme">
											{(field) => {
												const showColorfulAndCartoon = drawStyleValue !== "box";

												return (
													<div className="grid grid-cols-3 gap-4">
														<div className="col-span-2">
															<p className="font-semibold">Draw Theme</p>
															<p className="text-balance text-muted-foreground text-sm">
																Choose the color theme for the draw.
															</p>
														</div>
														<div className="col-span-1 flex items-center justify-end">
															<Select
																value={field.state.value}
																onValueChange={(value) =>
																	field.handleChange(
																		value as
																			| "wireframe"
																			| "colorful"
																			| "cartoon",
																	)
																}
																disabled={isLoadingConfig}
															>
																<SelectTrigger className="w-full rounded-none bg-background">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent className="rounded-none border-none">
																	<SelectItem
																		value="wireframe"
																		className="rounded-none"
																	>
																		Wireframe
																	</SelectItem>
																	{showColorfulAndCartoon && (
																		<>
																			<SelectItem
																				value="colorful"
																				className="rounded-none"
																			>
																				Colorful
																			</SelectItem>
																			<SelectItem
																				value="cartoon"
																				className="rounded-none"
																			>
																				Cartoon
																			</SelectItem>
																		</>
																	)}
																</SelectContent>
															</Select>
														</div>
													</div>
												);
											}}
										</form.Field>
									)}
								</form.Subscribe>
								<form.Field name="useGifts">
									{(field) => (
										<div className="grid grid-cols-3 gap-4">
											<div className="col-span-2">
												<p className="font-semibold">Use Gifts</p>
												<p className="text-balance text-muted-foreground text-sm">
													Assign winners sequentially to gifts when enabled.
												</p>
											</div>
											<div className="col-span-1 flex items-center justify-end">
												<Switch
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={isLoadingConfig}
													className="border-primary/20 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
												/>
											</div>
										</div>
									)}
								</form.Field>
							</CardContent>
						</Card>
						<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
							<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
								<CardTitle className="text-base">
									Background Configuration
								</CardTitle>
								<CardDescription className="text-sm">
									Configure the background for the draw wrapper.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6 bg-slate-50 py-4">
								<form.Field name="wrapperBackground.useImage">
									{(field) => (
										<div className="grid grid-cols-3 gap-4">
											<div className="col-span-2">
												<p className="font-semibold">Use Image Background</p>
												<p className="text-balance text-muted-foreground text-sm">
													Use an image URL for the background instead of a
													color.
												</p>
											</div>
											<div className="col-span-1 flex items-center justify-end">
												<Switch
													checked={field.state.value}
													onCheckedChange={(checked) => {
														field.handleChange(checked);
														// Clear the image file input when switching to color mode
														// (backgroundColor is preserved by backend, so we don't clear it)
														if (!checked) {
															// Switching to color mode - clear image file input
															form.setFieldValue(
																"wrapperBackground.backgroundImage",
																null,
															);
														}
													}}
													disabled={isLoadingConfig}
													className="border-primary/20 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
												/>
											</div>
										</div>
									)}
								</form.Field>
								<form.Subscribe
									selector={(state) => state.values.wrapperBackground.useImage}
								>
									{(useImage) => (
										<>
											{useImage ? (
												<form.Field name="wrapperBackground.backgroundImage">
													{(field) => (
														<div className="space-y-2">
															<label
																htmlFor="backgroundImage"
																className="font-semibold text-sm"
															>
																Background Image
															</label>
															{wrapperBackground.backgroundImgUrl && (
																<div className="mb-2">
																	<p className="mb-1 text-muted-foreground text-xs">
																		Current image:
																	</p>
																	<img
																		src={getLuckyDrawSessionBackgroundUrl(
																			wrapperBackground.backgroundImgUrl,
																		)}
																		alt="Current background"
																		className="h-20 w-full rounded border object-cover"
																	/>
																</div>
															)}
															<input
																type="file"
																accept="image/*"
																onChange={(e) => {
																	const file = e.target.files?.[0] || null;
																	field.handleChange(file);
																	// Ensure useImage is true when setting image file
																	if (
																		!form.state.values.wrapperBackground
																			.useImage
																	) {
																		form.setFieldValue(
																			"wrapperBackground.useImage",
																			true,
																		);
																	}
																}}
																disabled={isLoadingConfig}
																className="h-9 w-full min-w-0 rounded-none border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
															/>
															{field.state.value && (
																<p className="text-muted-foreground text-xs">
																	Selected: {field.state.value.name}
																</p>
															)}
														</div>
													)}
												</form.Field>
											) : (
												<form.Field name="wrapperBackground.backgroundColor">
													{(field) => (
														<div className="space-y-2">
															<label
																htmlFor="backgroundColor"
																className="font-semibold text-sm"
															>
																Background Color
															</label>
															<div className="flex gap-2">
																<Input
																	type="color"
																	value={field.state.value || "#ffffff"}
																	onChange={(e) => {
																		field.handleChange(e.target.value);
																		// Ensure useImage is false when setting color
																		if (
																			form.state.values.wrapperBackground
																				.useImage
																		) {
																			form.setFieldValue(
																				"wrapperBackground.useImage",
																				false,
																			);
																		}
																	}}
																	disabled={isLoadingConfig}
																	className="h-10 w-20 rounded-none"
																/>
																<Input
																	type="text"
																	value={field.state.value || ""}
																	onChange={(e) => {
																		field.handleChange(e.target.value);
																		// Ensure useImage is false when setting color
																		if (
																			form.state.values.wrapperBackground
																				.useImage
																		) {
																			form.setFieldValue(
																				"wrapperBackground.useImage",
																				false,
																			);
																		}
																	}}
																	placeholder="#ffffff or rgb(255,255,255)"
																	disabled={isLoadingConfig}
																	className="flex-1 rounded-none"
																/>
															</div>
														</div>
													)}
												</form.Field>
											)}
										</>
									)}
								</form.Subscribe>
							</CardContent>
						</Card>
					</div>
					<form.Subscribe selector={(state) => state.values}>
						{(formValues) => {
							const hasChanges = checkHasChanges(formValues);
							if (!hasChanges) return null;
							return (
								<SheetFooter className="border-t px-4 py-4">
									<form.Subscribe selector={(state) => state.isSubmitting}>
										{(isSubmitting) => (
											<Button
												type="submit"
												disabled={isLoadingConfig || isSubmitting}
												className="w-full gap-2 rounded-none"
											>
												<Save className="size-4" />
												Save Changes
											</Button>
										)}
									</form.Subscribe>
								</SheetFooter>
							);
						}}
					</form.Subscribe>
				</form>
			</SheetContent>
		</Sheet>
	);
}
