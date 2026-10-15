export function useFormatDate() {
	const formatDate = (
		date: string | Date,
		style: "numeric" | "long" = "numeric",
	): string => {
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
		const year = dateObj.getFullYear();
		if (style === "long") {
			const month = dateObj.toLocaleString("en-MY", { month: "long" });
			return `${day} ${month} ${year}`;
		}

		const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");

		return `${day}/${month}/${year}`;
	};

	const formatTime = (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (Number.isNaN(dateObj.getTime())) {
			return "Invalid Time";
		}

		return dateObj.toLocaleTimeString("en-US", { timeStyle: "medium" });
	};

	return { formatDate, formatTime };
}
