"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
}) {
	return (
		<div className="relative">
			<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
				className="h-9 rounded-none bg-background pl-9"
			/>
		</div>
	);
}
