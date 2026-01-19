"use client";

import { AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckInConfirmation } from "@/components/pages/public-check-in/CheckInConfirmation";
import { CheckInResults } from "@/components/pages/public-check-in/CheckInResults";
import { CheckInSelection } from "@/components/pages/public-check-in/CheckInSelection";
import { CheckInStatus } from "@/components/pages/public-check-in/CheckInStatus";
import {
	GridBackground,
	InfoRow,
	NoiseTexture,
} from "@/components/pages/public-check-in/CheckInVisuals";
import { usePublicCheckIn } from "@/hooks/use-public-check-in";

export default function EventCheckInPage() {
	const params = useParams();
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
		<div className="flex min-h-screen w-full flex-col bg-neutral-50 font-sans text-black selection:bg-brand-green/20 selection:text-black lg:flex-row">
			<NoiseTexture />
			<GridBackground />

			{/* LEFT: BRAND & CONTEXT */}
			<div className="relative flex w-full flex-col justify-between border-neutral-200 border-b p-8 lg:w-[45%] lg:border-r lg:border-b-0 lg:p-16">
				<div className="mx-auto w-full max-w-lg lg:mx-0">
					{/* Logo Area */}
					<div className="mb-16 flex items-center gap-3">
						<div className="h-4 w-4 bg-brand-green" />
						<span className="font-bold text-lg tracking-tight">EVENTZFLOW</span>
					</div>

					{/* Title */}
					<div className="mb-16">
						<h1 className="mb-4 break-words font-bold text-5xl uppercase leading-[0.9] tracking-tighter lg:text-7xl">
							{event?.title}
						</h1>
						<div className="mt-4 h-1 w-16 bg-brand-green" />
					</div>

					{/* Info Grid */}
					<div className="w-full">
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
						<InfoRow
							label="Terminal"
							value="Front Desk — Station 01"
							icon={MapPin}
						/>
					</div>
				</div>
			</div>

			{/* RIGHT: INTERACTION */}
			<div className="flex w-full flex-col justify-center bg-white p-8 lg:w-[55%] lg:p-24">
				<div className="mx-auto w-full max-w-lg">
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
		</div>
	);
}
