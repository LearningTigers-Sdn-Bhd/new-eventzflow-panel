export function formatDateTime(dateString?: string | null): string {
	if (!dateString) return "Not scheduled";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Invalid date";
	
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
	if (isNaN(date.getTime())) return "Invalid date";

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}
