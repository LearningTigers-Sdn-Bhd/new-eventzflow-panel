"use client";

import { useSyncExternalStore } from "react";
import { type ReportLanguage, reportLabels } from "@/lib/report-labels";

const storageKey = "report-language";
const changeEvent = "report-language-change";
let fallbackLanguage: ReportLanguage = "en";

function getLanguage(): ReportLanguage {
	try {
		const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
		if (stored === "en" || stored === "bm") return stored;
	} catch {
		// Keep language switching usable when browser storage is unavailable.
	}
	return fallbackLanguage;
}

function subscribe(onChange: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === storageKey || event.key === null) onChange();
	};
	window.addEventListener(changeEvent, onChange);
	window.addEventListener("storage", onStorage);
	return () => {
		window.removeEventListener(changeEvent, onChange);
		window.removeEventListener("storage", onStorage);
	};
}

function setLanguage(language: ReportLanguage) {
	fallbackLanguage = language;
	try {
		localStorage.setItem(storageKey, JSON.stringify(language));
	} catch {
		// In-memory preference still updates every mounted report component.
	}
	window.dispatchEvent(new Event(changeEvent));
}

const getServerLanguage = (): ReportLanguage => "en";

/** Shared EN/BM preference, synchronized across report components and tabs. */
export function useReportLanguage() {
	const language = useSyncExternalStore(
		subscribe,
		getLanguage,
		getServerLanguage,
	);
	return { language, setLanguage, labels: reportLabels[language] };
}
