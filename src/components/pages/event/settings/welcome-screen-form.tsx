"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  ImageIcon, VideoIcon, X, Monitor, Megaphone, 
  Clock, Search, Camera, Plus, Sparkles, 
  Settings2, ExternalLink, Trash2, GripVertical,
  Layers, Type, Layout, Music2, Play, Eye
} from "lucide-react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
import {
	DEFAULT_VOICE,
	type VoiceId,
	VOICES,
	getVoicesByCategory,
	useTTS,
} from "@/hooks/use-tts";
import {
	type AnimationType,
	type DisplayMode,
	type CheckInDisplayFormData,
	fetchCheckInDisplay,
	updateCheckInDisplay,
} from "@/lib/api/check-in-display";
import { getPlans, getPlan } from "@/lib/api/plan";
import type { Plan, TableAssignment } from "@/lib/api/plan";
import { DEFAULT_FONT, getFontNames, getGoogleFontsUrl } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useUserSessionStore } from "@/stores/new-auth-store";
import { API_BASE_URL, queryClient } from "@/utils/rest-api";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { VoiceCloningModal } from "./voice-cloning/voice-cloning-modal";
import { VoiceLibraryModal } from "./voice-cloning/voice-library-modal";
import { useClonedVoices } from "@/hooks/use-cloned-voices";
import { useFullEvent } from "@/hooks/use-full-event";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

