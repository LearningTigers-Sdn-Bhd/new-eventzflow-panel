"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	type AttendeePreview,
	type CheckInMethod,
	checkIn,
	confirmCheckIn,
	getCheckInEvent,
	type PublicEventInfo,
} from "@/lib/api/event-check-in";

export type ViewState =
	| "loading"
	| "error"
	| "search"
	| "results"
	| "confirm"
	| "success"
	| "already-checked-in";

export type InputStep = "selection" | "input";

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function usePublicCheckIn(slug: string, checkInUrl?: string) {
	const [event, setEvent] = useState<PublicEventInfo | null>(null);
	const [view, setView] = useState<ViewState>("loading");
	const [errorMessage, setErrorMessage] = useState("");

	const [searchMethod, setSearchMethod] = useState<CheckInMethod>("name");
	const [searchValue, setSearchValue] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [inputStep, setInputStep] = useState<InputStep>("selection");

	const [searchResults, setSearchResults] = useState<AttendeePreview[]>([]);
	const [liveResults, setLiveResults] = useState<AttendeePreview[]>([]);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [selectedAttendee, setSelectedAttendee] =
		useState<AttendeePreview | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSearchRef = useRef<string>("");

	// Load Event
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

	// Debounced live search as user types (only for name and phone)
	useEffect(() => {
		// Only do live search when in input step, not scanning, and not email (email requires exact match)
		if (
			inputStep !== "input" ||
			searchMethod === "scan" ||
			searchMethod === "email"
		) {
			return;
		}

		// Clear previous debounce
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Clear results immediately when input changes
		setLiveResults([]);

		// Clear results if input is too short
		if (searchValue.trim().length < MIN_SEARCH_LENGTH) {
			setIsSearching(false);
			return;
		}

		// Track this search value
		const currentSearchValue = searchValue.trim();

		debounceRef.current = setTimeout(async () => {
			lastSearchRef.current = currentSearchValue;
			setIsSearching(true);

			try {
				const response = await checkIn(
					slug,
					searchMethod,
					currentSearchValue,
					checkInUrl,
				);

				// Only update if this is still the latest search
				if (lastSearchRef.current === currentSearchValue) {
					if (response.action === "select") {
						setLiveResults(response.attendees);
					} else if (response.action === "checked_in") {
						setSelectedAttendee(response.attendee);
						setView("success");
					}
				}
			} catch (error) {
				// Only clear if this is still the latest search
				if (lastSearchRef.current === currentSearchValue) {
					setLiveResults([]);
				}
			} finally {
				if (lastSearchRef.current === currentSearchValue) {
					setIsSearching(false);
				}
			}
		}, DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [searchValue, searchMethod, inputStep, slug, checkInUrl]);

	// Actions
	const handleSearch = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!searchValue.trim()) {
			toast.error("Input required");
			return;
		}

		setIsSearching(true);
		setSearchError(null);
		try {
			const response = await checkIn(
				slug,
				searchMethod,
				searchValue.trim(),
				checkInUrl,
			);

			if (response.action === "select") {
				setSearchResults(response.attendees);
				setView("results");
			} else if (response.action === "checked_in") {
				setSelectedAttendee(response.attendee);
				setView("success");
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Search failed";
			// For email search, show inline error instead of toast
			if (searchMethod === "email") {
				setSearchError(
					message.includes("not found")
						? "No registration found with this email address. Please check and try again."
						: message,
				);
			} else {
				toast.error(message);
			}
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelectAttendee = async (attendee: AttendeePreview) => {
		// Don't pre-block on attendee.checked_in — it's a snapshot from search
		// time, and once multi-scan is enabled for the event, staying true
		// forever after the first scan is expected (see Multiple Scans in
		// event settings). The real check-in attempt below is the only source
		// of truth for whether this scan is actually allowed; its catch
		// already routes a genuine block to the "already-checked-in" view.
		setSelectedAttendee(attendee);
		setView("confirm");
	};

	const handleConfirmCheckIn = async () => {
		if (!selectedAttendee) return;

		setIsConfirming(true);
		try {
			const response = await confirmCheckIn(
				slug,
				selectedAttendee.public_id,
				checkInUrl,
			);

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
				const response = await checkIn(slug, "scan", scannedValue, checkInUrl);

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
					setInputStep("selection");
				}
			}
		},
		[slug, checkInUrl],
	);

	const handleReset = () => {
		setSearchValue("");
		setSearchResults([]);
		setLiveResults([]);
		setSearchError(null);
		setSelectedAttendee(null);
		setView("search");
		setInputStep("selection");
	};

	// Reset but stay in scan mode (for continuous scanning)
	const handleResetToScan = () => {
		setSearchValue("");
		setSearchResults([]);
		setLiveResults([]);
		setSearchError(null);
		setSelectedAttendee(null);
		setView("search");
		setSearchMethod("scan");
		setInputStep("input");
	};

	const selectMethod = (method: CheckInMethod) => {
		setSearchMethod(method);
		setSearchValue("");
		setLiveResults([]);
		setSearchError(null);
		setInputStep("input");
	};

	const clearLiveResults = () => {
		setLiveResults([]);
	};

	return {
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
		handleResetToScan,
		selectMethod,
		clearLiveResults,
	};
}
