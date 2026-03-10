"use client";

import type {
	AnimationType,
	CheckInBroadcast,
} from "@/lib/api/check-in-display/types";
import { publicRestClient } from "@/utils/rest-api";
import { NameAnimation } from "./name-animation";
import { RefObject, useMemo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlanCanvas } from "@/components/plan/plan-canvas";
import { useQuery } from "@tanstack/react-query";
import { getPublicPlan } from "@/lib/api/plan";
import type { Plan } from "@/lib/api/plan/response";
import { Users } from "lucide-react";

interface WelcomeScreenViewProps {
	eventTitle: string;
	latestCheckIn: CheckInBroadcast | null;
	
	// Seating Plan
	activePlan?: Plan | null;

	// Text Settings
	fontFamily: string;
	fontSize: number;
	animationType: AnimationType;
	isBold: boolean;
	nameColor: string;
	welcomeText: string;

	// Seating Plan Settings
	showSeatingPlan: boolean;
	seatingPlanSidebarPosition: "left" | "right";

	// State Modes
	idleMode: 'image' | 'video';
	announcementMode: 'image' | 'video';

	// Assets
	idleImageUrl: string | null;
	idleVideoUrl: string | null;
	announcementImageUrl: string | null;
	announcementVideoUrl: string | null;

	// Control
	isAnnouncing: boolean;
	announcementVideoRef?: RefObject<HTMLVideoElement | null>;
}

