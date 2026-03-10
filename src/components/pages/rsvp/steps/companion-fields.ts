export type CompanionFieldKey = "full_name" | "phone" | "email";

interface CompanionFieldMeta {
	id: string;
	label: string;
	name: string;
	placeholder: string;
	autoComplete?: string;
	type?: "text" | "email" | "tel";
}

export function getCompanionFieldMeta(
	index: number,
	field: CompanionFieldKey,
): CompanionFieldMeta {
	const prefix = `companion-${index + 1}`;

		switch (field) {
		case "full_name":
			return {
				id: `${prefix}-full-name`,
				label: "Full Name",
				name: "full_name",
				placeholder: "John Doe",
				autoComplete: "name",
				type: "text",
			};
		case "phone":
			return {
				id: `${prefix}-phone`,
				label: "Phone Number",
				name: "phone",
				placeholder: "+1 234 567 8900",
				autoComplete: "tel",
				type: "tel",
			};
		case "email":
			return {
				id: `${prefix}-email`,
				label: "Email Address",
				name: "email",
				placeholder: "john.doe@example.com",
				autoComplete: "email",
				type: "email",
			};
	}
}
