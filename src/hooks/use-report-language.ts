import { usePersistedState } from "@/hooks/use-persisted-state";
import { type ReportLanguage, reportLabels } from "@/lib/report-labels";

/**
 * Global (not per-event) EN/BM toggle for Custom Reports labels, persisted
 * in localStorage so it's remembered across events and sessions.
 */
export function useReportLanguage() {
	const [language, setLanguage] = usePersistedState<ReportLanguage>(
		"report-language",
		"en",
	);
	return { language, setLanguage, labels: reportLabels[language] };
}