interface VoiceRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  voice_id?: string;
  voice_ids?: string[];
}

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
	const [seatingAnnouncementTemplate, setSeatingAnnouncementTemplate] = useState("Welcome, #{name}. You are at #{table_label}.");
	
	// Modes
	const [idleMode, setIdleMode] = useState<DisplayMode>("image");
	const [announcementMode, setAnnouncementMode] = useState<DisplayMode>("image");
	const [announcementDuration, setAnnouncementDuration] = useState(5000);

	// Seating Plan
	const [showSeatingPlan, setShowSeatingPlan] = useState(false);
	const [seatingPlanSidebarPosition, setSeatingPlanSidebarPosition] = useState<"left" | "right">("left");
	const [seatingPlanDuration, setSeatingPlanDuration] = useState(8000);
	const [activePlanId, setActivePlanId] = useState<number | null>(null);

  // Voice Rules
  const [voiceRules, setVoiceRules] = useState<VoiceRule[]>([]);

	// Fetch Full Event for custom fields
	const { data: event } = useFullEvent(eventId);

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

	// Voice Settings
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const [voiceId, setVoiceId] = useState<VoiceId>(DEFAULT_VOICE);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
	const [isCloningModalOpen, setIsCloningModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const currentUser = useUserSessionStore((state) => state.user);
	const ownerId = currentUser?.id;

	// Fetch cloned voices for this user/owner
	const { data: clonedVoices } = useClonedVoices(ownerId);

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
			setSeatingAnnouncementTemplate(displaySettings.seating_announcement_template || "Welcome, #{name}. You are at #{table_label}.");
			
			setIdleMode(displaySettings.idle_mode || "image");
			setAnnouncementMode(displaySettings.announcement_mode || "image");
			setAnnouncementDuration(displaySettings.announcement_duration || 5000);

			setShowSeatingPlan(displaySettings.show_seating_plan || false);
			setSeatingPlanSidebarPosition(displaySettings.seating_plan_sidebar_position || "left");
			setSeatingPlanDuration(displaySettings.seating_plan_duration || 8000);
			setActivePlanId(displaySettings.active_plan_id || null);

			setExistingIdleImageUrl(displaySettings.background_image_url);
			setExistingIdleVideoUrl(displaySettings.idle_video_url);
			setExistingAnnImageUrl(displaySettings.announcement_image_url);
			setExistingAnnVideoUrl(displaySettings.announcement_video_url);

      if (displaySettings.elevenlabs_settings) {
        setStability(displaySettings.elevenlabs_settings.stability ?? 0.5);
        setSimilarityBoost(displaySettings.elevenlabs_settings.similarity_boost ?? 0.75);
      }

			setVoiceEnabled(displaySettings.voice_enabled ?? true);
			const savedVoiceId = localStorage.getItem(`tts_voice_${eventId}`);
			const isValidVoice = (id: string | null): id is VoiceId =>
				id !== null && (
          VOICES.some((v) => v.id === id) || 
          (clonedVoices?.some((cv) => cv.elevenlabs_id === id) ?? false)
        );

			if (isValidVoice(savedVoiceId)) {
				setVoiceId(savedVoiceId);
			} else if (isValidVoice(displaySettings.voice_type ?? null)) {
				setVoiceId(displaySettings.voice_type as VoiceId);
			}

      setVoiceRules(displaySettings.voice_rules || []);
		}
	}, [displaySettings, eventId, clonedVoices]);

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
      elevenlabs_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
      voice_rules: voiceRules
		};

		if (selectedIdleImage) data.background_image = selectedIdleImage;
		if (selectedIdleVideo) data.idle_video = selectedIdleVideo;
		if (selectedAnnImage) data.announcement_image = selectedAnnImage;
		if (selectedAnnVideo) data.announcement_video = selectedAnnVideo;

		await updateMutation.mutateAsync(data);
	};

  const addVoiceRule = () => {
    setVoiceRules([...voiceRules, {
      id: crypto.randomUUID(),
      field: 'role',
      operator: 'equals',
      value: '',
      voice_id: voiceId
    }]);
  };

  const removeVoiceRule = (id: string) => {
    setVoiceRules(voiceRules.filter(r => r.id !== id));
  };

  const updateVoiceRule = (id: string, updates: Partial<VoiceRule>) => {
    setVoiceRules(voiceRules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

	if (isLoading) return <LoadingState title="Loading..." description="Fetching settings" />;
	if (error) return <div className="text-destructive">Failed to load settings.</div>;

  const availableVoices = [
    ...VOICES.map(v => ({ id: v.id, label: v.label, category: 'Standard' })),
    ...(clonedVoices?.filter(v => v.status === 'ready').map(v => ({ id: v.elevenlabs_id!, label: v.name, category: 'Premium' })) || [])
  ];

  const customFieldOptions = event?.labels_data ? Object.keys(event.labels_data) : [];

	return (
		<section className="h-full w-full flex flex-col">
			<div className="flex flex-col items-start justify-between gap-2 pb-4">
				<div className="flex items-center justify-between w-full">
					<div>
						<h1 className="font-black text-3xl tracking-tight uppercase flex items-center gap-2">
              <Monitor className="h-7 w-7 text-primary" /> Welcome Screen
            </h1>
						<p className="text-slate-500 font-medium">Configure display states, seating logic, and voice announcements.</p>
					</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="rounded-none border-primary text-primary hover:bg-primary/5 font-bold uppercase tracking-wider"
              onClick={() => window.open(`/events/${event?.slug}/welcome-screen`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" /> Open Display
            </Button>
          </div>
				</div>
			</div>
			
      <FieldSeparator />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <Tabs defaultValue="design" className="w-full mt-6">
          <TabsList className="w-full justify-start rounded-none h-14 bg-slate-50 border-b p-0 gap-0">
            <TabsTrigger value="design" className="h-full px-8 gap-2 rounded-none border-r data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary font-bold uppercase tracking-widest text-[10px]">
              <Layout className="h-4 w-4" /> Visual Design
            </TabsTrigger>
            <TabsTrigger value="state" className="h-full px-8 gap-2 rounded-none border-r data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary font-bold uppercase tracking-widest text-[10px]">
              <Layers className="h-4 w-4" /> Assets & States
            </TabsTrigger>
            <TabsTrigger value="voice" className="h-full px-8 gap-2 rounded-none border-r data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary font-bold uppercase tracking-widest text-[10px]">
              <Music2 className="h-4 w-4" /> Voice & Logic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <FieldSet>
                  <FieldLegend className="text-xs uppercase font-black tracking-widest text-primary mb-4">Typography</FieldLegend>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup>
                      <FieldLabel>Font Family</FieldLabel>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="rounded-none h-10 bg-slate-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {getFontNames().map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Base Font Size</FieldLabel>
                      <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number(v))}>
                        <SelectTrigger className="rounded-none h-10 bg-slate-50"><SelectValue /></SelectTrigger>
                        <SelectContent>{FONT_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s}px</SelectItem>)}</SelectContent>
                      </Select>
                    </FieldGroup>
                  </div>
                  <div className="flex items-center gap-4 mt-4 bg-slate-50 p-3 border">
                    <Switch checked={isBold} onCheckedChange={setIsBold} id="bold-toggle" />
                    <Label htmlFor="bold-toggle" className="font-bold text-xs uppercase tracking-wider">Enable Bold Font Weight</Label>
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend className="text-xs uppercase font-black tracking-widest text-primary mb-4">Branding</FieldLegend>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup>
                      <FieldLabel>Name Color</FieldLabel>
                      <Select value={nameColor} onValueChange={setNameColor}>
                        <SelectTrigger className="rounded-none h-10 bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{NAME_COLORS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <div className="size-3 border" style={{ backgroundColor: c.value }} />
                              <span>{c.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Welcome Label</FieldLabel>
                      <Input 
                        value={welcomeText} 
                        onChange={(e) => setWelcomeText(e.target.value)} 
                        className="rounded-none h-10 bg-slate-50" 
                        placeholder="Welcome"
                      />
                    </FieldGroup>
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend className="text-xs uppercase font-black tracking-widest text-primary mb-4">Animation</FieldLegend>
                  <FieldGroup>
                    <FieldLabel>Text Entry Animation</FieldLabel>
                    <Select value={animationType} onValueChange={(v) => setAnimationType(v as AnimationType)}>
                      <SelectTrigger className="rounded-none h-10 bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent>{ANIMATION_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldGroup>
                </FieldSet>
              </div>

              <div className="space-y-4">
                 <Label className="text-xs uppercase font-black tracking-widest text-slate-400">Preview (Simplified)</Label>
                 <div className="aspect-video relative bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <p 
                        className="mb-2 uppercase tracking-[0.3em] opacity-80"
                        style={{ color: nameColor, fontWeight: isBold ? 'bold' : 'normal', fontSize: `${fontSize * 0.15}px` }}
                      >
                        {welcomeText}
                      </p>
                      <h2 
                        className="font-black leading-tight tracking-tighter"
                        style={{ color: nameColor, fontWeight: isBold ? 'bold' : 'normal', fontSize: `${fontSize * 0.4}px`, fontFamily }}
                      >
                        Dato' Ahmad
                      </h2>
                    </div>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <Badge className="rounded-none font-bold uppercase px-4 py-1.5 bg-primary text-white">Full Preview on Display Page</Badge>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-400 italic">This is a simplified style preview. Open the Display Page for the high-performance live render.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="state" className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Idle State */}
              <div className="space-y-4 bg-slate-50 p-6 border">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-sm">Idle Background</h3>
                </div>
                <FieldDescription>What shows on screen when no one is checking in.</FieldDescription>
                
                <div className="flex gap-2 p-1 bg-white border mb-4">
                  <Button variant={idleMode === 'image' ? 'default' : 'ghost'} size="sm" className="flex-1 rounded-none text-[10px] font-bold uppercase" onClick={() => setIdleMode('image')}>Static Image</Button>
                  <Button variant={idleMode === 'video' ? 'default' : 'ghost'} size="sm" className="flex-1 rounded-none text-[10px] font-bold uppercase" onClick={() => setIdleMode('video')}>Video Loop</Button>
                </div>

                {idleMode === 'image' ? (
                  <AssetUpload
                    preview={selectedIdleImage ? URL.createObjectURL(selectedIdleImage) : (existingIdleImageUrl ? `${API_BASE_URL}${existingIdleImageUrl}` : null)}
                    onFileSelect={(file: File | null) => { setSelectedIdleImage(file); setRemoveIdleImage(false); }}
                    onRemove={() => { setSelectedIdleImage(null); setExistingIdleImageUrl(null); setRemoveIdleImage(true); }}
                    accept="image/*"
                  />
                ) : (
                  <AssetUpload
                    preview={selectedIdleVideo ? URL.createObjectURL(selectedIdleVideo) : (existingIdleVideoUrl ? `${API_BASE_URL}${existingIdleVideoUrl}` : null)}
                    onFileSelect={(file: File | null) => { setSelectedIdleVideo(file); setRemoveIdleVideo(false); }}
                    onRemove={() => { setSelectedIdleVideo(null); setExistingIdleVideoUrl(null); setRemoveIdleVideo(true); }}
                    accept="video/*"
                    isVideo
                  />
                )}
              </div>

              {/* Announcement State */}
              <div className="space-y-4 bg-slate-50 p-6 border">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-sm">Announcement State</h3>
                </div>
                <FieldDescription>The visual overlay that triggers during check-in.</FieldDescription>

                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Mode</Label>
                      <Select value={announcementMode} onValueChange={(v) => setAnnouncementMode(v as DisplayMode)}>
                        <SelectTrigger className="rounded-none h-9 bg-white text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Duration (s)</Label>
                      <Input 
                        type="number" 
                        value={announcementDuration / 1000} 
                        onChange={(e) => setAnnouncementDuration(Number(e.target.value) * 1000)}
                        className="rounded-none h-9 bg-white text-xs"
                      />
                   </div>
                </div>

                {announcementMode === 'image' ? (
                  <AssetUpload
                    preview={selectedAnnImage ? URL.createObjectURL(selectedAnnImage) : (existingAnnImageUrl ? `${API_BASE_URL}${existingAnnImageUrl}` : null)}
                    onFileSelect={(file: File | null) => { setSelectedAnnImage(file); setRemoveAnnImage(false); }}
                    onRemove={() => { setSelectedAnnImage(null); setExistingAnnImageUrl(null); setRemoveAnnImage(true); }}
                    accept="image/*"
                  />
                ) : (
                  <AssetUpload
                    preview={selectedAnnVideo ? URL.createObjectURL(selectedAnnVideo) : (existingAnnVideoUrl ? `${API_BASE_URL}${existingAnnVideoUrl}` : null)}
                    onFileSelect={(file: File | null) => { setSelectedAnnVideo(file); setRemoveAnnVideo(false); }}
                    onRemove={() => { setSelectedAnnVideo(null); setExistingAnnVideoUrl(null); setRemoveAnnVideo(true); }}
                    accept="video/*"
                    isVideo
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="space-y-8">
                <FieldSet className="bg-slate-50 p-6 border">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <FieldLegend className="text-sm font-black uppercase tracking-widest text-primary mb-1">Global Voice Settings</FieldLegend>
                      <FieldDescription>Base voice for all guests if no rules match.</FieldDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="voice-enabled" className="text-xs font-bold uppercase tracking-wider text-slate-500">Enable Voice</Label>
                      <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} id="voice-enabled" />
                    </div>
                  </div>

                  {voiceEnabled && (
                    <div className="flex items-end gap-4 max-w-2xl">
                       <FieldGroup className="flex-1">
                          <FieldLabel>Default Announcement Voice</FieldLabel>
                          <Select value={voiceId} onValueChange={(v) => setVoiceId(v as VoiceId)}>
                            <SelectTrigger className="rounded-none h-10 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                               <SelectGroup>
                                  <SelectLabel>Standard Voices</SelectLabel>
                                  {getVoicesByCategory().malay.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                               </SelectGroup>
                               {clonedVoices && clonedVoices.length > 0 && (
                                  <SelectGroup>
                                     <SelectLabel className="flex items-center gap-1 text-primary"><Sparkles className="h-3 w-3" /> Premium Cloned</SelectLabel>
                                     {clonedVoices.filter(v => v.status === 'ready').map((v) => (
                                        <SelectItem key={v.elevenlabs_id} value={v.elevenlabs_id!}>{v.name}</SelectItem>
                                     ))}
                                  </SelectGroup>
                               )}
                            </SelectContent>
                          </Select>
                       </FieldGroup>
                       <Button variant="outline" className="rounded-none h-10 px-6 gap-2 border-primary text-primary hover:bg-primary/5" onClick={() => setIsLibraryModalOpen(true)}>
                          <Music2 className="h-4 w-4" /> Voice Library
                       </Button>
                       <Button className="rounded-none h-10 px-6 gap-2" onClick={() => setIsCloningModalOpen(true)}>
                          <Plus className="h-4 w-4" /> Clone New
                       </Button>
                    </div>
                  )}
                </FieldSet>

                <FieldSet className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLegend className="text-sm font-black uppercase tracking-widest text-primary mb-1">Logic-Based Voice Rules</FieldLegend>
                      <FieldDescription>Assign specific voices based on guest roles or custom labels.</FieldDescription>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-none h-9 gap-2 border-slate-300 font-bold uppercase text-[10px]" onClick={addVoiceRule}>
                      <Plus className="h-3.5 w-3.5" /> Add Logic Rule
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {voiceRules.length === 0 ? (
                      <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-400 font-medium text-sm">No logic rules defined yet. All guests will use the default voice.</p>
                      </div>
                    ) : (
                      voiceRules.map((rule, index) => (
                        <div key={rule.id} className="bg-white border p-4 shadow-sm flex items-center gap-4 group">
                           <GripVertical className="h-5 w-5 text-slate-300 shrink-0" />
                           <div className="flex-1 grid grid-cols-12 gap-3 items-end">
                              <div className="col-span-3 space-y-1.5">
                                 <Label className="text-[10px] font-black uppercase text-slate-400">If Field</Label>
                                 <Select value={rule.field} onValueChange={(v) => updateVoiceRule(rule.id, { field: v })}>
                                    <SelectTrigger className="rounded-none h-9 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="role">Role</SelectItem>
                                       <SelectItem value="name">Full Name</SelectItem>
                                       {customFieldOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                    </SelectContent>
                                 </Select>
                              </div>
                              <div className="col-span-2 space-y-1.5">
                                 <Label className="text-[10px] font-black uppercase text-slate-400">Operator</Label>
                                 <Select value={rule.operator} onValueChange={(v) => updateVoiceRule(rule.id, { operator: v })}>
                                    <SelectTrigger className="rounded-none h-9 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="equals">Equals</SelectItem>
                                       <SelectItem value="contains">Contains</SelectItem>
                                       <SelectItem value="is_empty">Is Empty</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>
                              <div className="col-span-3 space-y-1.5">
                                 <Label className="text-[10px] font-black uppercase text-slate-400">Value</Label>
                                 <Input 
                                    className="rounded-none h-9 text-xs" 
                                    value={rule.value} 
                                    onChange={(e) => updateVoiceRule(rule.id, { value: e.target.value })}
                                    placeholder="Enter value..."
                                 />
                              </div>
                              <div className="col-span-3 space-y-1.5">
                                 <Label className="text-[10px] font-black uppercase text-slate-400">Then Use Voice(s)</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                       <Button variant="outline" className="w-full rounded-none h-9 justify-start text-xs font-normal border-slate-200">
                                          {rule.voice_ids && rule.voice_ids.length > 1 
                                            ? `${rule.voice_ids.length} Voices Mixed` 
                                            : availableVoices.find(v => v.id === (rule.voice_ids?.[0] || rule.voice_id))?.label || 'Select Voice'}
                                       </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 rounded-none" align="end">
                                       <div className="p-3 border-b bg-slate-50">
                                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select Multiple for Mixed Audio</p>
                                       </div>
                                       <div className="max-h-[300px] overflow-y-auto p-1">
                                          {availableVoices.map(v => (
                                             <div 
                                                key={v.id} 
                                                className={cn(
                                                  "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 text-xs",
                                                  (rule.voice_ids?.includes(v.id) || rule.voice_id === v.id) && "bg-primary/5 text-primary font-bold"
                                                )}
                                                onClick={() => {
                                                  const current = rule.voice_ids || [rule.voice_id || ''];
                                                  const next = current.includes(v.id) 
                                                    ? current.filter(id => id !== v.id) 
                                                    : [...current, v.id].filter(id => id);
                                                  updateVoiceRule(rule.id, { voice_ids: next, voice_id: next[0] });
                                                }}
                                             >
                                                <span>{v.label}</span>
                                                <Badge className="text-[9px] h-4 px-1 rounded-none font-black tracking-tighter" variant={v.category === 'Premium' ? 'default' : 'outline'}>
                                                  {v.category}
                                                </Badge>
                                             </div>
                                          ))}
                                       </div>
                                    </PopoverContent>
                                 </Popover>
                              </div>
                              <div className="col-span-1 flex justify-end">
                                 <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-destructive" onClick={() => removeVoiceRule(rule.id)}>
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </FieldSet>
             </div>
          </TabsContent>
        </Tabs>
      </div>

			<div className="flex justify-end gap-3 pt-6 border-t mt-6">
				<Button variant="outline" className="rounded-none font-bold uppercase tracking-widest text-[10px] px-8" onClick={onClose}>Discard</Button>
				<Button className="rounded-none font-black uppercase tracking-widest text-[10px] px-12" onClick={handleSave} disabled={updateMutation.isPending}>
					{updateMutation.isPending ? "Saving..." : "Save Configuration"}
				</Button>
			</div>

			{ownerId && (
				<VoiceCloningModal
					isOpen={isCloningModalOpen}
					onOpenChange={setIsCloningModalOpen}
					organizationId={ownerId}
					eventId={eventId}
					onSuccess={(id) => setVoiceId(id as VoiceId)}
				/>
			)}

      {ownerId && (
				<VoiceLibraryModal
					isOpen={isLibraryModalOpen}
					onOpenChange={setIsLibraryModalOpen}
					organizationId={ownerId}
					eventId={eventId}
          currentVoiceId={voiceId}
					onVoiceAttached={(id) => setVoiceId(id as VoiceId)}
				/>
			)}
		</section>
	);
}

function AssetUpload({ preview, onFileSelect, onRemove, accept, isVideo = false }: any) {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<div 
			className="aspect-video border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative bg-white overflow-hidden group"
			onClick={() => inputRef.current?.click()}
		>
			{preview ? (
				<>
					{isVideo ? (
						<video src={preview} className="h-full w-full object-cover" />
					) : (
						<img src={preview} className="h-full w-full object-cover" />
					)}
					<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
						<div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
               <Camera className="h-5 w-5 text-white" />
            </div>
						<p className="text-white text-[10px] font-black uppercase tracking-widest">Replace Asset</p>
					</div>
					<Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8 rounded-none z-20" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</>
			) : (
				<div className="text-center p-8">
					<div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
					  {isVideo ? <VideoIcon className="h-6 w-6 text-slate-300" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
          </div>
					<p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Upload {isVideo ? 'Video Loop' : 'Background Image'}</p>
          <p className="text-[9px] text-slate-300">Recommended: 1920x1080 (16:9)</p>
				</div>
			)}
			<input type="file" ref={inputRef} className="hidden" accept={accept} onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
		</div>
	);
}
