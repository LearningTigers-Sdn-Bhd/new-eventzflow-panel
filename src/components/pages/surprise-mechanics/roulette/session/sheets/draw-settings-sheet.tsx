"use client";

import { Image } from "@unpic/react";
import { Save, Settings } from "lucide-react";
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
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useDrawSettingsForm } from "@/hooks/surprise/roulette/use-draw-settings-form";
import type { RouletteSession } from "@/lib/api/roulette/response";
import type { DrawStyle } from "@/stores/lucky-draw-store";

interface DrawSettingsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	sessionId: number;
	session: RouletteSession;
}

export function DrawSettingsSheet({
	open,
	onOpenChange,
	eventId,
	sessionId,
	session,
}: DrawSettingsSheetProps) {
	const {
		form,
		checkHasChanges,
		isLoading: isLoadingConfig,
		wrapperBackground,
	} = useDrawSettingsForm({
		eventId,
		sessionId,
		session,
		open,
	});

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
					<ScrollArea className="h-[calc(100vh-180px)] px-4 pb-4">
						<div className="flex flex-col gap-6">
							<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
								<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
									<CardTitle className="text-base">
										Draw Configuration
									</CardTitle>
									<CardDescription className="text-sm">
										Control how winners are selected.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6 bg-background py-4">
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
														}}
														disabled={isLoadingConfig}
													>
														<SelectTrigger className="w-full rounded-none bg-background">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="rounded-none border-none">
															<SelectItem
																value="wheel"
																className="rounded-none"
															>
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
													const styleLabel =
														drawStyleValue === "wheel"
															? "wheel"
															: drawStyleValue === "slot"
																? "slot machine"
																: "mystery box";
													return (
														<div className="grid grid-cols-3 gap-4">
															<div className="col-span-2">
																<p className="font-semibold">Draw Theme</p>
																<p className="text-balance text-muted-foreground text-sm">
																	Choose the color theme for the {styleLabel}{" "}
																	draw.
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
																	</SelectContent>
																</Select>
															</div>
														</div>
													);
												}}
											</form.Field>
										)}
									</form.Subscribe>
								</CardContent>
							</Card>
							{session.is_multiple && (
								<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
									<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
										<CardTitle className="text-base">
											Multiple Draws Configuration
										</CardTitle>
										<CardDescription className="text-sm">
											Configure how many draws each participant can have.
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6 bg-background py-4">
										<form.Field name="drawCounts">
											{(field) => (
												<div className="grid grid-cols-3 gap-4">
													<div className="col-span-2">
														<p className="font-semibold">Draw Counts</p>
														<p className="text-balance text-muted-foreground text-sm">
															Number of draws each participant can have (1-999).
														</p>
													</div>
													<div className="col-span-1 flex items-center justify-end">
														<NumberInput
															value={field.state.value}
															onChange={(value) =>
																field.handleChange(value ?? 1)
															}
															min={1}
															max={999}
															disabled={isLoadingConfig}
														/>
													</div>
												</div>
											)}
										</form.Field>
									</CardContent>
								</Card>
							)}
							<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
								<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
									<CardTitle className="text-base">
										Background Configuration
									</CardTitle>
									<CardDescription className="text-sm">
										Configure the background for the draw wrapper.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6 bg-background py-4">
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
															if (!checked) {
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
										selector={(state) =>
											state.values.wrapperBackground.useImage
										}
									>
										{(useImage) => (
											<>
												{useImage ? (
													<div className="space-y-2">
														<label
															htmlFor="backgroundImageUrl"
															className="font-semibold text-sm"
														>
															Background Image URL
														</label>
														{wrapperBackground?.backgroundImgUrl && (
															<div className="mb-2">
																<p className="mb-1 text-muted-foreground text-xs">
																	Current image:
																</p>
																<Image
																	src={wrapperBackground.backgroundImgUrl}
																	alt="Current background"
																	layout="fullWidth"
																	background="auto"
																	className="h-20 w-full rounded border object-cover"
																/>
															</div>
														)}
														<p className="text-muted-foreground text-xs">
															Note: Background images are configured via URL.
															Update the session settings to change the image.
														</p>
													</div>
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
					</ScrollArea>
					<FieldGroup className="px-4 py-4">
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
					</FieldGroup>
				</form>
			</SheetContent>
		</Sheet>
	);
}
