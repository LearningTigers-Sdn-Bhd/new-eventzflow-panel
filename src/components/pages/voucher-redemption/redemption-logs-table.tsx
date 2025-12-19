import { RedemptionLog } from "@/lib/api/voucher-redemption-log";
import { DataTable } from "./table/voucher-log-table";

interface RedemptionLogsTableProps {
	data: RedemptionLog[];
}

/**
 * Table component to display voucher redemption logs
 */
export function RedemptionLogsTable({ data }: RedemptionLogsTableProps) {
	// Render data table
	return <DataTable data={data} />;
}
