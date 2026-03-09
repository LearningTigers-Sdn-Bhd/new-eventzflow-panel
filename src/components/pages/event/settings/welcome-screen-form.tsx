"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, VideoIcon, X, Monitor, Megaphone, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
import { NameAnimation } from "@/components/welcome-screen/name-animation";
import {
	DEFAULT_VOICE,
	type VoiceId,
	VOICES,
	getVoicesByCategory,
	useTTS,
} from "@/hooks/use-tts";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
	type AnimationType,
	type DisplayMode,
	type CheckInDisplayFormData,
	fetchCheckInDisplay,
	updateCheckInDisplay,
} from "@/lib/api/check-in-display";
import { getPlans } from "@/lib/api/plan";
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
	
	// Modes
	const [idleMode, setIdleMode] = useState<DisplayMode>("image");
	const [announcementMode, setAnnouncementMode] = useState<DisplayMode>("image");
	const [announcementDuration, setAnnouncementDuration] = useState(5000);

	// Seating Plan
	const [showSeatingPlan, setShowSeatingPlan] = useState(false);
	const [seatingPlanSidebarPosition, setSeatingPlanSidebarPosition] = useState<"left" | "right">("left");
	const [activePlanId, setActivePlanId] = useState<number | null>(null);

	// Fetch plans for active session selection
	const { data: plans } = useQuery({
		queryKey: ["plans", eventId],
		queryFn: () => getPlans(eventId.toString()),
		enabled: showSeatingPlan,
	});

	// Idle Assets
	const [selectedIdleImage, setSelectedIdleImage] = useState<File | null>(null);
	const [existingIdleImageUrl, setExistingIdleImageUrl] = useState<string | null>(null);
	const [removeIdleImage, setRemoveIdleImage] = useState(false);
	const [selectedIdleVideo, setSelectedIdleVideo] = useState<File | null>(null);
	const [existingIdleVideoUrl, setExistingIdleVideoUrl] = useState<string | null>(null);
	const [removeIdleVideo, setRemoveIdleVideo] = useState(false);

	// Announcement Assets
	const [selectedAnnImage, setSelectedAnnImage] = useState<File | null>(null);
	const [existingAnnImageUrl, setExistingAnnImageUrl] = useState<string | null>(null);
	const [removeAnnImage, setRemoveAnnImage] = useState(false);
	const [selectedAnnVideo, setSelectedAnnVideo] = useState<File | null>(null);
	const [existingAnnVideoUrl, setExistingAnnVideoUrl] = useState<string | null>(null);
	const [removeAnnVideo, setRemoveAnnVideo] = useState(false);

	// Preview & Voice
	const [previewKey, setPreviewKey] = useState(0);
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const [voiceId, setVoiceId] = useState<VoiceId>(DEFAULT_VOICE);
	const [previewName, setPreviewName] = useState("Dato' Ahmad bin Ismail");
	const [isPreviewingAnnouncement, setIsPreviewingAnnouncement] = useState(false);

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
			
			setIdleMode(displaySettings.idle_mode || "image");
			setAnnouncementMode(displaySettings.announcement_mode || "image");
			setAnnouncementDuration(displaySettings.announcement_duration || 5000);

			setShowSeatingPlan(displaySettings.show_seating_plan || false);
			setSeatingPlanSidebarPosition(displaySettings.seating_plan_sidebar_position || "left");
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
			queryClient.invalidateQueries({ queryKey: ["check-in-display", eventId] });
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
			idle_mode: idleMode,
			announcement_mode: announcementMode,
			announcement_duration: announcementDuration,
			show_seating_plan: showSeatingPlan,
			seating_plan_sidebar_position: seatingPlanSidebarPosition,
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
		speak(`${welcomeText}, ${previewName}`);
		
		setTimeout(() => {
			setIsPreviewingAnnouncement(false);
		}, announcementDuration);
	};

	if (isLoading) return <LoadingState title="Loading..." description="Fetching settings" />;
	if (error) return <div className="text-destructive">Failed to load settings.</div>;

	const previewIdleUrl = idleMode === 'video' 
		? (selectedIdleVideo ? URL.createObjectURL(selectedIdleVideo) : (existingIdleVideoUrl ? `${API_BASE_URL}${existingIdleVideoUrl}` : null))
		: (selectedIdleImage ? URL.createObjectURL(selectedIdleImage) : (existingIdleImageUrl ? `${API_BASE_URL}${existingIdleImageUrl}` : null));

	const previewAnnUrl = announcementMode === 'video' 
		? (selectedAnnVideo ? URL.createObjectURL(selectedAnnVideo) : (existingAnnVideoUrl ? `${API_BASE_URL}${existingAnnVideoUrl}` : null))
		: (selectedAnnImage ? URL.createObjectURL(selectedAnnImage) : (existingAnnImageUrl ? `${API_BASE_URL}${existingAnnImageUrl}` : null));

	const currentPreviewUrl = isPreviewingAnnouncement ? previewAnnUrl : previewIdleUrl;

	return (
		<section className="h-full w-full">
			<FieldSet className="h-full w-full gap-1">
				<div className="flex flex-col items-start justify-between gap-2 pb-2">
					<div className="flex-1">
						<FieldLegend className="font-bold text-xl!">Welcome Screen</FieldLegend>
						<FieldDescription>Configure idle and check-in display states.</FieldDescription>
					</div>
				</div>
				<FieldSeparator />

				<div className="space-y-6 py-4">
					{/* Text Style Toolbar */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-5 bg-slate-50 p-4 border">
						<FieldGroup>
							<FieldLabel>Font</FieldLabel>
							<Select value={fontFamily} onValueChange={setFontFamily}>
								<SelectTrigger className="rounded-none h-8 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getFontNames().map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
								</SelectContent>
							</Select>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Size</FieldLabel>
							<Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number(v))}>
								<SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
								<SelectContent>{FONT_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s}px</SelectItem>)}</SelectContent>
							</Select>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Animation</FieldLabel>
							<Select value={animationType} onValueChange={(v) => setAnimationType(v as AnimationType)}>
								<SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
								<SelectContent>{ANIMATION_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
							</Select>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Color</FieldLabel>
							<Select value={nameColor} onValueChange={setNameColor}>
								<SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
								<SelectContent>{NAME_COLORS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
							</Select>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Bold</FieldLabel>
							<div className="flex h-8 items-center"><Switch checked={isBold} onCheckedChange={setIsBold} /></div>
						</FieldGroup>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Configuration Column */}
						<div className="lg:col-span-2 space-y-6">
							<Tabs defaultValue="idle">
								<TabsList className="w-full rounded-none h-12 bg-slate-100 p-1">
									<TabsTrigger value="idle" className="flex-1 gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
										<Monitor className="h-4 w-4" /> Idle State
									</TabsTrigger>
									<TabsTrigger value="announcement" className="flex-1 gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
										<Megaphone className="h-4 w-4" /> Announcement State
									</TabsTrigger>
								</TabsList>

								<TabsContent value="idle" className="p-4 border border-t-0 space-y-4">
									<FieldGroup>
										<FieldLabel>Idle Display Mode</FieldLabel>
										<div className="flex gap-4">
											<Button variant={idleMode === 'image' ? 'default' : 'outline'} size="sm" className="rounded-none flex-1" onClick={() => setIdleMode('image')}>Image</Button>
											<Button variant={idleMode === 'video' ? 'default' : 'outline'} size="sm" className="rounded-none flex-1" onClick={() => setIdleMode('video')}>Video Loop</Button>
										</div>
									</FieldGroup>

									{idleMode === 'image' ? (
										<AssetUpload
											label="Background Image"
											preview={selectedIdleImage ? URL.createObjectURL(selectedIdleImage) : (existingIdleImageUrl ? `${API_BASE_URL}${existingIdleImageUrl}` : null)}
											onFileSelect={(file) => { setSelectedIdleImage(file); setRemoveIdleImage(false); }}
											onRemove={() => { setSelectedIdleImage(null); setExistingIdleImageUrl(null); setRemoveIdleImage(true); }}
											accept="image/*"
										/>
									) : (
										<AssetUpload
											label="Background Video"
											preview={selectedIdleVideo ? URL.createObjectURL(selectedIdleVideo) : (existingIdleVideoUrl ? `${API_BASE_URL}${existingIdleVideoUrl}` : null)}
											onFileSelect={(file) => { setSelectedIdleVideo(file); setRemoveIdleVideo(false); }}
											onRemove={() => { setSelectedIdleVideo(null); setExistingIdleVideoUrl(null); setRemoveIdleVideo(true); }}
											accept="video/*"
											isVideo
										/>
									)}
								</TabsContent>

								<TabsContent value="announcement" className="p-4 border border-t-0 space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<FieldGroup>
											<FieldLabel>Display Mode</FieldLabel>
											<Select value={announcementMode} onValueChange={(v) => setAnnouncementMode(v as DisplayMode)}>
												<SelectTrigger className="rounded-none h-9"><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value="image">Image</SelectItem>
													<SelectItem value="video">Video Animation</SelectItem>
												</SelectContent>
											</Select>
										</FieldGroup>
										<FieldGroup>
											<FieldLabel>Duration (ms)</FieldLabel>
											<Input 
												type="number" 
												value={announcementDuration} 
												onChange={(e) => setAnnouncementDuration(Number(e.target.value))}
												className="rounded-none h-9"
											/>
										</FieldGroup>
									</div>

									{announcementMode === 'image' ? (
										<AssetUpload
											label="Check-In Image"
											preview={selectedAnnImage ? URL.createObjectURL(selectedAnnImage) : (existingAnnImageUrl ? `${API_BASE_URL}${existingAnnImageUrl}` : null)}
											onFileSelect={(file) => { setSelectedAnnImage(file); setRemoveAnnImage(false); }}
											onRemove={() => { setSelectedAnnImage(null); setExistingAnnImageUrl(null); setRemoveAnnImage(true); }}
											accept="image/*"
										/>
									) : (
										<AssetUpload
											label="Check-In Video"
											preview={selectedAnnVideo ? URL.createObjectURL(selectedAnnVideo) : (existingAnnVideoUrl ? `${API_BASE_URL}${existingAnnVideoUrl}` : null)}
											onFileSelect={(file) => { setSelectedAnnVideo(file); setRemoveAnnVideo(false); }}
											onRemove={() => { setSelectedAnnVideo(null); setExistingAnnVideoUrl(null); setRemoveAnnVideo(true); }}
											accept="video/*"
											isVideo
										/>
									)}
								</TabsContent>
							</Tabs>

							<div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border">
								<FieldGroup>
									<FieldLabel>Voice Announcement</FieldLabel>
									<Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
								</FieldGroup>
								{voiceEnabled && (
									<FieldGroup>
										<FieldLabel>Voice Language</FieldLabel>
										<Select value={voiceId} onValueChange={(v) => setVoiceId(v as VoiceId)}>
											<SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
											<SelectContent>
												{getVoicesByCategory().malay.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
											</SelectContent>
										</Select>
									</FieldGroup>
								)}
							</div>

							{/* Seating Plan Settings */}
							<div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 border">
								<div className="grid grid-cols-2 gap-4">
									<FieldGroup>
										<FieldLabel>Show Seating Plan</FieldLabel>
										<Switch 
											checked={showSeatingPlan} 
											onCheckedChange={(checked) => {
												setShowSeatingPlan(checked);
												if (!checked) setActivePlanId(null);
											}} 
										/>
									</FieldGroup>
									{showSeatingPlan && (
										<FieldGroup>
											<FieldLabel>Sidebar Position</FieldLabel>
											<Select value={seatingPlanSidebarPosition} onValueChange={(v) => setSeatingPlanSidebarPosition(v as "left" | "right")}>
												<SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value="left">Left Side</SelectItem>
													<SelectItem value="right">Right Side</SelectItem>
												</SelectContent>
											</Select>
										</FieldGroup>
									)}
								</div>
								
								{showSeatingPlan && (
									<FieldGroup className="border-t pt-4">
										<FieldLabel>Current Live Seating Session</FieldLabel>
										<Select 
											value={activePlanId?.toString() || "none"} 
											onValueChange={(v) => setActivePlanId(v === "none" ? null : Number(v))}
										>
											<SelectTrigger className="rounded-none h-10">
												<SelectValue placeholder="Select active session (e.g. Dinner, Morning Ceremony)" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">No active plan (Hide map)</SelectItem>
												{plans?.map((p) => (
													<SelectItem key={p.id} value={p.id.toString()}>
														{p.name} ({p.tables_count || 0} Tables)
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription className="text-[10px]">
											Announcements will only show seats assigned in this specific plan.
										</FieldDescription>
									</FieldGroup>
								)}
							</div>
						</div>

						{/* Preview Column */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<FieldLabel className="mb-0">Live Preview</FieldLabel>
								<Button size="sm" variant="outline" className="h-7 rounded-none text-xs" onClick={triggerPreviewAnimation}>Test Animation</Button>
							</div>
							<div className="aspect-video relative bg-slate-900 border overflow-hidden flex items-center justify-center">
								{idleMode === 'video' && !isPreviewingAnnouncement && previewIdleUrl && (
									<video src={previewIdleUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
								)}
								{idleMode === 'image' && !isPreviewingAnnouncement && previewIdleUrl && (
									<img src={previewIdleUrl} className="absolute inset-0 w-full h-full object-cover" />
								)}
								{isPreviewingAnnouncement && announcementMode === 'video' && previewAnnUrl && (
									<video src={previewAnnUrl} autoPlay muted className="absolute inset-0 w-full h-full object-cover z-10" />
								)}
								{isPreviewingAnnouncement && announcementMode === 'image' && previewAnnUrl && (
									<img src={previewAnnUrl} className="absolute inset-0 w-full h-full object-cover z-10" />
								)}
								
								<div className="absolute inset-0 bg-black/20 z-20" />
								
								<div className="relative z-30 text-center px-4">
									{isPreviewingAnnouncement ? (
										<>
											<p className="uppercase tracking-widest text-white text-[10px] mb-1">{welcomeText}</p>
											<NameAnimation
												key={previewKey}
												name={previewName}
												animationType={animationType}
												fontFamily={fontFamily}
												fontSize={fontSize / 3}
												isBold={isBold}
												nameColor={nameColor}
											/>
										</>
									) : (
										<p className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">Waiting for Check-In...</p>
									)}
								</div>
							</div>
							<div className="space-y-2">
								<FieldLabel className="text-[10px] uppercase font-bold text-slate-400">Preview Data</FieldLabel>
								<Input value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} placeholder="Welcome" className="h-8 rounded-none text-xs" />
								<Input value={previewName} onChange={(e) => setPreviewName(e.target.value)} placeholder="Name" className="h-8 rounded-none text-xs" />
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-6 border-t mt-auto">
					<Button variant="outline" className="rounded-none" onClick={onClose}>Cancel</Button>
					<Button className="rounded-none px-8" onClick={handleSave} disabled={updateMutation.isPending}>
						{updateMutation.isPending ? "Saving..." : "Save Configuration"}
					</Button>
				</div>
			</FieldSet>
		</section>
	);
}

function AssetUpload({ label, preview, onFileSelect, onRemove, accept, isVideo = false }: any) {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<div className="space-y-2">
			<FieldLabel className="text-xs">{label}</FieldLabel>
			<div 
				className="h-32 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative bg-slate-50/50 overflow-hidden group"
				onClick={() => inputRef.current?.click()}
			>
				{preview ? (
					<>
						{isVideo ? (
							<video src={preview} className="h-full w-full object-cover" />
						) : (
							<img src={preview} className="h-full w-full object-cover" />
						)}
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<p className="text-white text-[10px] font-bold uppercase">Change File</p>
						</div>
						<Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 rounded-none z-20" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
							<X className="h-3 w-3" />
						</Button>
					</>
				) : (
					<div className="text-center p-4">
						{isVideo ? <VideoIcon className="h-6 w-6 text-slate-300 mx-auto mb-1" /> : <ImageIcon className="h-6 w-6 text-slate-300 mx-auto mb-1" />}
						<p className="text-[10px] text-slate-400 font-bold uppercase">Click to Upload</p>
					</div>
				)}
				<input type="file" ref={inputRef} className="hidden" accept={accept} onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
			</div>
		</div>
	);
}
