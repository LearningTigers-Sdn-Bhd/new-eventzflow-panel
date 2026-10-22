export interface SystemNoticeTemplate {
	id: string;
	label: string;
	text: string;
}

// "[time]" and "[duration]" are filled from the pickers in the form. Any other
// [placeholder] left in the text blocks saving until it is replaced by hand.
export const SYSTEM_NOTICE_TEMPLATES: SystemNoticeTemplate[] = [
	{
		id: "starting-soon",
		label: "Update starting soon",
		text: "A system update will start in a few minutes and takes [duration]. Please save your work. You may be briefly disconnected.",
	},
	{
		id: "scheduled",
		label: "Scheduled update",
		text: "Scheduled system update at [time]. It takes [duration] and you may be briefly disconnected.",
	},
	{
		id: "downtime",
		label: "Brief downtime",
		text: "The system will be briefly unavailable for maintenance at [time] for [duration]. Please finish what you are doing beforehand.",
	},
	{
		id: "in-progress",
		label: "Update in progress",
		text: "We are updating the system right now. Some pages may be slow or unavailable for [duration].",
	},
];

export const CUSTOM_TEMPLATE_ID = "custom";

// Minutes offered for the expected and worst-case duration.
export const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180];
export const DEFAULT_EXPECTED_MINUTES = 10;
export const DEFAULT_WORST_MINUTES = 30;
// Worst case value meaning "don't state one".
export const NO_WORST_CASE = 0;

export interface TemplateValues {
	time: string; // "HH:MM" from <input type="time">, "" until chosen
	expected: number; // minutes
	worst: number; // minutes, NO_WORST_CASE for none
}

export const DEFAULT_TEMPLATE_VALUES: TemplateValues = {
	time: "",
	expected: DEFAULT_EXPECTED_MINUTES,
	worst: DEFAULT_WORST_MINUTES,
};

// The template the text currently matches, or "custom" once it is edited.
export function matchTemplateId(message: string): string {
	const trimmed = message.trim();
	return (
		SYSTEM_NOTICE_TEMPLATES.find((template) => template.text === trimmed)?.id ??
		CUSTOM_TEMPLATE_ID
	);
}

export function templateNeedsTime(template: SystemNoticeTemplate): boolean {
	return template.text.includes("[time]");
}

// "22:00" (from <input type="time">) -> "10:00 PM"; "" for an unfilled/invalid value.
export function formatTime(value: string): string {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value);
	if (!match) return "";
	const hours = Number(match[1]);
	const period = hours >= 12 ? "PM" : "AM";
	return `${hours % 12 || 12}:${match[2]} ${period}`;
}

// 90 -> "1 hour 30 minutes"
export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes} minutes`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	const hoursText = `${hours} ${hours === 1 ? "hour" : "hours"}`;
	return rest ? `${hoursText} ${rest} minutes` : hoursText;
}

// "about 10 minutes (up to 30 minutes in the worst case)"
export function durationPhrase(expected: number, worst: number): string {
	const base = `about ${formatDuration(expected)}`;
	return worst > expected
		? `${base} (up to ${formatDuration(worst)} in the worst case)`
		: base;
}

// The worst case can never be shorter than the expected time: when the
// expected time catches up with it, move it to the next option (or drop it).
export function nextWorst(expected: number, worst: number): number {
	if (worst === NO_WORST_CASE || worst > expected) return worst;
	return DURATION_OPTIONS.find((option) => option > expected) ?? NO_WORST_CASE;
}

// With no time chosen yet, "[time]" is left in place (and blocks saving).
export function fillTemplate(text: string, values: TemplateValues): string {
	const withDuration = text.replace(
		"[duration]",
		durationPhrase(values.expected, values.worst),
	);
	const time = formatTime(values.time);
	return time ? withDuration.replace("[time]", time) : withDuration;
}

export function hasPlaceholder(message: string): boolean {
	return /\[[^\]]+\]/.test(message);
}
