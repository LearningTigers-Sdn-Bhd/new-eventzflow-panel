export const SESSION_STATUS = {
	DRAFT: "draft",
	PUBLISHED: "published",
	CANCELLED: "cancelled",
} as const;

export type SessionStatus =
	(typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const SESSION_STATUS_OPTIONS: {
	value: SessionStatus;
	label: string;
	className: string;
}[] = [
	{
		value: "draft",
		label: "Draft",
		className: "border-slate-500 bg-slate-50 text-slate-700",
	},
	{
		value: "published",
		label: "Published",
		className: "border-emerald-500 bg-emerald-50 text-emerald-700",
	},
	{
		value: "cancelled",
		label: "Cancelled",
		className: "border-red-500 bg-red-50 text-red-700",
	},
];

export const getSessionStatusConfig = (status: string) => {
	return (
		SESSION_STATUS_OPTIONS.find((s) => s.value === status) ?? {
			label: status,
			className: "border-slate-500 bg-slate-50 text-slate-700",
		}
	);
};
