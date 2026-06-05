"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Camera,
	Clock,
	ImageIcon,
	Megaphone,
	Monitor,
	Search,
	VideoIcon,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { NameAnimation } from "@/components/welcome-screen/name-animation";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
	DEFAULT_VOICE,
	getVoicesByCategory,
	useTTS,
	VOICES,
	type VoiceId,
} from "@/hooks/use-tts";
import {
	type AnimationType,
	type CheckInDisplayFormData,
	type DisplayMode,
	fetchCheckInDisplay,
	updateCheckInDisplay,
} from "@/lib/api/check-in-display";
import type { Plan, TableAssignment } from "@/lib/api/plan";
import { getPlan, getPlans } from "@/lib/api/plan";
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
	// Text Settings
	const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);
	const [fontSize, setFontSize] = useState(72);
	const [animationType, setAnimationType] = useState<AnimationType>("fade_in");
	const [isBold, setIsBold] = useState(false);
	const [nameColor, setNameColor] = useState("#FFFFFF");
	const [welcomeText, setWelcomeText] = useState("Welcome");
	const [seatingAnnouncementTemplate, setSeatingAnnouncementTemplate] =
		useState("Welcome, #{name}. You are at #{table_label}.");

	// Modes
	const [idleMode, setIdleMode] = useState<DisplayMode>("image");
	const [announcementMode, setAnnouncementMode] =
		useState<DisplayMode>("image");
	const [announcementDuration, setAnnouncementDuration] = useState(5000);

	// Seating Plan
	const [showSeatingPlan, setShowSeatingPlan] = useState(false);
	const [seatingPlanSidebarPosition, setSeatingPlanSidebarPosition] = useState<
		"left" | "right"
	>("left");
	const [seatingPlanDuration, setSeatingPlanDuration] = useState(8000);
	const [activePlanId, setActivePlanId] = useState<number | null>(null);

	// Seating Plan Test Data
	const [selectedTestAssignmentId, setSelectedTestAssignmentId] =
		useState<string>("none");

	// Fetch plans for active session selection
	const { data: plans } = useQuery({
		queryKey: ["plans", eventId],
		queryFn: () => getPlans(eventId.toString()),
		enabled: showSeatingPlan,
	});

	// Fetch detailed plan for test data and preview
	const { data: activePlan } = useQuery({
		queryKey: ["plan", activePlanId],
		queryFn: () => getPlan(activePlanId!.toString()),
		enabled: !!activePlanId && showSeatingPlan,
	});

	// Extract all assignments for testing
	const testAssignments = useMemo(() => {
		if (!activePlan?.plan_objects) return [];
		const assignments: {
			id: string;
			name: string;
			table: string;
			tableId: number;
			assignment: TableAssignment;
		}[] = [];

		for (const obj of activePlan.plan_objects) {
			if (obj.object_type === "table" && obj.table_assignments) {
				for (const assignment of obj.table_assignments) {
					const name =
						assignment.ticket?.attendee_name ||
						assignment.visitor?.full_name ||
						"Unknown Guest";
					assignments.push({
						id: assignment.id.toString(),
						name,
						table: obj.label || `Table ${obj.id}`,
						tableId: obj.id,
						assignment,
					});
				}
			}
		}
		return assignments;
	}, [activePlan]);

	// Auto-set preview name when test assignment changes
	useEffect(() => {
		if (selectedTestAssignmentId !== "none") {
			const found = testAssignments.find(
				(a) => a.id === selectedTestAssignmentId,
			);
			if (found) {
				setPreviewName(found.name);
			}
		}
	}, [selectedTestAssignmentId, testAssignments]);

	// Idle Assets
	const [selectedIdleImage, setSelectedIdleImage] = useState<File | null>(null);
	const [existingIdleImageUrl, setExistingIdleImageUrl] = useState<
		string | null
	>(null);
	const [removeIdleImage, setRemoveIdleImage] = useState(false);
	const [selectedIdleVideo, setSelectedIdleVideo] = useState<File | null>(null);
	const [existingIdleVideoUrl, setExistingIdleVideoUrl] = useState<
		string | null
	>(null);
	const [removeIdleVideo, setRemoveIdleVideo] = useState(false);

	// Announcement Assets
	const [selectedAnnImage, setSelectedAnnImage] = useState<File | null>(null);
	const [existingAnnImageUrl, setExistingAnnImageUrl] = useState<string | null>(
		null,
	);
	const [removeAnnImage, setRemoveAnnImage] = useState(false);
	const [selectedAnnVideo, setSelectedAnnVideo] = useState<File | null>(null);
	const [existingAnnVideoUrl, setExistingAnnVideoUrl] = useState<string | null>(
		null,
	);
	const [removeAnnVideo, setRemoveAnnVideo] = useState(false);

	// Preview & Voice
	const [previewKey, setPreviewKey] = useState(0);
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const [voiceId, setVoiceId] = useState<VoiceId>(DEFAULT_VOICE);
	const [previewName, setPreviewName] = useState("Dato' Ahmad bin Ismail");
	const [isPreviewingAnnouncement, setIsPreviewingAnnouncement] =
		useState(false);

	// TTS hook for preview
	const { speak, error: ttsError } = useTTS({
		enabled: true,
		voiceId,
	});

	// Fetch existing settings
	const {
		data: displaySettings,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["check-in-display", eventId],
		queryFn: () => fetchCheckInDisplay(eventId.toString()),
	});

	// Load existing settings
	useEffect(() => {
		if (displaySettings) {
			setFontFamily(displaySettings.font_family || DEFAULT_FONT);
			setFontSize(displaySettings.font_size || 72);
			setAnimationType(displaySettings.animation_type || "fade_in");
			setIsBold(displaySettings.is_bold || false);
			setNameColor(displaySettings.name_color || "#FFFFFF");
			setWelcomeText(displaySettings.welcome_text || "Welcome");
			setSeatingAnnouncementTemplate(
				displaySettings.seating_announcement_template ||
					"Welcome, #{name}. You are at #{table_label}.",
			);

			setIdleMode(displaySettings.idle_mode || "image");
			setAnnouncementMode(displaySettings.announcement_mode || "image");
			setAnnouncementDuration(displaySettings.announcement_duration || 5000);

			setShowSeatingPlan(displaySettings.show_seating_plan || false);
			setSeatingPlanSidebarPosition(
				displaySettings.seating_plan_sidebar_position || "left",
			);
			setSeatingPlanDuration(displaySettings.seating_plan_duration || 8000);
			setActivePlanId(displaySettings.active_plan_id || null);

			setExistingIdleImageUrl(displaySettings.background_image_url);
			setExistingIdleVideoUrl(displaySettings.idle_video_url);
			setExistingAnnImageUrl(displaySettings.announcement_image_url);
			setExistingAnnVideoUrl(displaySettings.announcement_video_url);

			setVoiceEnabled(displaySettings.voice_enabled ?? true);
			const savedVoiceId = localStorage.getItem(`tts_voice_${eventId}`);
			const isValidVoice = (id: string | null): id is VoiceId =>
				id !== null && VOICES.some((v) => v.id === id);

			if (isValidVoice(savedVoiceId)) {
				setVoiceId(savedVoiceId);
			} else if (isValidVoice(displaySettings.voice_type ?? null)) {
				setVoiceId(displaySettings.voice_type as VoiceId);
			}
		}
	}, [displaySettings, eventId]);

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
		localStorage.setItem(`tts_voice_${eventId}`, voiceId);

		const data: CheckInDisplayFormData = {
			font_family: fontFamily,
			font_size: fontSize,
			animation_type: animationType,
			is_bold: isBold,
			name_color: nameColor,
			voice_enabled: voiceEnabled,
			voice_type: voiceId,
			welcome_text: welcomeText,
			seating_announcement_template: seatingAnnouncementTemplate,
			idle_mode: idleMode,
			announcement_mode: announcementMode,
			announcement_duration: announcementDuration,
			show_seating_plan: showSeatingPlan,
			seating_plan_sidebar_position: seatingPlanSidebarPosition,
			seating_plan_duration: seatingPlanDuration,
			active_plan_id: activePlanId,
			remove_background_image: removeIdleImage,
			remove_idle_video: removeIdleVideo,
			remove_announcement_image: removeAnnImage,
			remove_announcement_video: removeAnnVideo,
		};

		if (selectedIdleImage) data.background_image = selectedIdleImage;
		if (selectedIdleVideo) data.idle_video = selectedIdleVideo;
		if (selectedAnnImage) data.announcement_image = selectedAnnImage;
		if (selectedAnnVideo) data.announcement_video = selectedAnnVideo;

		await updateMutation.mutateAsync(data);
	};

	const triggerPreviewAnimation = () => {
		setIsPreviewingAnnouncement(true);
		setPreviewKey((prev) => prev + 1);

		let textToSpeak = "";
		if (showSeatingPlan && testSeatingContext) {
			textToSpeak = seatingAnnouncementTemplate
				.replace("#{name}", previewName)
				.replace("#{table_label}", testSeatingContext.table_label);
		} else {
			textToSpeak = `${welcomeText}, ${previewName}`;
		}

		speak(textToSpeak);

		setTimeout(() => {
			setIsPreviewingAnnouncement(false);
		}, announcementDuration);
	};

	const testSeatingContext = useMemo(() => {
		if (selectedTestAssignmentId === "none" || !activePlan) return undefined;
		const found = testAssignments.find(
			(a) => a.id === selectedTestAssignmentId,
		);
		if (!found) return undefined;

		// Find all guests at the same table
		const tableObj = activePlan.plan_objects?.find(
			(o) => o.id === found.tableId,
		);
		const tableGuests =
			tableObj?.table_assignments?.map((ta) => ({
				name:
					ta.ticket?.attendee_name || ta.visitor?.full_name || "Unknown Guest",
				is_checked_in: true,
			})) || [];

		return {
			plan_id: activePlan.id,
			table_id: found.tableId,
			table_label: found.table,
			table_guests: tableGuests,
		};
	}, [selectedTestAssignmentId, activePlan, testAssignments]);

	if (isLoading)
		return <LoadingState title="Loading..." description="Fetching settings" />;
	if (error)
		return <div className="text-destructive">Failed to load settings.</div>;

	const previewIdleUrl =
		idleMode === "video"
			? selectedIdleVideo
				? URL.createObjectURL(selectedIdleVideo)
				: existingIdleVideoUrl
					? `${API_BASE_URL}${existingIdleVideoUrl}`
					: null
			: selectedIdleImage
				? URL.createObjectURL(selectedIdleImage)
				: existingIdleImageUrl
					? `${API_BASE_URL}${existingIdleImageUrl}`
					: null;

	const previewAnnUrl =
		announcementMode === "video"
			? selectedAnnVideo
				? URL.createObjectURL(selectedAnnVideo)
				: existingAnnVideoUrl
					? `${API_BASE_URL}${existingAnnVideoUrl}`
					: null
			: selectedAnnImage
				? URL.createObjectURL(selectedAnnImage)
				: existingAnnImageUrl
					? `${API_BASE_URL}${existingAnnImageUrl}`
					: null;

	const currentPreviewUrl = isPreviewingAnnouncement
		? previewAnnUrl
		: previewIdleUrl;

	return (
		<section className="h-full w-full">
			<FieldSet className="h-full w-full gap-1">
				<div className="flex flex-col items-start justify-between gap-2 pb-2">
					<div className="flex-1">
						<FieldLegend className="font-bold text-xl!">
							Welcome Screen
						</FieldLegend>
						<FieldDescription>
							Configure idle and check-in display states.
						</FieldDescription>
					</div>
				</div>
				<FieldSeparator />

				<div className="space-y-6 py-4">
					{/* Text Style Toolbar - Condensed & Breathable */}
					<TooltipProvider delayDuration={0}>
						<div className="flex flex-wrap items-center gap-6 border border-slate-200 bg-slate-50 p-4">
							<div className="flex items-center gap-5 border-slate-200 border-r pr-6">
								<div className="flex items-center gap-3">
									<label className="whitespace-nowrap font-bold text-slate-500 text-xs uppercase">
										Font
									</label>
									<Select value={fontFamily} onValueChange={setFontFamily}>
										<SelectTrigger className="h-9 w-[180px] rounded-none border-slate-200 bg-white px-3 text-[13px] shadow-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{getFontNames().map((f) => (
												<SelectItem key={f} value={f}>
													{f}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center gap-3">
									<label className="whitespace-nowrap font-bold text-slate-500 text-xs uppercase">
										Size
									</label>
									<Select
										value={fontSize.toString()}
										onValueChange={(v) => setFontSize(Number(v))}
									>
										<SelectTrigger className="h-9 w-[90px] rounded-none border-slate-200 bg-white px-3 text-[13px] shadow-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FONT_SIZES.map((s) => (
												<SelectItem key={s} value={s.toString()}>
													{s}px
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="ml-2 flex cursor-help items-center gap-3 border-slate-100 border-l pl-2">
											<Switch
												checked={isBold}
												onCheckedChange={setIsBold}
												className="scale-90"
											/>
											<span
												className={cn(
													"font-bold text-xs uppercase",
													isBold ? "text-primary" : "text-slate-500",
												)}
											>
												Bold
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent side="top">Toggle Bold Weight</TooltipContent>
								</Tooltip>
							</div>

							<div className="flex items-center gap-6">
								<div className="flex items-center gap-3">
									<label className="whitespace-nowrap font-bold text-slate-500 text-xs uppercase">
										Animation
									</label>
									<div className="w-[150px]">
										<Select
											value={animationType}
											onValueChange={(v) =>
												setAnimationType(v as AnimationType)
											}
										>
											<SelectTrigger className="h-9 rounded-none border-slate-200 bg-white px-3 text-[13px] shadow-sm">
												<SelectValue placeholder="Animation" />
											</SelectTrigger>
											<SelectContent>
												{ANIMATION_TYPES.map((a) => (
													<SelectItem key={a.value} value={a.value}>
														{a.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<label className="whitespace-nowrap font-bold text-slate-500 text-xs uppercase">
										Color
									</label>
									<div className="w-[130px]">
										<Select value={nameColor} onValueChange={setNameColor}>
											<SelectTrigger className="h-9 rounded-none border-slate-200 bg-white px-3 text-[13px] shadow-sm">
												<SelectValue placeholder="Color" />
											</SelectTrigger>
											<SelectContent>
												{NAME_COLORS.map((c) => (
													<SelectItem key={c.value} value={c.value}>
														<div className="flex items-center gap-2">
															<div
																className="size-3 border border-slate-200"
																style={{ backgroundColor: c.value }}
															/>
															<span>{c.label}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</div>
					</TooltipProvider>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Configuration Column */}
						<div className="space-y-6 lg:col-span-2">
							<Tabs defaultValue="idle">
								<TabsList className="h-12 w-full rounded-none bg-slate-100 p-1">
									<TabsTrigger
										value="idle"
										className="flex-1 gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<Monitor className="h-4 w-4" /> Idle State
									</TabsTrigger>
									<TabsTrigger
										value="announcement"
										className="flex-1 gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<Megaphone className="h-4 w-4" /> Announcement State
									</TabsTrigger>
								</TabsList>

								<TabsContent
									value="idle"
									className="space-y-4 border border-t-0 p-4"
								>
									<FieldGroup>
										<FieldLabel>Idle Display Mode</FieldLabel>
										<div className="flex gap-4">
											<Button
												variant={idleMode === "image" ? "default" : "outline"}
												size="sm"
												className="flex-1 rounded-none"
												onClick={() => setIdleMode("image")}
											>
												Image
											</Button>
											<Button
												variant={idleMode === "video" ? "default" : "outline"}
												size="sm"
												className="flex-1 rounded-none"
												onClick={() => setIdleMode("video")}
											>
												Video Loop
											</Button>
										</div>
									</FieldGroup>

									{idleMode === "image" ? (
										<AssetUpload
											label="Background Image"
											preview={
												selectedIdleImage
													? URL.createObjectURL(selectedIdleImage)
													: existingIdleImageUrl
														? `${API_BASE_URL}${existingIdleImageUrl}`
														: null
											}
											onFileSelect={(file: File | null) => {
												setSelectedIdleImage(file);
												setRemoveIdleImage(false);
											}}
											onRemove={() => {
												setSelectedIdleImage(null);
												setExistingIdleImageUrl(null);
												setRemoveIdleImage(true);
											}}
											accept="image/*"
										/>
									) : (
										<AssetUpload
											label="Background Video"
											preview={
												selectedIdleVideo
													? URL.createObjectURL(selectedIdleVideo)
													: existingIdleVideoUrl
														? `${API_BASE_URL}${existingIdleVideoUrl}`
														: null
											}
											onFileSelect={(file: File | null) => {
												setSelectedIdleVideo(file);
												setRemoveIdleVideo(false);
											}}
											onRemove={() => {
												setSelectedIdleVideo(null);
												setExistingIdleVideoUrl(null);
												setRemoveIdleVideo(true);
											}}
											accept="video/*"
											isVideo
										/>
									)}
								</TabsContent>

								<TabsContent
									value="announcement"
									className="space-y-4 border border-t-0 p-4"
								>
									<div className="grid grid-cols-2 gap-4">
										<FieldGroup>
											<FieldLabel>Display Mode</FieldLabel>
											<Select
												value={announcementMode}
												onValueChange={(v) =>
													setAnnouncementMode(v as DisplayMode)
												}
											>
												<SelectTrigger className="h-9 rounded-none">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="image">Image</SelectItem>
													<SelectItem value="video">Video Animation</SelectItem>
												</SelectContent>
											</Select>
										</FieldGroup>
										<FieldGroup>
											<FieldLabel>Display Duration (Seconds)</FieldLabel>
											<Input
												type="number"
												value={announcementDuration / 1000}
												onChange={(e) =>
													setAnnouncementDuration(Number(e.target.value) * 1000)
												}
												className="h-9 rounded-none"
												min={1}
												step={0.5}
											/>
										</FieldGroup>
									</div>

									{announcementMode === "image" ? (
										<AssetUpload
											label="Check-In Image"
											preview={
												selectedAnnImage
													? URL.createObjectURL(selectedAnnImage)
													: existingAnnImageUrl
														? `${API_BASE_URL}${existingAnnImageUrl}`
														: null
											}
											onFileSelect={(file: File | null) => {
												setSelectedAnnImage(file);
												setRemoveAnnImage(false);
											}}
											onRemove={() => {
												setSelectedAnnImage(null);
												setExistingAnnImageUrl(null);
												setRemoveAnnImage(true);
											}}
											accept="image/*"
										/>
									) : (
										<AssetUpload
											label="Check-In Video"
											preview={
												selectedAnnVideo
													? URL.createObjectURL(selectedAnnVideo)
													: existingAnnVideoUrl
														? `${API_BASE_URL}${existingAnnVideoUrl}`
														: null
											}
											onFileSelect={(file: File | null) => {
												setSelectedAnnVideo(file);
												setRemoveAnnVideo(false);
											}}
											onRemove={() => {
												setSelectedAnnVideo(null);
												setExistingAnnVideoUrl(null);
												setRemoveAnnVideo(true);
											}}
											accept="video/*"
											isVideo
										/>
									)}
								</TabsContent>
							</Tabs>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3">
									<div className="flex items-center justify-between">
										<FieldLabel className="mb-0 font-bold text-[10px] text-slate-500 uppercase">
											Voice Announcement
										</FieldLabel>
										<Switch
											checked={voiceEnabled}
											onCheckedChange={setVoiceEnabled}
											className="scale-75"
										/>
									</div>
									{voiceEnabled && (
										<FieldGroup className="space-y-1">
											<Select
												value={voiceId}
												onValueChange={(v) => setVoiceId(v as VoiceId)}
											>
												<SelectTrigger className="h-8 rounded-none bg-white text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{getVoicesByCategory().malay.map((v) => (
														<SelectItem key={v.id} value={v.id}>
															{v.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FieldGroup>
									)}
								</div>

								{/* Seating Plan Settings */}
								<div className="flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3">
									<div className="flex items-center justify-between">
										<FieldLabel className="mb-0 font-bold text-[10px] text-slate-500 uppercase">
											Show Seating Plan
										</FieldLabel>
										<Switch
											checked={showSeatingPlan}
											onCheckedChange={(checked) => {
												setShowSeatingPlan(checked);
												if (!checked) setActivePlanId(null);
											}}
											className="scale-75"
										/>
									</div>
									{showSeatingPlan && (
										<div className="flex items-center gap-2">
											<Select
												value={seatingPlanSidebarPosition}
												onValueChange={(v) =>
													setSeatingPlanSidebarPosition(v as "left" | "right")
												}
											>
												<SelectTrigger className="h-8 flex-1 rounded-none bg-white text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="left">Left</SelectItem>
													<SelectItem value="right">Right</SelectItem>
												</SelectContent>
											</Select>
											<div className="flex items-center gap-2">
												<span className="whitespace-nowrap font-bold text-[10px] text-slate-500 uppercase">
													Duration (Sec)
												</span>
												<Input
													type="number"
													value={seatingPlanDuration / 1000}
													onChange={(e) =>
														setSeatingPlanDuration(
															Number(e.target.value) * 1000,
														)
													}
													className="h-8 w-[80px] rounded-none text-xs"
													placeholder="sec"
													min={1}
													step={0.5}
												/>
											</div>
										</div>
									)}
								</div>
							</div>

							{showSeatingPlan && (
								<div className="flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3">
									<FieldGroup className="space-y-2">
										<FieldLabel className="font-bold text-[10px] text-slate-500 uppercase">
											Active Seating Session
										</FieldLabel>
										<Select
											value={activePlanId?.toString() || "none"}
											onValueChange={(v) => {
												setActivePlanId(v === "none" ? null : Number(v));
												setSelectedTestAssignmentId("none");
											}}
										>
											<SelectTrigger className="h-9 rounded-none bg-white text-xs">
												<SelectValue placeholder="Select active session" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">
													No active plan (Hide map)
												</SelectItem>
												{plans?.map((p) => (
													<SelectItem key={p.id} value={p.id.toString()}>
														{p.name} ({p.tables_count || 0} Tables)
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FieldGroup>

									{activePlanId && (
										<FieldGroup className="space-y-2 border-t pt-3">
											<FieldLabel className="font-bold text-[10px] text-slate-500 uppercase">
												Seating Voice Template
											</FieldLabel>
											<Input
												value={seatingAnnouncementTemplate}
												onChange={(e) =>
													setSeatingAnnouncementTemplate(e.target.value)
												}
												placeholder="Welcome, #{name}. You are at #{table_label}."
												className="h-9 rounded-none bg-white text-xs"
											/>
											<p className="text-[9px] text-slate-400 italic">
												Use <span className="font-bold">#{"{name}"}</span> and{" "}
												<span className="font-bold">#{"{table_label}"}</span> as
												variables.
											</p>
										</FieldGroup>
									)}

									{activePlanId && (
										<FieldGroup className="space-y-2 border-t pt-3">
											<div className="flex items-center justify-between">
												<FieldLabel className="font-bold text-[10px] text-slate-500 uppercase">
													Select Guest to Test
												</FieldLabel>
												{selectedTestAssignmentId !== "none" && (
													<Button
														variant="ghost"
														size="sm"
														className="h-5 px-1 font-bold text-[9px] text-primary uppercase hover:text-primary/80"
														onClick={() => setSelectedTestAssignmentId("none")}
													>
														Reset
													</Button>
												)}
											</div>
											<Select
												value={selectedTestAssignmentId}
												onValueChange={setSelectedTestAssignmentId}
											>
												<SelectTrigger className="h-9 rounded-none bg-white text-xs">
													<SelectValue placeholder="Pick a guest from this plan" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">
														Manual Preview (Name Only)
													</SelectItem>
													<SelectGroup>
														<SelectLabel>
															Assigned Guests ({testAssignments.length})
														</SelectLabel>
														{testAssignments.map((a) => (
															<SelectItem key={a.id} value={a.id}>
																{a.name} ({a.table})
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FieldGroup>
									)}
								</div>
							)}
						</div>

						{/* Preview Column */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<FieldLabel className="mb-0">Live Preview</FieldLabel>
								<Button
									size="sm"
									variant="outline"
									className="h-7 rounded-none text-xs"
									onClick={triggerPreviewAnimation}
								>
									Test Animation
								</Button>
							</div>
							<div className="relative aspect-video overflow-hidden border bg-slate-900">
								<WelcomeScreenView
									eventTitle="Event Preview"
									latestCheckIn={
										isPreviewingAnnouncement
											? {
													name: previewName,
													seating_context: testSeatingContext,
													checked_in_at: new Date().toISOString(),
												}
											: null
									}
									activePlan={activePlan}
									fontFamily={fontFamily}
									fontSize={fontSize / 2.5}
									animationType={animationType}
									isBold={isBold}
									nameColor={nameColor}
									welcomeText={welcomeText}
									showSeatingPlan={showSeatingPlan}
									seatingPlanSidebarPosition={seatingPlanSidebarPosition}
									idleMode={idleMode}
									announcementMode={announcementMode}
									idleImageUrl={previewIdleUrl}
									idleVideoUrl={previewIdleUrl}
									announcementImageUrl={previewAnnUrl}
									announcementVideoUrl={previewAnnUrl}
									isAnnouncing={isPreviewingAnnouncement}
								/>
							</div>
							<div className="space-y-2">
								<FieldLabel className="font-bold text-[10px] text-slate-400 uppercase">
									Preview Data
								</FieldLabel>
								<Input
									value={welcomeText}
									onChange={(e) => setWelcomeText(e.target.value)}
									placeholder="Welcome"
									className="h-8 rounded-none text-xs"
								/>
								<Input
									value={previewName}
									onChange={(e) => setPreviewName(e.target.value)}
									placeholder="Name"
									className="h-8 rounded-none text-xs"
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-auto flex justify-end gap-3 border-t pt-6">
					<Button variant="outline" className="rounded-none" onClick={onClose}>
						Cancel
					</Button>
					<Button
						className="rounded-none px-8"
						onClick={handleSave}
						disabled={updateMutation.isPending}
					>
						{updateMutation.isPending ? "Saving..." : "Save Configuration"}
					</Button>
				</div>
			</FieldSet>
		</section>
	);
}

function AssetUpload({
	label,
	preview,
	onFileSelect,
	onRemove,
	accept,
	isVideo = false,
}: any) {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<div className="space-y-2">
			<FieldLabel className="text-xs">{label}</FieldLabel>
			<div
				className="group relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-slate-200 border-dashed bg-slate-50/50 transition-colors hover:border-primary/50"
				onClick={() => inputRef.current?.click()}
			>
				{preview ? (
					<>
						{isVideo ? (
							<video src={preview} className="h-full w-full object-cover" />
						) : (
							<img src={preview} className="h-full w-full object-cover" />
						)}
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
							<p className="font-bold text-[10px] text-white uppercase">
								Change File
							</p>
						</div>
						<Button
							size="icon"
							variant="destructive"
							className="absolute top-1 right-1 z-20 h-6 w-6 rounded-none"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
						>
							<X className="h-3 w-3" />
						</Button>
					</>
				) : (
					<div className="p-4 text-center">
						{isVideo ? (
							<VideoIcon className="mx-auto mb-1 h-6 w-6 text-slate-300" />
						) : (
							<ImageIcon className="mx-auto mb-1 h-6 w-6 text-slate-300" />
						)}
						<p className="font-bold text-[10px] text-slate-400 uppercase">
							Click to Upload
						</p>
					</div>
				)}
				<input
					type="file"
					ref={inputRef}
					className="hidden"
					accept={accept}
					onChange={(e) =>
						e.target.files?.[0] && onFileSelect(e.target.files[0])
					}
				/>
			</div>
		</div>
	);
}
