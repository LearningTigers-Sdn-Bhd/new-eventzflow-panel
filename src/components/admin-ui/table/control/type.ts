export type ControlConfig = {
	label: string;
	columnId: string;
	type: "sort" | "filter" | "visibility";
	data?: readonly { label: string; value: string }[];
	topPriority?: boolean;
	// For custom filters not tied to table columns
	customFilter?: {
		value: string;
		onChange: (value: string) => void;
	};
	// For visibility controls
	getColumnLabel?: (columnId: string) => string;
	excludeColumns?: string[];
	// Clears saved column order/visibility and restores the default layout
	onReset?: () => void;
};

export type SearchConfig = {
	placeholder: string;
	enableCustomSearch: boolean;
	columns?: string[];
};
