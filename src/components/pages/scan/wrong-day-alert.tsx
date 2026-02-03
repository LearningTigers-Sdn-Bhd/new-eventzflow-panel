import { format } from "date-fns";
import { CalendarX } from "lucide-react";

interface WrongDayAlertProps {
	validFrom?: string;
	validTo?: string;
	validityDescription?: string;
}

export function WrongDayAlert({
	validFrom,
	validTo,
	validityDescription,
}: WrongDayAlertProps) {
	const formatDate = (dateStr: string) => {
		try {
			return format(new Date(dateStr), "MMM d");
		} catch {
			return dateStr;
		}
	};

	const formatDateWithYear = (dateStr: string) => {
		try {
			return format(new Date(dateStr), "MMM d, yyyy");
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="border-2 border-orange-300 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-950/30">
			<div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
				<CalendarX className="h-5 w-5" />
				<span className="font-semibold">Ticket Not Valid Today</span>
			</div>
			{validityDescription && (
				<p className="mt-2 text-sm text-orange-700 dark:text-orange-400">
					{validityDescription}
				</p>
			)}
			{validFrom && validTo && !validityDescription && (
				<p className="mt-1 text-xs text-orange-600 dark:text-orange-500">
					Valid: {formatDate(validFrom)} - {formatDateWithYear(validTo)}
				</p>
			)}
		</div>
	);
}
