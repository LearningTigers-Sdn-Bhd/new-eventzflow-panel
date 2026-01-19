"use client";

import { AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckInConfirmation } from "@/components/pages/public-check-in/CheckInConfirmation";
import { CheckInResults } from "@/components/pages/public-check-in/CheckInResults";
import { CheckInSelection } from "@/components/pages/public-check-in/CheckInSelection";
import { CheckInStatus } from "@/components/pages/public-check-in/CheckInStatus";
import {
	InfoRow,
	StationRow,
} from "@/components/pages/public-check-in/CheckInVisuals";
import { StationSelection } from "@/components/pages/public-check-in/StationSelection";
import { usePublicCheckIn } from "@/hooks/use-public-check-in";

const STATION_STORAGE_KEY = "public_checkin_station";

export default function EventCheckInPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center bg-neutral-50 text-black">
				<div className="flex flex-col items-center gap-6">
					<div className="h-1 w-12 animate-[pulse_1s_ease-in-out_infinite] bg-brand-green" />
				</div>
			</div>
		}>
			<EventCheckInContent />
		</Suspense>
	);
}

function EventCheckInContent() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const slug = params.slug as string;
	const {
		event,
		view,
		setView,
		errorMessage,
		searchMethod,
		setSearchMethod,
		searchValue,
		setSearchValue,
		isSearching,
		inputStep,
		setInputStep,
		searchResults,
		liveResults,
		searchError,
		selectedAttendee,
		isConfirming,
		handleSearch,
		handleSelectAttendee,
		handleConfirmCheckIn,
		handleQRScan,
		handleReset,
		selectMethod,
	} = usePublicCheckIn(slug);

	const [currentDate, setCurrentDate] = useState<Date | null>(null);
	const [station, setStation] = useState<string | null>(null);
	const [showStationSelection, setShowStationSelection] = useState(false);

	// Initialize station from URL or localStorage
	useEffect(() => {
		const urlStation = searchParams.get("station");
		const savedStation = localStorage.getItem(STATION_STORAGE_KEY);

		if (urlStation) {
			// URL parameter takes priority
			setStation(urlStation);
			localStorage.setItem(STATION_STORAGE_KEY, urlStation);
		} else if (savedStation) {
			// Use saved station and update URL
			setStation(savedStation);
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set("station", savedStation);
			router.replace(newUrl.pathname + newUrl.search);
		} else {
			// No station set, show selection
			setShowStationSelection(true);
		}
	}, [searchParams, router]);

	const handleStationSelect = (stationNum: string) => {
		setStation(stationNum);
		localStorage.setItem(STATION_STORAGE_KEY, stationNum);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("station", stationNum);
		router.replace(newUrl.pathname + newUrl.search);
		setShowStationSelection(false);
		toast.success(`Station ${stationNum} Selected`, {
			description: "You can now start checking in attendees",
		});
	};

	useEffect(() => {
		setCurrentDate(new Date());
		const timer = setInterval(() => setCurrentDate(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	if (view === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-neutral-50 text-black">
				<div className="flex flex-col items-center gap-6">
					<div className="h-1 w-12 animate-[pulse_1s_ease-in-out_infinite] bg-brand-green" />
				</div>
			</div>
		);
	}

	if (view === "error") {
		return (
			<div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center p-8">
				<div className="border-destructive border-t-4 pt-8">
					<h1 className="mb-6 font-bold text-6xl text-black tracking-tighter">
						ERROR
					</h1>
					<p className="font-mono text-destructive text-xs uppercase tracking-widest">
						{errorMessage}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen w-full flex-col bg-green-background font-sans text-black lg:flex-row">
			{/* LEFT: BRAND & CONTEXT */}
			<div className="relative flex w-full flex-col justify-center p-6 lg:w-[42%] lg:p-12">
				<div className="relative z-10 mx-auto w-full max-w-lg lg:mx-0">
					{/* Logo Area */}
					<div className="mb-6 flex items-center gap-4 lg:mb-8">
						<span
							className="font-bold text-xl leading-tight lg:text-2xl"
							style={{ fontFamily: "Times New Roman, serif" }}
						>
							<span style={{ color: "#23c460" }}>Event</span>
							<span style={{ color: "#2766ec" }}>z</span>
							<span style={{ color: "#23c460" }}>Flow</span>
						</span>
					</div>

					{/* Title Area */}
					<div className="mb-6 lg:mb-8">
						<div className="mb-2 flex items-center gap-2">
							<div className="h-[2px] w-6 bg-brand-green" />
							<span className="font-bold font-mono text-[10px] text-brand-green uppercase tracking-[0.3em]">Event Check-in</span>
						</div>
						<h1 className="break-words font-black text-2xl text-black uppercase leading-[0.9] tracking-tight sm:text-3xl lg:text-4xl">
							{event?.title}
						</h1>
					</div>

					{/* Info Grid */}
					<div className="space-y-2">
						{station && (
							<div className="border border-neutral-300 bg-white/50 p-4 backdrop-blur-sm">
								<StationRow
									station={station}
									onClick={() => setShowStationSelection(true)}
									icon={MapPin}
								/>
							</div>
						)}
						<div className="border border-neutral-300 bg-white/50 p-4 backdrop-blur-sm">
							<InfoRow
								label="Date"
								value={
									currentDate?.toLocaleDateString("en-GB", {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									}) || "..."
								}
								icon={Calendar}
							/>
						</div>
						<div className="border border-neutral-300 bg-white/50 p-4 backdrop-blur-sm">
							<InfoRow
								label="Time"
								value={
									currentDate?.toLocaleTimeString("en-GB", {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										timeZoneName: "short",
									}) || "..."
								}
								icon={Clock}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* RIGHT: INTERACTION */}
			<div className="relative flex w-full flex-col justify-center bg-white-background border-l border-black p-8 lg:w-[58%] lg:p-24">
				{/* Subtle Background Pattern for Right Side */}
				<div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
					style={{ 
						backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
						backgroundSize: '24px 24px'
					}} 
				/>
				
				<div className="relative z-10 mx-auto w-full max-w-lg">
					<AnimatePresence mode="wait">
						{view === "search" && (
							<CheckInSelection
								inputStep={inputStep}
								setInputStep={setInputStep}
								searchMethod={searchMethod}
								setSearchMethod={setSearchMethod}
								searchValue={searchValue}
								setSearchValue={setSearchValue}
								isSearching={isSearching}
								onSearch={handleSearch}
								onScan={handleQRScan}
								onSelectMethod={selectMethod}
								liveResults={liveResults}
								onSelectAttendee={handleSelectAttendee}
								searchError={searchError}
							/>
						)}

						{view === "results" && (
							<CheckInResults
								results={searchResults}
								onSelect={handleSelectAttendee}
								onReset={handleReset}
							/>
						)}

						{view === "confirm" && selectedAttendee && (
							<CheckInConfirmation
								attendee={selectedAttendee}
								isConfirming={isConfirming}
								onConfirm={handleConfirmCheckIn}
								onCancel={() =>
									setView(searchResults.length > 0 ? "results" : "search")
								}
							/>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* SUCCESS / ERROR OVERLAY */}
			<AnimatePresence>
				{(view === "success" || view === "already-checked-in") &&
					selectedAttendee && (
						<CheckInStatus
							status={view}
							attendee={selectedAttendee}
							onClose={handleReset}
						/>
					)}
			</AnimatePresence>

			{/* STATION SELECTION OVERLAY */}
			<AnimatePresence>
				{showStationSelection && (
					<StationSelection
						onSelect={handleStationSelect}
						currentStation={station}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
