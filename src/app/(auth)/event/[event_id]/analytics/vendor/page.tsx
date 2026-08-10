import { PartnerAnalyticsPage } from "@/components/pages/analytics/partner-analytics-page";

export default function VendorAnalyticsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	return <PartnerAnalyticsPage params={params} expectedMode="vendor" />;
}
