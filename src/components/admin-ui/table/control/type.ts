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
	// When provided, search is driven by the caller instead of the table
	// instance. Used by server-paginated tables, where filtering in the
	// browser would only cover the currently loaded page.
	controlled?: {
		value: string;
		onChange: (value: string) => void;
	};
};
