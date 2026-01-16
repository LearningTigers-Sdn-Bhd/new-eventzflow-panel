"use client";

import { ArrowLeft, Check, Loader2, QrCode, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	checkIn,
	confirmCheckIn,
	getCheckInEvent,
	type AttendeePreview,
	type CheckInMethod,
	type PublicEventInfo,
} from "@/lib/api/event-check-in";
import { QRScanner } from "./qr-scanner";

type ViewState =
	| "loading"
	| "error"
	| "search"
	| "scanning"
	| "results"
	| "confirm"
	| "success"
	| "already-checked-in";

export default function EventCheckInPage() {
	const params = useParams();
	const slug = params.slug as string;

	const [event, setEvent] = useState<PublicEventInfo | null>(null);
	const [view, setView] = useState<ViewState>("loading");
	const [errorMessage, setErrorMessage] = useState("");

	const [searchMethod, setSearchMethod] = useState<CheckInMethod>("name");
	const [searchValue, setSearchValue] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	const [searchResults, setSearchResults] = useState<AttendeePreview[]>([]);
	const [selectedAttendee, setSelectedAttendee] =
		useState<AttendeePreview | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);

	// Load event info
	useEffect(() => {
		async function loadEvent() {
			try {
				const eventData = await getCheckInEvent(slug);
				setEvent(eventData);
				setView("search");
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : "Event not found",
				);
				setView("error");
			}
		}
		loadEvent();
	}, [slug]);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchValue.trim()) {
			toast.error("Please enter a value to search");
			return;
		}

		setIsSearching(true);
		try {
			const response = await checkIn(slug, searchMethod, searchValue.trim());

			if (response.action === "select") {
				setSearchResults(response.attendees);
				setView("results");
			} else if (response.action === "checked_in") {
				setSelectedAttendee(response.attendee);
				setView("success");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Search failed");
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelectAttendee = (attendee: AttendeePreview) => {
		if (attendee.checked_in) {
			setSelectedAttendee(attendee);
			setView("already-checked-in");
			return;
		}
		setSelectedAttendee(attendee);
		setView("confirm");
	};

	const handleConfirmCheckIn = async () => {
		if (!selectedAttendee) return;

		setIsConfirming(true);
		try {
			const response = await confirmCheckIn(slug, selectedAttendee.public_id);

			if (response.action === "checked_in") {
				setSelectedAttendee(response.attendee);
				setView("success");
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Check-in failed";
			if (message.toLowerCase().includes("already")) {
				setView("already-checked-in");
			} else {
				toast.error(message);
			}
		} finally {
			setIsConfirming(false);
		}
	};

	const handleQRScan = useCallback(
		async (scannedValue: string) => {
			try {
				const response = await checkIn(slug, "scan", scannedValue);

				if (response.action === "checked_in") {
					setSelectedAttendee(response.attendee);
					setView("success");
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Check-in failed";
				if (message.toLowerCase().includes("already")) {
					setView("already-checked-in");
				} else {
					toast.error(message);
					setView("search");
				}
			}
		},
		[slug],
	);

	const handleReset = () => {
		setSearchValue("");
		setSearchResults([]);
		setSelectedAttendee(null);
		setView("search");
	};

	// Loading state
	if (view === "loading") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
			</div>
		);
	}

	// Error state
	if (view === "error") {
		return (
			<div className="space-y-6">
				<div className="border-l-4 border-red-500 pl-6">
					<p className="font-medium text-red-600 text-xs uppercase tracking-widest">
						Error
					</p>
					<p className="mt-2 text-neutral-900 text-xl">{errorMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-10">
			{/* Header */}
			<header>
				<p className="font-medium text-neutral-400 text-xs uppercase tracking-widest">
					Check-In
				</p>
				<h1 className="mt-3 font-bold text-2xl text-neutral-900 leading-tight sm:text-3xl">
					{event?.title}
				</h1>
				<div className="mt-4 h-1 w-12 bg-neutral-900" />
			</header>

			{/* Search View */}
			{view === "search" && (
				<div className="space-y-8">
					{/* Method Toggle */}
					<div className="grid grid-cols-3 gap-2">
						{(["name", "email", "phone"] as const).map((method) => (
							<button
								key={method}
								type="button"
								onClick={() => {
									setSearchMethod(method);
									setSearchValue("");
								}}
								className={`py-3 font-medium text-sm uppercase tracking-wider transition-all ${
									searchMethod === method
										? "bg-neutral-900 text-white"
										: "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
								}`}
							>
								{method}
							</button>
						))}
					</div>

					{/* Search Form */}
					<form onSubmit={handleSearch} className="space-y-6">
						<div>
							<input
								id="search-input"
								type={searchMethod === "email" ? "email" : "text"}
								inputMode={searchMethod === "phone" ? "tel" : undefined}
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								placeholder={
									searchMethod === "name"
										? "Enter name..."
										: searchMethod === "email"
											? "Enter email..."
											: "Enter phone..."
								}
								className="w-full border-2 border-neutral-200 bg-white px-4 py-4 text-lg text-neutral-900 placeholder:text-neutral-300 focus:border-neutral-900 focus:outline-none"
								autoComplete="off"
								autoFocus
							/>
						</div>

						<button
							type="submit"
							disabled={isSearching || !searchValue.trim()}
							className="flex w-full items-center justify-center gap-3 bg-neutral-900 py-4 font-semibold text-white uppercase tracking-wider transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
						>
							{isSearching ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<>
									<Search className="h-5 w-5" />
									Search
								</>
							)}
						</button>
					</form>

					{/* Divider */}
					<div className="flex items-center gap-4">
						<div className="h-px flex-1 bg-neutral-200" />
						<span className="font-medium text-neutral-300 text-xs uppercase tracking-widest">
							or
						</span>
						<div className="h-px flex-1 bg-neutral-200" />
					</div>

					{/* QR Button */}
					<button
						type="button"
						onClick={() => setView("scanning")}
						className="flex w-full items-center justify-center gap-3 border-2 border-neutral-900 py-4 font-semibold text-neutral-900 uppercase tracking-wider transition-all hover:bg-neutral-900 hover:text-white"
					>
						<QrCode className="h-5 w-5" />
						Scan QR Code
					</button>
				</div>
			)}

			{/* Scanning View */}
			{view === "scanning" && (
				<div className="space-y-6">
					<button
						type="button"
						onClick={() => setView("search")}
						className="flex items-center gap-2 font-medium text-neutral-400 text-sm uppercase tracking-wider hover:text-neutral-900"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</button>

					<QRScanner onScan={handleQRScan} />
				</div>
			)}

			{/* Results View */}
			{view === "results" && (
				<div className="space-y-6">
					<button
						type="button"
						onClick={handleReset}
						className="flex items-center gap-2 font-medium text-neutral-400 text-sm uppercase tracking-wider hover:text-neutral-900"
					>
						<ArrowLeft className="h-4 w-4" />
						New Search
					</button>

					<p className="font-medium text-neutral-400 text-xs uppercase tracking-widest">
						{searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
					</p>

					<div className="space-y-3">
						{searchResults.map((attendee) => (
							<button
								key={attendee.public_id}
								type="button"
								onClick={() => handleSelectAttendee(attendee)}
								className={`w-full border-2 p-5 text-left transition-all ${
									attendee.checked_in
										? "border-neutral-200 bg-neutral-50 opacity-60"
										: "border-neutral-200 hover:border-neutral-900"
								}`}
							>
								<div className="flex items-start justify-between">
									<div>
										<p className="font-semibold text-lg text-neutral-900">
											{attendee.name}
										</p>
										{attendee.type_name && (
											<p className="mt-1 text-neutral-500 text-sm">
												{attendee.type_name}
											</p>
										)}
										{attendee.email && (
											<p className="mt-1 text-neutral-400 text-sm">
												{attendee.email}
											</p>
										)}
									</div>
									{attendee.checked_in && (
										<span className="bg-neutral-200 px-2 py-1 font-medium text-neutral-500 text-xs uppercase">
											Checked In
										</span>
									)}
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Confirm View */}
			{view === "confirm" && selectedAttendee && (
				<div className="space-y-8">
					<button
						type="button"
						onClick={() =>
							setView(searchResults.length > 0 ? "results" : "search")
						}
						className="flex items-center gap-2 font-medium text-neutral-400 text-sm uppercase tracking-wider hover:text-neutral-900"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</button>

					<div className="border-l-4 border-neutral-900 py-2 pl-6">
						<p className="font-medium text-neutral-400 text-xs uppercase tracking-widest">
							Confirm Check-In
						</p>
						<p className="mt-3 font-bold text-2xl text-neutral-900">
							{selectedAttendee.name}
						</p>
						{selectedAttendee.type_name && (
							<p className="mt-2 text-neutral-500">{selectedAttendee.type_name}</p>
						)}
					</div>

					<button
						type="button"
						onClick={handleConfirmCheckIn}
						disabled={isConfirming}
						className="flex w-full items-center justify-center gap-3 bg-neutral-900 py-4 font-semibold text-white uppercase tracking-wider transition-all hover:bg-neutral-800 disabled:bg-neutral-300"
					>
						{isConfirming ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<>
								<Check className="h-5 w-5" />
								Confirm Check-In
							</>
						)}
					</button>
				</div>
			)}

			{/* Success View */}
			{view === "success" && selectedAttendee && (
				<div className="space-y-8">
					<div className="border-l-4 border-green-500 bg-green-50 py-6 pl-6 pr-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center bg-green-500">
								<Check className="h-6 w-6 text-white" />
							</div>
							<div>
								<p className="font-medium text-green-700 text-xs uppercase tracking-widest">
									Success
								</p>
								<p className="mt-1 font-bold text-xl text-green-900">
									{selectedAttendee.name}
								</p>
							</div>
						</div>
						{selectedAttendee.type_name && (
							<p className="mt-4 text-green-700">{selectedAttendee.type_name}</p>
						)}
					</div>

					<button
						type="button"
						onClick={handleReset}
						className="flex w-full items-center justify-center gap-3 border-2 border-neutral-900 py-4 font-semibold text-neutral-900 uppercase tracking-wider transition-all hover:bg-neutral-900 hover:text-white"
					>
						Check In Another
					</button>
				</div>
			)}

			{/* Already Checked In View */}
			{view === "already-checked-in" && selectedAttendee && (
				<div className="space-y-8">
					<div className="border-l-4 border-amber-500 bg-amber-50 py-6 pl-6 pr-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center bg-amber-500">
								<X className="h-6 w-6 text-white" />
							</div>
							<div>
								<p className="font-medium text-amber-700 text-xs uppercase tracking-widest">
									Already Checked In
								</p>
								<p className="mt-1 font-bold text-xl text-amber-900">
									{selectedAttendee.name}
								</p>
							</div>
						</div>
						{selectedAttendee.check_in_at && (
							<p className="mt-4 text-amber-700 text-sm">
								{new Date(selectedAttendee.check_in_at).toLocaleString()}
							</p>
						)}
					</div>

					<button
						type="button"
						onClick={handleReset}
						className="flex w-full items-center justify-center gap-3 border-2 border-neutral-900 py-4 font-semibold text-neutral-900 uppercase tracking-wider transition-all hover:bg-neutral-900 hover:text-white"
					>
						Try Another
					</button>
				</div>
			)}
		</div>
	);
}
