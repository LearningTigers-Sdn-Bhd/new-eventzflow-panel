export function formatDateTime(dateString?: string | null): string {
	if (!dateString) return "Not scheduled";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Invalid date";

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	}).format(date);
}

export function formatDate(dateString?: string | null): string {
	if (!dateString) return "-";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Invalid date";

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

function formatDateDdMmYyyy(dateString?: string | null): string {
	if (!dateString) return "-";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Invalid date";

	const day = String(date.getUTCDate()).padStart(2, "0");
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const year = date.getUTCFullYear();

	return `${day}/${month}/${year}`;
}

export function formatDateRange(
	startDate?: string | null,
	endDate?: string | null,
): string {
	if (!startDate) return "-";

	const formattedStart = formatDateDdMmYyyy(startDate);
	if (!endDate) return formattedStart;

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
		return "Invalid date";

	const isSameDay =
		start.getUTCFullYear() === end.getUTCFullYear() &&
		start.getUTCMonth() === end.getUTCMonth() &&
		start.getUTCDate() === end.getUTCDate();

	if (isSameDay) return formattedStart;

	return `${formattedStart} - ${formatDateDdMmYyyy(endDate)}`;
}
