import { PartnerAnalyticsPage } from "@/components/pages/analytics/partner-analytics-page";

export default function ExhibitorAnalyticsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	return <PartnerAnalyticsPage params={params} expectedMode="exhibitor" />;
}
