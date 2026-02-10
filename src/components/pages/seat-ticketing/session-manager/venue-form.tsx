"use client";

import { Image as ImageIcon, Layout, MapIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { EventSeatVenue } from "@/lib/api/seat-ticketing/response";
import { useSeatSessionStore } from "./use-seat-session-store";

export function VenueForm() {
	const { session, updateVenue } = useSeatSessionStore();
	const venue = session?.event_seat_venues?.[0];
	const previewUrlRef = useRef<string | null>(null);

	// Cleanup preview URL on unmount
	useEffect(() => {
		return () => {
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
			}
		};
	}, []);

	if (!venue) return null;

	const handleChange = (
		field: string,
		value: string | number | File | null,
	) => {
		const newData: Partial<EventSeatVenue> = { [field]: value };

		if (field === "image" && value instanceof File) {
			// Cleanup old preview
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
			}
			const previewUrl = URL.createObjectURL(value);
			previewUrlRef.current = previewUrl;
			newData.image_url = previewUrl;
		}

		const ratio = field === "aspect_ratio" ? (value as string) : venue.aspect_ratio;

		if (
			ratio &&
			ratio !== "custom" &&
			(field === "total_row" || field === "total_column" || field === "aspect_ratio")
		) {
			let rows =
				field === "total_row" ? (value as number) : venue.total_row || 0;
			let cols =
				field === "total_column" ? (value as number) : venue.total_column || 0;

			if (ratio === "video") {
				if (field === "total_column" || field === "aspect_ratio")
					rows = Math.round(cols * (9 / 16));
				else if (field === "total_row") cols = Math.round(rows * (16 / 9));
			} else if (ratio === "square") {
				if (field === "total_column" || field === "aspect_ratio") rows = cols;
				else if (field === "total_row") cols = rows;
			} else if (ratio === "4:3") {
				if (field === "total_column" || field === "aspect_ratio")
					rows = Math.round(cols * (3 / 4));
				else if (field === "total_row") cols = Math.round(rows * (4 / 3));
			} else if (ratio === "9:16") {
				if (field === "total_column" || field === "aspect_ratio")
					rows = Math.round(cols * (16 / 9));
				else if (field === "total_row") cols = Math.round(rows * (9 / 16));
			}

			newData.total_row = rows;
			newData.total_column = cols;
		}

		updateVenue(newData);
	};

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 text-primary">
				<MapIcon className="h-4 w-4" />
				VENUE INFO
			</SidebarGroupLabel>
			<SidebarGroupContent className="space-y-4">
				<InputLabel
					label="Venue Name"
					placeholder="Main Hall..."
					value={venue.name || ""}
					onChange={(val) => handleChange("name", val)}
					variant="no-rounded"
				/>

				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						<Layout className="h-3 w-3" />
						Constraint (Aspect Ratio)
					</Label>
					<RadioGroup
						value={venue.aspect_ratio || "video"}
						onValueChange={(val) => handleChange("aspect_ratio", val)}
						className="grid grid-cols-3 gap-2"
					>
						<Label
							htmlFor="r1"
							className="flex items-center space-x-2 bg-background border px-2 py-2 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<RadioGroupItem value="video" id="r1" className="rounded-none" />
							<span className="text-[10px] font-medium uppercase">16:9</span>
						</Label>
						<Label
							htmlFor="r2"
							className="flex items-center space-x-2 bg-background border px-2 py-2 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<RadioGroupItem value="square" id="r2" className="rounded-none" />
							<span className="text-[10px] font-medium uppercase">1:1</span>
						</Label>
						<Label
							htmlFor="r3"
							className="flex items-center space-x-2 bg-background border px-2 py-2 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<RadioGroupItem value="4:3" id="r3" className="rounded-none" />
							<span className="text-[10px] font-medium uppercase">4:3</span>
						</Label>
						<Label
							htmlFor="r4"
							className="flex items-center space-x-2 bg-background border px-2 py-2 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<RadioGroupItem value="9:16" id="r4" className="rounded-none" />
							<span className="text-[10px] font-medium uppercase">9:16</span>
						</Label>
						<Label
							htmlFor="r5"
							className="flex items-center space-x-2 bg-background border px-2 py-2 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<RadioGroupItem value="custom" id="r5" className="rounded-none" />
							<span className="text-[10px] font-medium uppercase">Custom</span>
						</Label>
					</RadioGroup>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<NumberInputLabel
						label="Total Rows"
						value={venue.total_row || 0}
						onChange={(val) => handleChange("total_row", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Total Columns"
						value={venue.total_column || 0}
						onChange={(val) => handleChange("total_column", val)}
						variant="no-rounded"
					/>
				</div>
				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						<ImageIcon className="h-3 w-3" />
						Background Image
					</Label>
					<div className="flex items-center gap-2">
						<Input
							type="file"
							accept="image/*"
							className="text-xs h-9 cursor-pointer bg-background rounded-none"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleChange("image", file);
							}}
						/>
					</div>
				</div>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
