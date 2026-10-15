import { pdf } from "@react-pdf/renderer";
import { PeopleCounterReport } from "@/components/pdf-reports/people-counter-report";
import {
	getDailyBreakdown,
	getHeadcount,
	getHeadcountTrends,
} from "@/lib/api/event/hall";
import { downloadBlob } from "../feedback-form/responses/export/download";
import { longDayLabel } from "./trend-format";

/** Builds the people counter PDF for one day (hourly) and saves it. `date` unset = the day the API picks. */
export async function exportPeopleCounterPdf(
	eventId: string,
	eventTitle: string,
	date: string | undefined,
): Promise<void> {
	const [trends, headcount, daily] = await Promise.all([
		getHeadcountTrends(eventId, { date, bucket: 60 }),
		getHeadcount(eventId),
		getDailyBreakdown(eventId),
	]);

	const blob = await pdf(
		<PeopleCounterReport
			data={{
				eventTitle,
				dayLabel: longDayLabel(trends.date),
				generatedAt: new Date().toLocaleString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				}),
				trends,
				headcount,
				days: daily.days,
			}}
		/>,
	).toBlob();

	downloadBlob(blob, `people-counts-${trends.date}.pdf`);
}