export function WelcomeScreenView({
	eventTitle,
	latestCheckIn,
	activePlan: passedPlan,
	fontFamily,
	fontSize,
	animationType,
	isBold,
	nameColor,
	welcomeText,
	showSeatingPlan,
	seatingPlanSidebarPosition,
	idleMode,
	announcementMode,
	idleImageUrl,
	idleVideoUrl,
	announcementImageUrl,
	announcementVideoUrl,
	isAnnouncing,
	announcementVideoRef,
}: WelcomeScreenViewProps) {
	const displayName = latestCheckIn?.name || eventTitle;
	const welcomeTextFontSize = Math.max(16, Math.round(fontSize * 0.24));
	const tableTextFontSize = Math.max(20, Math.round(fontSize * 0.45));

	const idleVideoRef = useRef<HTMLVideoElement>(null);
	const [displayPhase, setDisplayPhase] = useState<'greeting' | 'seating'>('greeting');

	const hasValidSeatingContext = !!(latestCheckIn?.seating_context && latestCheckIn.seating_context.plan_id);

	useEffect(() => {
		if (isAnnouncing) {
			setDisplayPhase('greeting');
			if (showSeatingPlan && hasValidSeatingContext) {
				const timer = setTimeout(() => {
					setDisplayPhase('seating');
				}, 3000);
				return () => clearTimeout(timer);
			}
		} else {
			setDisplayPhase('greeting');
		}
	}, [isAnnouncing, showSeatingPlan, hasValidSeatingContext]);

	const planId = latestCheckIn?.seating_context?.plan_id;
	const { data: queriedPlan } = useQuery({
		queryKey: ["public-plan", planId],
		queryFn: () => getPublicPlan(planId!.toString()),
		enabled: !!planId && showSeatingPlan && !passedPlan,
	});

	const plan = passedPlan || queriedPlan;

	// Helper to get safe URLs
	const getUrl = (path: string | null) => {
		if (!path) return null;
		if (path.startsWith('http')) return path;
		return publicRestClient.getImageUrl(path);
	};

	const urls = useMemo(() => ({
		idleImage: getUrl(idleImageUrl),
		idleVideo: getUrl(idleVideoUrl),
		annImage: getUrl(announcementImageUrl),
		annVideo: getUrl(announcementVideoUrl),
	}), [idleImageUrl, idleVideoUrl, announcementImageUrl, announcementVideoUrl]);

	// Force play idle video when URL or mode changes
	useEffect(() => {
		if (idleMode === 'video' && urls.idleVideo && idleVideoRef.current) {
			idleVideoRef.current.play().catch(err => {
				console.warn("[WelcomeScreen] Idle video autoplay blocked or failed:", err);
			});
		}
	}, [idleMode, urls.idleVideo]);

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0A0A]">
			
			{/* LAYER 1: IDLE BACKGROUND */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				{idleMode === 'video' && urls.idleVideo ? (
					<video 
						ref={idleVideoRef}
						key={urls.idleVideo}
						src={urls.idleVideo} 
						autoPlay 
						loop 
						muted 
						playsInline 
						preload="auto"
						className="h-full w-full object-cover transition-opacity duration-1000" 
					/>
				) : urls.idleImage ? (
					<div 
						className="h-full w-full bg-center bg-cover bg-no-repeat animate-in fade-in duration-1000" 
						style={{ backgroundImage: `url("${urls.idleImage}")` }} 
					/>
				) : (
					<div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-[#0A0A0A] to-black" />
				)}
				{/* Premium ambient light overlay */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
			</div>

			{/* LAYER 2: ANNOUNCEMENT OVERLAY */}
			<div 
				className={cn(
					"absolute inset-0 z-10 transition-all duration-1000 overflow-hidden bg-black/60 backdrop-blur-[2px]",
					isAnnouncing ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
				)}
			>
				{announcementMode === 'video' && urls.annVideo ? (
					<video 
						ref={announcementVideoRef as any}
						src={urls.annVideo} 
						playsInline 
						preload="auto"
						className="h-full w-full object-cover opacity-80 mix-blend-luminosity" 
					/>
				) : urls.annImage ? (
					<div 
						className="h-full w-full bg-center bg-cover bg-no-repeat opacity-80 mix-blend-luminosity" 
						style={{ backgroundImage: `url("${urls.annImage}")` }} 
					/>
				) : (
					<div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
				)}
			</div>

			{/* CONTENT */}
			<div 
				className={cn(
					"relative z-30 transition-all duration-1000",
					isAnnouncing
						? "w-full h-screen flex flex-col"
						: "w-full h-screen flex flex-col items-center justify-center max-w-[90vw] px-4 text-center mx-auto"
				)}
			>
				{isAnnouncing && latestCheckIn ? (
					displayPhase === 'greeting' || !showSeatingPlan || !hasValidSeatingContext || !plan ? (
						<div className="flex-1 w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 text-center px-8">
							<p
								className="mb-2 uppercase tracking-[0.3em] opacity-90 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
								style={{
									color: nameColor,
									fontWeight: isBold ? "bold" : "normal",
									fontSize: `${welcomeTextFontSize}px`,
									lineHeight: 1.2,
								}}
							>
								{welcomeText}
							</p>
							<NameAnimation
								name={displayName}
								animationType={animationType}
								fontFamily={fontFamily}
								fontSize={fontSize}
								isBold={isBold}
								nameColor={nameColor}
							/>
							
							{/* Show table label under name if no map is available */}
							{!showSeatingPlan && latestCheckIn.table_label && (
								<p
									className="mt-6 opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
									style={{
										color: nameColor,
										fontWeight: isBold ? "bold" : "normal",
										fontSize: `${tableTextFontSize}px`,
										lineHeight: 1.2,
									}}
								>
									{latestCheckIn.table_label}
								</p>
							)}
						</div>
					) : (
						<div className={cn(
							"flex-1 flex w-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700",
							seatingPlanSidebarPosition === 'right' ? 'flex-row' : 'flex-row-reverse'
						)}>
							{/* MAP AREA - Perfectly centered with consistent p-12 spacing on all sides */}
							<div className="flex-1 relative p-12">
								<div className="w-full h-full relative">
									<PlanCanvas 
										plan={plan}
										isReadOnly
										hideCapacity
										highlightObjectId={latestCheckIn.seating_context.table_id}
									/>
								</div>
							</div>

							{/* SIDEBAR GUEST LIST - Full height, no padding around it */}
							<div className="w-[460px] h-full shrink-0 bg-black/40 backdrop-blur-3xl flex flex-col overflow-hidden text-left border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.4)]">
								<div className="p-8 border-b border-white/10 bg-gradient-to-b from-[#D4AF37]/20 to-transparent flex flex-col items-center text-center gap-4 shrink-0">
									<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#B8860B] flex items-center justify-center shadow-[0_10px_25px_rgba(212,175,55,0.4)]">
										<Users className="h-8 w-8 text-white drop-shadow-md" />
									</div>
									<div className="space-y-0.5">
										<span className="text-xs font-black uppercase tracking-[0.4em] text-[#D4AF37]">Assigned To</span>
										<h4 className="font-black text-white text-4xl uppercase tracking-tighter drop-shadow-2xl">
											{latestCheckIn.seating_context.table_label.toLowerCase().startsWith('table') || 
											 latestCheckIn.seating_context.table_label.toLowerCase().startsWith('meja')
												? latestCheckIn.seating_context.table_label
												: `Table ${latestCheckIn.seating_context.table_label}`}
										</h4>
									</div>
									<div className="px-4 py-1.5 rounded-full bg-white/5 text-[#D4AF37] font-bold text-xs uppercase tracking-widest border border-[#D4AF37]/30">
										{latestCheckIn.seating_context.table_guests.filter(g => g.is_checked_in).length} / {latestCheckIn.seating_context.table_guests.length} Arrived
									</div>
								</div>
								<div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
									<div className="space-y-4 pb-12">
										{/* The current checked-in guest always first and highlighted */}
										{latestCheckIn.seating_context.table_guests
											.sort((a, b) => {
												if (a.name === latestCheckIn.name) return -1;
												if (b.name === latestCheckIn.name) return 1;
												if (a.is_checked_in && !b.is_checked_in) return -1;
												if (!a.is_checked_in && b.is_checked_in) return 1;
												return 0;
											})
											.map((guest, idx) => (
												<div 
													key={idx} 
													className={cn(
														"flex items-center justify-between p-6 rounded-3xl transition-all duration-700",
														guest.name === latestCheckIn.name 
															? "bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-white scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/20 z-10" 
															: guest.is_checked_in 
																? "bg-white/10 text-white shadow-sm border border-white/5"
																: "bg-white/5 text-white/20 border border-white/5 italic"
													)}
												>
													<div className="flex flex-col min-w-0 mr-4">
														{guest.name === latestCheckIn.name && (
															<span className="text-xs font-black uppercase tracking-[0.3em] mb-1 text-white/80">Checking In</span>
														)}
														<span className={cn(
															"text-2xl font-bold leading-snug line-clamp-1",
															guest.name === latestCheckIn.name && "font-black"
														)}>
															{guest.name}
														</span>
													</div>
													{guest.is_checked_in ? (
														<div className={cn(
															"h-4 w-4 rounded-full border-2 border-white/20",
															guest.name === latestCheckIn.name 
																? "bg-white animate-pulse shadow-[0_0_15px_#fff]" 
																: "bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
														)} />
													) : (
														<div className="h-4 w-4 rounded-full border-2 border-white/10" />
													)}
												</div>
											))}
									</div>
								</div>
							</div>
						</div>
					)
				) : (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
						<div
							className="drop-shadow-2xl opacity-80"
							style={{
								fontFamily,
								fontSize: `${fontSize * 0.8}px`,
								lineHeight: 1.2,
								fontWeight: isBold ? "bold" : "normal",
								color: nameColor,
								letterSpacing: '-0.02em'
							}}
						>
							{eventTitle}
						</div>
					</div>
				)}
			</div>

			{/* Shared darkening overlay for readability */}
			<div className={cn(
				"pointer-events-none absolute inset-0 transition-opacity duration-1000 z-20",
				isAnnouncing ? "bg-black/40" : "bg-black/20"
			)} />
			
			{/* Subtle bottom vignette only when NOT showing seating plan to keep sidebar clear */}
			{!showSeatingPlan && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/40 to-transparent z-40 transition-opacity duration-1000" />
			)}
		</div>
	);
}
