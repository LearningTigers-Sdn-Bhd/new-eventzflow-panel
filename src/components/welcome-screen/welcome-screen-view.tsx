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
import { getPlan } from "@/lib/api/plan";
import { Users } from "lucide-react";

interface WelcomeScreenViewProps {
	eventTitle: string;
	latestCheckIn: CheckInBroadcast | null;
	
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

	const planId = latestCheckIn?.seating_context?.plan_id;
	const { data: plan } = useQuery({
		queryKey: ["plan", planId],
		queryFn: () => getPlan(planId!.toString()),
		enabled: !!planId && showSeatingPlan && isAnnouncing,
	});

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
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950">
			
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
					<div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-950" />
				)}
			</div>

			{/* LAYER 2: ANNOUNCEMENT OVERLAY */}
			<div 
				className={cn(
					"absolute inset-0 z-10 transition-all duration-1000 overflow-hidden bg-black/40",
					isAnnouncing ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
				)}
			>
				{announcementMode === 'video' && urls.annVideo ? (
					<video 
						ref={announcementVideoRef as any}
						src={urls.annVideo} 
						playsInline 
						preload="auto"
						className="h-full w-full object-cover" 
					/>
				) : urls.annImage ? (
					<div 
						className="h-full w-full bg-center bg-cover bg-no-repeat" 
						style={{ backgroundImage: `url("${urls.annImage}")` }} 
					/>
				) : (
					<div className="h-full w-full bg-primary/10 backdrop-blur-sm" />
				)}
			</div>

			{/* CONTENT */}
			<div 
				className={cn(
					"relative z-30 transition-all duration-1000",
					isAnnouncing && showSeatingPlan && latestCheckIn?.seating_context
						? "w-full h-full flex flex-col items-center justify-center p-8"
						: "max-w-[90vw] px-4 text-center"
				)}
			>
				{isAnnouncing && latestCheckIn ? (
					<div className={cn(
						"w-full h-full flex flex-col",
						showSeatingPlan && latestCheckIn.seating_context ? "justify-between" : "justify-center"
					)}>
						<div className="animate-in fade-in zoom-in-95 duration-500 text-center">
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
								fontSize={showSeatingPlan && latestCheckIn.seating_context ? fontSize * 0.7 : fontSize}
								isBold={isBold}
								nameColor={nameColor}
							/>
						</div>

						{showSeatingPlan && latestCheckIn.seating_context && plan && (
							<div className={cn(
								"flex flex-1 gap-8 mt-8 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300",
								seatingPlanSidebarPosition === 'right' ? 'flex-row' : 'flex-row-reverse'
							)}>
								{/* MAP AREA */}
								<div className="flex-1 rounded-3xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl relative">
									<PlanCanvas 
										plan={plan}
										isReadOnly
										highlightObjectId={latestCheckIn.seating_context.table_id}
									/>
									<div className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-primary/90 text-white font-black text-2xl shadow-xl animate-bounce">
										{latestCheckIn.seating_context.table_label}
									</div>
								</div>

								{/* SIDEBAR GUEST LIST */}
								<div className="w-[400px] shrink-0 rounded-3xl border-4 border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden text-left">
									<div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
										<div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
											<Users className="h-6 w-6 text-primary" />
										</div>
										<h4 className="font-black text-white text-xl uppercase tracking-tight">Table Guests</h4>
									</div>
									<div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
										<div className="space-y-3">
											{latestCheckIn.seating_context.table_guests.map((guest, idx) => (
												<div 
													key={idx} 
													className={cn(
														"flex items-center justify-between p-4 rounded-2xl transition-all",
														guest.name === latestCheckIn.name 
															? "bg-primary text-white scale-105 shadow-lg ring-4 ring-primary/30" 
															: "bg-white/5 text-white/80"
													)}
												>
													<span className={cn(
														"text-lg truncate",
														guest.is_checked_in ? "font-black" : "opacity-40 font-medium italic"
													)}>
														{guest.name}
													</span>
													{guest.is_checked_in && (
														<div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{!showSeatingPlan && latestCheckIn.table_label && (
							<p
								className="mt-4 opacity-95 sm:mt-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center"
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
			
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 to-transparent z-40" />
		</div>
	);
}
