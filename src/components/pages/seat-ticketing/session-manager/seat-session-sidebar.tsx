"use client";

import { Check, HelpCircle, LayoutGrid } from "lucide-react";
import { ColorPicker } from "@/components/admin-ui/form/color-picker";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { EventSeatSection } from "@/lib/api/seat-ticketing/response";
import { SeatForm } from "./seat-form";
import { useSeatSessionStore } from "./use-seat-session-store";
import { VenueForm } from "./venue-form";

export function SeatSessionSidebar() {
	const { mode, selectedSectionId, session } = useSeatSessionStore();

	const venue = session?.event_seat_venues?.[0];
	const selectedSection = venue?.event_seat_sections?.find(
		(s) => s.id === selectedSectionId,
	);

	return (
		<Sidebar
			collapsible="none"
			className="w-80 border-r bg-muted/30 h-[calc(100vh-4rem)]"
		>
			<SidebarContent className="px-4 py-4 gap-6 overflow-y-auto">
				{mode === "venue_blueprint" ? (
					<>
						<VenueForm />

						{selectedSection ? (
							<SectionInfoForm section={selectedSection} />
						) : (
							<SectionList />
						)}
					</>
				) : (
					<>
						{selectedSection && (
							<SimplifiedSectionForm section={selectedSection} />
						)}
						<SeatForm />
					</>
				)}
			</SidebarContent>

			<SidebarFooter className="p-2 px-4">
				{/* Usage Tip */}
				<div className="bg-primary/5 border border-primary/20 rounded-none px-3 py-2 flex gap-2">
					<HelpCircle className="h-4 w-4 text-primary shrink-0" />
					<div className="text-xs space-y-0.5">
						<p className="font-semibold text-primary">Pro Tip</p>
						<p className="text-muted-foreground leading-relaxed">
							{mode === "venue_blueprint"
								? "In Create Mode, click any grid cell to place a new section. Drag sections to move them."
								: "Select a seat to edit its details, or use Create Mode to place new seats on the grid."}
						</p>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}

const ROTATION_STEP = 15;

const snapRotation = (value: number) => {
	const normalized = ((value % 360) + 360) % 360;
	const snapped = Math.round(normalized / ROTATION_STEP) * ROTATION_STEP;
	return snapped === 360 ? 0 : snapped;
};

function SectionRotationControls({ section }: { section: EventSeatSection }) {
	const { updateSection } = useSeatSessionStore();
	const rotation = section.rotation ?? 0;

	const setRotation = (value: number) => {
		updateSection(section.id, { rotation: snapRotation(value) });
	};

	return (
		<div className="space-y-2 pt-2 border-t">
			<NumberInputLabel
				label="Rotation (deg)"
				value={rotation}
				onChange={(val: number) => setRotation(val)}
				min={0}
				max={360}
				step={ROTATION_STEP}
				description="Snaps to 15 degree steps"
				variant="no-rounded"
			/>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					className="h-8 rounded-none"
					onClick={() => setRotation(rotation - ROTATION_STEP)}
				>
					-15
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="h-8 rounded-none"
					onClick={() => setRotation(rotation + ROTATION_STEP)}
				>
					+15
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 rounded-none"
					onClick={() => setRotation(0)}
				>
					Reset
				</Button>
			</div>
		</div>
	);
}

function SectionInfoForm({ section }: { section: EventSeatSection }) {
	const { updateSection, selectSection } = useSeatSessionStore();

	const handleChange = (field: string, value: string | number) => {
		updateSection(section.id, { [field]: value });
	};

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 text-primary uppercase font-bold tracking-wider">
				<LayoutGrid className="h-4 w-4" />
				SECTION INFO
			</SidebarGroupLabel>
			<SidebarGroupAction
				onClick={() => selectSection(null)}
				className="text-primary hover:text-primary hover:bg-primary/10"
				title="Done editing"
			>
				<Check className="h-4 w-4" />
			</SidebarGroupAction>
			<SidebarGroupContent className="space-y-4">
				<InputLabel
					label="Name"
					value={section.name}
					onChange={(val: string) => handleChange("name", val)}
					variant="no-rounded"
				/>
				<NumberInputLabel
					label="Base Price"
					value={
						typeof section.price === "string"
							? Number.parseFloat(section.price)
							: section.price || 0
					}
					onChange={(val: number) => handleChange("price", val)}
					variant="no-rounded"
				/>
				<div className="grid grid-cols-2 gap-3">
					<NumberInputLabel
						label="Start Row"
						value={section.start_row || 0}
						onChange={(val: number) => handleChange("start_row", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Start Col"
						value={section.start_column || 0}
						onChange={(val: number) => handleChange("start_column", val)}
						variant="no-rounded"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<NumberInputLabel
						label="Row Span"
						value={section.row_span || 0}
						onChange={(val: number) => handleChange("row_span", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Col Span"
						value={section.col_span || 0}
						onChange={(val: number) => handleChange("col_span", val)}
						variant="no-rounded"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3 pt-2 border-t">
					<NumberInputLabel
						label="Grid Rows"
						value={section.seat_row || 0}
						onChange={(val: number) => handleChange("seat_row", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Grid Cols"
						value={section.seat_column || 0}
						onChange={(val: number) => handleChange("seat_column", val)}
						variant="no-rounded"
					/>
				</div>
				<ColorPicker
					label="Section Color"
					value={section.color || "blue"}
					onChange={(val: string) => handleChange("color", val)}
				/>
				<SectionRotationControls section={section} />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function SimplifiedSectionForm({ section }: { section: EventSeatSection }) {
	const { updateSection, selectSection } = useSeatSessionStore();

	const handleChange = (field: string, value: string | number) => {
		updateSection(section.id, { [field]: value });
	};

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 text-primary uppercase font-bold tracking-wider">
				<LayoutGrid className="h-4 w-4" />
				SECTION INFO
			</SidebarGroupLabel>
			<SidebarGroupAction
				onClick={() => selectSection(null)}
				className="text-primary hover:text-primary hover:bg-primary/10"
				title="Done editing"
			>
				<Check className="h-4 w-4" />
			</SidebarGroupAction>
			<SidebarGroupContent className="space-y-4">
				<InputLabel
					label="Name"
					value={section.name}
					onChange={(val: string) => handleChange("name", val)}
					variant="no-rounded"
				/>
				<NumberInputLabel
					label="Base Price"
					value={
						typeof section.price === "string"
							? Number.parseFloat(section.price)
							: section.price || 0
					}
					onChange={(val: number) => handleChange("price", val)}
					variant="no-rounded"
				/>
				<div className="grid grid-cols-2 gap-3 pt-2 border-t">
					<NumberInputLabel
						label="Grid Rows"
						value={section.seat_row || 0}
						onChange={(val: number) => handleChange("seat_row", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Grid Cols"
						value={section.seat_column || 0}
						onChange={(val: number) => handleChange("seat_column", val)}
						variant="no-rounded"
					/>
				</div>
				<ColorPicker
					label="Section Color"
					value={section.color || "blue"}
					onChange={(val: string) => handleChange("color", val)}
				/>
				<SectionRotationControls section={section} />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function SectionList() {
	const { session, selectSection } = useSeatSessionStore();
	const sections = session?.event_seat_venues?.[0]?.event_seat_sections || [];

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<LayoutGrid className="h-4 w-4" />
					SECTIONS ({sections.length})
				</div>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{sections.length === 0 ? (
						<p className="text-xs text-muted-foreground italic px-2">
							No sections created yet.
						</p>
					) : (
						sections.map((s) => (
							<SidebarMenuItem key={s.id}>
								<SidebarMenuButton
									onClick={() => selectSection(s.id)}
									className="justify-between h-9 rounded-none"
								>
									<span className="truncate">{s.name}</span>
									<Badge
										variant="secondary"
										className="text-[10px] h-4 font-normal rounded-none"
									>
										{s.seat_row}x{s.seat_column}
									</Badge>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
