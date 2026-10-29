import { pdf } from "@react-pdf/renderer";
import { PeopleCounterAllDaysReport } from "@/components/pdf-reports/people-counter-all-days-report";
import { PeopleCounterReport } from "@/components/pdf-reports/people-counter-report";
import {
	getDailyBreakdown,
	getHeadcount,
	getHeadcountTrends,
} from "@/lib/api/event/hall";
import { downloadBlob } from "../feedback-form/responses/export/download";
import { dayLabel, longDayLabel, shortDayLabel } from "./trend-format";

/** More days than this and the charts would run to many pages; the tables and the Excel report still cover every day. */
const MAX_CHART_DAYS = 7;

const generatedAt = () =>
	new Date().toLocaleString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

/** Builds the people counter PDF for one day (hourly) and saves it. `date` unset = the day the API picks. Only that day's numbers. */
export async function exportPeopleCounterPdf(
	eventId: string,
	eventTitle: string,
	date: string | undefined,
	hour12: boolean,
): Promise<void> {
	const [trends, headcount] = await Promise.all([
		getHeadcountTrends(eventId, { date, bucket: 60 }),
		getHeadcount(eventId),
	]);

	const blob = await pdf(
		<PeopleCounterReport
			data={{
				eventTitle,
				dayLabel: longDayLabel(trends.date),
				generatedAt: generatedAt(),
				trends,
				headcount,
				hour12,
			}}
		/>,
	).toBlob();

	downloadBlob(blob, `people-counts-${trends.date}.pdf`);
}

/** Builds the whole-event people counter PDF: totals, every day, hall totals and each day's crowd. */
export async function exportPeopleCounterAllDaysPdf(
	eventId: string,
	eventTitle: string,
	hour12: boolean,
): Promise<void> {
	const [daily, headcount] = await Promise.all([
		getDailyBreakdown(eventId),
		getHeadcount(eventId),
	]);
	const { days } = daily;
	if (days.length === 0) throw new Error("No event day has been counted yet.");

	const hourly = await Promise.all(
		days.slice(-MAX_CHART_DAYS).map(async (d) => ({
			date: d.date,
			points: (await getHeadcountTrends(eventId, { date: d.date, bucket: 60 }))
				.event.points,
		})),
	);
	const first = days[0].date;
	const last = days[days.length - 1].date;

	const blob = await pdf(
		<PeopleCounterAllDaysReport
			data={{
				eventTitle,
				rangeLabel:
					first === last
						? dayLabel(last)
						: `${shortDayLabel(first)} to ${dayLabel(last)}`,
				generatedAt: generatedAt(),
				headcount,
				days,
				hourly,
				hour12,
			}}
		/>,
	).toBlob();

	downloadBlob(blob, "people-counts-all-days.pdf");
}
