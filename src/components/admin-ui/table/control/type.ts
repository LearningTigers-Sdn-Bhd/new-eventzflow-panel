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
};

export type SearchConfig = {
	placeholder: string;
	enableCustomSearch: boolean;
	columns?: string[];
};
