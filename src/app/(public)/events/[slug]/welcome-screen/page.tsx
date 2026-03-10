"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Volume2, Play, Activity } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { DEFAULT_VOICE, useTTS, type VoiceId } from "@/hooks/use-tts";
import { useWelcomeScreenChannel } from "@/hooks/use-welcome-screen-channel";
import { fetchPublicCheckInDisplay } from "@/lib/api/check-in-display";
import type { CheckInBroadcast } from "@/lib/api/check-in-display/types";
import { getPublicPlan } from "@/lib/api/plan";
import { DEFAULT_FONT, getGoogleFontsUrl } from "@/lib/fonts";
import { getVoiceById } from "@/lib/tts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STALE_TIME_MS = 1000 * 60 * 5;
const ANNOUNCEMENT_GAP_MS = 1000; // Small gap between items

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCheckInId(checkIn: CheckInBroadcast): string {
	return `${checkIn.checked_in_at}:${checkIn.name}`;
}

export default function WelcomeScreenPage() {
	const params = useParams();
	const slug = params.slug as string;
	
	const [announcementQueue, setAnnouncementQueue] = useState<CheckInBroadcast[]>([]);
	const [activeCheckIn, setActiveCheckIn] = useState<CheckInBroadcast | null>(null);
	
	const [isProcessingQueue, setIsProcessingQueue] = useState(false);
	const [isStarted, setIsStarted] = useState(false);
	const [isAnnouncing, setIsAnnouncing] = useState(false);
	
	const seenAnnouncementIdsRef = useRef(new Set<string>());
	const isMountedRef = useRef(true);
	const annVideoRef = useRef<HTMLVideoElement>(null);
	const wakeLockRef = useRef<any>(null);

	const {
		data: settings,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-check-in-display", slug],
		queryFn: () => fetchPublicCheckInDisplay(slug),
		retry: 3,
		staleTime: STALE_TIME_MS,
	});

	// Pre-fetch active plan if seating plan is enabled
	const activePlanId = settings?.active_plan_id;
	const { data: activePlan } = useQuery({
		queryKey: ["public-plan", activePlanId],
		queryFn: () => getPublicPlan(activePlanId!.toString()),
		enabled: !!activePlanId && settings?.show_seating_plan,
		staleTime: STALE_TIME_MS,
	});

	const eventId = settings?.event?.id ?? null;
	const { latestCheckIn, queueSize, isConnected } = useWelcomeScreenChannel(eventId);

	const resolvedVoiceId: VoiceId = settings?.voice_type && getVoiceById(settings.voice_type)
			? (settings.voice_type as VoiceId)
			: DEFAULT_VOICE;

	const voiceEnabled = settings?.voice_enabled ?? false;

	const { speak } = useTTS({
		enabled: voiceEnabled && isStarted,
		voiceId: resolvedVoiceId,
	});

	const handleStart = async () => {
		setIsStarted(true);
		try {
			if ('wakeLock' in navigator) {
				wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
			}
		} catch (e) {}
		
		// Unlock Audio Context
		if (voiceEnabled) speak("").catch(() => {});
	};

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
			if (wakeLockRef.current) wakeLockRef.current.release();
		};
	}, []);

	// Listen for incoming check-ins
	useEffect(() => {
		if (!latestCheckIn) return;
		const checkInId = getCheckInId(latestCheckIn);
		if (seenAnnouncementIdsRef.current.has(checkInId)) return;
		seenAnnouncementIdsRef.current.add(checkInId);
		setAnnouncementQueue((prev) => [...prev, latestCheckIn]);
	}, [latestCheckIn]);

	// Process the queue
	useEffect(() => {
		if (!isStarted || isProcessingQueue || announcementQueue.length === 0) return;
		
		const processAnnouncement = async () => {
			setIsProcessingQueue(true);
			const nextCheckIn = announcementQueue[0];
			
			// 1. START ANNOUNCEMENT STATE
			setActiveCheckIn(nextCheckIn);
			setIsAnnouncing(true);

			let textToSpeak = "";
			const welcomeText = settings?.welcome_text || "Welcome";
			
			if (settings?.show_seating_plan && nextCheckIn.seating_context && nextCheckIn.seating_context.table_label) {
				const template = settings?.seating_announcement_template || "Welcome, #{name}. You are at #{table_label}.";
				textToSpeak = template
					.replace("#{name}", nextCheckIn.name)
					.replace("#{table_label}", nextCheckIn.seating_context.table_label);
			} else {
				const tableSuffix = nextCheckIn.table_label ? `. ${nextCheckIn.table_label}` : "";
				textToSpeak = `${welcomeText}, ${nextCheckIn.name}${tableSuffix}`;
			}
			
			// 2. TRIGGER MEDIA
			if (settings?.announcement_mode === 'video' && annVideoRef.current) {
				annVideoRef.current.currentTime = 0;
				annVideoRef.current.play().catch(() => {});
			}

			// 3. SPEAK
			if (voiceEnabled) {
				await speak(textToSpeak).catch(() => {});
			}

			// 4. HOLD STATE FOR DURATION
			const hasSeatingPlan = settings?.show_seating_plan && nextCheckIn.seating_context;
			const defaultDuration = hasSeatingPlan 
				? (settings?.seating_plan_duration || 8000) 
				: (settings?.announcement_duration || 5000);
			
			await wait(defaultDuration);

			// 5. CLEANUP & RESET TO IDLE
			setIsAnnouncing(false);
			await wait(800); // Wait for fade-out transition
			
			if (isMountedRef.current) {
				setAnnouncementQueue((prev) => prev.slice(1));
				setIsProcessingQueue(false);
				if (announcementQueue.length <= 1) setActiveCheckIn(null);
			}
		};

		void processAnnouncement();
	}, [announcementQueue, settings, isProcessingQueue, isStarted, speak, voiceEnabled]);

	if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]"><Loader2 className="h-12 w-12 animate-spin text-white" /></div>;

	if (error || !settings) return <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] text-white">Error loading screen.</div>;

	return (
		<div className="h-full w-full">
			<link rel="stylesheet" href={getGoogleFontsUrl()} />

			{!isStarted && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a2e]/95 backdrop-blur-md">
					<div className="max-w-md p-8 text-center text-white">
						<div className="mb-6 flex justify-center">
							<div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-primary animate-pulse">
								<Play className="h-8 w-8 fill-white ml-1" />
							</div>
						</div>
						<h2 className="mb-2 font-black text-3xl tracking-tight uppercase">Ready for Check-In</h2>
						<p className="mb-8 font-medium text-slate-400">Activate the premium welcome display for this event.</p>
						<Button size="lg" onClick={handleStart} className="h-14 w-full rounded-full bg-white font-black text-black hover:bg-slate-100 shadow-2xl">
							Initialize Screen
						</Button>
					</div>
				</div>
			)}

			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				{isAnnouncing && (
					<div className="flex items-center gap-2 rounded-full bg-[#00C4CC]/80 px-3 py-1 text-white text-[10px] font-bold uppercase animate-pulse">
						<Activity className="h-3 w-3" /> <span>Announcing</span>
					</div>
				)}
				<div className={cn("h-3 w-3 rounded-full shadow-[0_0_8px]", isConnected ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50")} />
			</div>

			<WelcomeScreenView
				eventTitle={settings.event.title}
				latestCheckIn={activeCheckIn || latestCheckIn}
				activePlan={activePlan}
				fontFamily={settings.font_family || DEFAULT_FONT}
				fontSize={settings.font_size || 72}
				animationType={settings.animation_type || "fade_in"}
				isBold={settings.is_bold || false}
				nameColor={settings.name_color || "#FFFFFF"}
				welcomeText={settings.welcome_text || "Welcome"}
				
				showSeatingPlan={settings.show_seating_plan}
				seatingPlanSidebarPosition={settings.seating_plan_sidebar_position}

				idleMode={settings.idle_mode as any}
				announcementMode={settings.announcement_mode as any}
				
				idleImageUrl={settings.background_image_url}
				idleVideoUrl={settings.idle_video_url}
				announcementImageUrl={settings.announcement_image_url}
				announcementVideoUrl={settings.announcement_video_url}
				
				isAnnouncing={isAnnouncing}
				announcementVideoRef={annVideoRef}
			/>
		</div>
	);
}
