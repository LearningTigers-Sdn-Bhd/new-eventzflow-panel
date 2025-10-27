export function useFormatDate() {
	const formatDate = (date: string | Date): string => {
		// Handle undefined/null values
		if (!date) {
			return "N/A";
		}

		const dateObj = typeof date === "string" ? new Date(date) : date;

		// Check if the date is valid
		if (Number.isNaN(dateObj.getTime())) {
			return "Invalid Date";
		}

		return dateObj.toLocaleDateString();
	};

	return { formatDate };
}
