"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateRouletteSession } from "@/lib/api/roulette";
import type { RouletteSession } from "@/lib/api/roulette/response";
import { getErrorMessage } from "@/lib/utils/error-handling";
import type { DrawStyle } from "@/stores/lucky-draw-store";

interface UseDrawSettingsFormParams {
	eventId: string;
	sessionId: number;
	session: RouletteSession;
	open: boolean;
}

export function useDrawSettingsForm({
	eventId,
	sessionId,
	session,
	open,
}: UseDrawSettingsFormParams) {
	const queryClient = useQueryClient();

	const drawStyle = session.draw_styles?.style || "wheel";
	const drawTheme: "wireframe" | "colorful" | "cartoon" =
		session.draw_styles?.theme || "wireframe";
	const wrapperBackground = session.wrapper_background || {
		useImage: false,
		backgroundImgUrl: undefined,
		backgroundColor: undefined,
	};
	const drawCounts = session.draw_counts ?? 1;

	// Determine initial useImage value
	const initialUseImage =
		wrapperBackground?.useImage ?? !!wrapperBackground?.backgroundImgUrl;

	// Store initial values to detect changes using ref
	const initialValuesRef = useRef({
		drawStyle,
		drawTheme,
		drawCounts,
		wrapperBackground: {
			useImage: initialUseImage,
			backgroundImage: null as File | null,
			backgroundColor: wrapperBackground.backgroundColor ?? "",
		},
	});

	const updateSessionMutation = useMutation({
		mutationFn: async (data: {
			drawStyle?: DrawStyle;
			drawTheme?: "wireframe" | "colorful" | "cartoon";
			drawCounts?: number;
			wrapperBackground?: {
				useImage: boolean;
				backgroundImgUrl?: string;
				backgroundColor?: string;
			};
		}) => {
			const updateData: {
				draw_styles?: {
					style: DrawStyle;
					theme: "wireframe" | "colorful" | "cartoon";
				};
				draw_counts?: number;
				wrapper_background?: {
					useImage: boolean;
					backgroundImgUrl?: string;
					backgroundColor?: string;
				};
			} = {};

			if (data.drawStyle !== undefined || data.drawTheme !== undefined) {
				updateData.draw_styles = {
					style: data.drawStyle ?? drawStyle,
					theme: data.drawTheme ?? drawTheme,
				};
			}

			if (data.drawCounts !== undefined) {
				updateData.draw_counts = data.drawCounts;
			}

			if (data.wrapperBackground) {
				updateData.wrapper_background = data.wrapperBackground;
			}

			return updateRouletteSession(eventId, sessionId, updateData);
		},
		onSuccess: () => {
			toast.success("Settings updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["roulette-session", eventId, sessionId],
			});
		},
		onError: (error) => {
			toast.error(getErrorMessage(error) || "Failed to update settings");
		},
	});

	const form = useForm({
		defaultValues: {
			drawStyle,
			drawTheme,
			drawCounts,
			wrapperBackground: {
				useImage: initialUseImage,
				backgroundImage: null as File | null,
				backgroundColor: wrapperBackground?.backgroundColor ?? "",
			},
		},
		onSubmit: async ({ value }) => {
			try {
				const promises: Promise<unknown>[] = [];

				if (
					value.drawStyle !== initialValuesRef.current.drawStyle ||
					value.drawTheme !== initialValuesRef.current.drawTheme
				) {
					promises.push(
						updateSessionMutation.mutateAsync({
							drawStyle: value.drawStyle,
							drawTheme: value.drawTheme as
								| "wireframe"
								| "colorful"
								| "cartoon",
						}),
					);
				}

				// Check if drawCounts changed
				if (value.drawCounts !== initialValuesRef.current.drawCounts) {
					promises.push(
						updateSessionMutation.mutateAsync({
							drawCounts: value.drawCounts,
						}),
					);
				}

				// Check if wrapperBackground changed
				const useImageChanged =
					value.wrapperBackground.useImage !==
					initialValuesRef.current.wrapperBackground.useImage;
				const hasNewImageFile = !!value.wrapperBackground.backgroundImage;
				const backgroundColorChanged =
					value.wrapperBackground.backgroundColor !==
					initialValuesRef.current.wrapperBackground.backgroundColor;

				const bgChanged =
					useImageChanged || hasNewImageFile || backgroundColorChanged;

				if (bgChanged) {
					// When switching to color mode, ensure we have a valid backgroundColor
					let bgColor = value.wrapperBackground.backgroundColor || undefined;
					if (!value.wrapperBackground.useImage && !bgColor) {
						// Default to white if switching to color mode with no color set
						bgColor = "#ffffff";
					}

					// Note: Roulette API uses backgroundImgUrl (string), not file upload
					// For now, we'll only update the URL if provided, or use existing
					const bgUpdate: {
						useImage: boolean;
						backgroundImgUrl?: string;
						backgroundColor?: string;
					} = {
						useImage: value.wrapperBackground.useImage,
						backgroundColor: bgColor,
					};

					// If there's an existing backgroundImgUrl, preserve it
					if (wrapperBackground?.backgroundImgUrl) {
						bgUpdate.backgroundImgUrl = wrapperBackground.backgroundImgUrl;
					}

					promises.push(
						updateSessionMutation.mutateAsync({
							wrapperBackground: bgUpdate,
						}),
					);
				}

				await Promise.all(promises);

				// Update initial values after successful save
				initialValuesRef.current = {
					drawStyle: value.drawStyle,
					drawTheme: value.drawTheme,
					drawCounts: value.drawCounts,
					wrapperBackground: value.wrapperBackground,
				};
			} catch (error) {
				console.error("Failed to save config:", error);
			}
		},
	});

	// Update initial values when sheet opens
	useEffect(() => {
		if (open) {
			const determinedUseImage =
				wrapperBackground?.useImage ?? !!wrapperBackground?.backgroundImgUrl;

			const defaultWrapperBackground = {
				useImage: determinedUseImage,
				backgroundImage: null as File | null,
				backgroundColor: wrapperBackground?.backgroundColor ?? "",
			};
			initialValuesRef.current = {
				drawStyle,
				drawTheme,
				drawCounts,
				wrapperBackground: defaultWrapperBackground,
			};
			form.reset({
				drawStyle,
				drawTheme,
				drawCounts,
				wrapperBackground: defaultWrapperBackground,
			});
		}
	}, [open, drawStyle, drawTheme, drawCounts, wrapperBackground, form]);

	// Check if form has changes
	const checkHasChanges = (currentValues: typeof form.state.values) => {
		const initial = initialValuesRef.current;
		const useImageChanged =
			currentValues.wrapperBackground.useImage !==
			initial.wrapperBackground.useImage;
		const hasNewImageFile = !!currentValues.wrapperBackground.backgroundImage;
		const backgroundColorChanged =
			currentValues.wrapperBackground.backgroundColor !==
			initial.wrapperBackground.backgroundColor;
		const bgChanged =
			useImageChanged || hasNewImageFile || backgroundColorChanged;

		return (
			currentValues.drawStyle !== initial.drawStyle ||
			currentValues.drawTheme !== initial.drawTheme ||
			currentValues.drawCounts !== initial.drawCounts ||
			bgChanged
		);
	};

	return {
		form,
		checkHasChanges,
		isLoading: updateSessionMutation.isPending,
		wrapperBackground,
	};
}
