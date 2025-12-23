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

		const day = dateObj.getDate().toString().padStart(2, "0");
		const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
		const year = dateObj.getFullYear();

		return `${day}/${month}/${year}`;
	};

	return { formatDate };
}
