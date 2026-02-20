"use client";

import { Check, HelpCircle, LayoutGrid, Trash2 } from "lucide-react";
import { ArrayInputLabel } from "@/components/admin-ui/form/array-input-label";
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
import type {
	BlueprintConfig,
	EventSeatSection,
} from "@/lib/api/seat-ticketing/response";
import { SeatForm } from "./seat-form";
import { useSeatSessionStore } from "./store/use-seat-session-store";
import { VenueForm } from "./venue-form";

export function SeatSessionSidebar() {
	const mode = useSeatSessionStore((state) => state.mode);
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);
	const selectedSection = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);

	return (
		<Sidebar
			collapsible="none"
			className="flex h-[calc(100vh-4rem)] w-80 flex-col border-r bg-muted/30"
		>
			<SidebarContent className="flex-1 gap-6 overflow-y-auto px-4 py-4">
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
				<div className="flex gap-2 rounded-none border border-primary/20 bg-primary/5 px-3 py-2">
					<HelpCircle className="h-4 w-4 shrink-0 text-primary" />
					<div className="space-y-0.5 text-xs">
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
	const updateSection = useSeatSessionStore((state) => state.updateSection);
	const rotation = section.rotation ?? 0;

	const setRotation = (value: number) => {
		updateSection(section.id, { rotation: snapRotation(value) });
	};

	return (
		<div className="space-y-2 border-t pt-2">
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
	const updateSection = useSeatSessionStore((state) => state.updateSection);
	const selectSection = useSeatSessionStore((state) => state.selectSection);

	const handleChange = (
		field: keyof EventSeatSection,
		value: string | number | BlueprintConfig | null,
	) => {
		updateSection(section.id, { [field]: value });
	};

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="mb-2 flex items-center gap-2 px-0 font-bold text-primary uppercase tracking-wider">
				<LayoutGrid className="h-4 w-4" />
				SECTION INFO
			</SidebarGroupLabel>
			<SidebarGroupAction
				onClick={() => selectSection(null)}
				className="text-primary hover:bg-primary/10 hover:text-primary"
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
				<div className="grid grid-cols-2 gap-3 border-t pt-2">
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

				<div className="space-y-4 border-t pt-4">
					<div className="flex items-center justify-between">
						<p className="font-bold text-[10px] text-primary uppercase tracking-widest">
							Blueprint Generator
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 rounded-none px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => {
								if (
									confirm(
										"Are you sure you want to delete all seats in this section? This cannot be undone until you save or refresh.",
									)
								) {
									useSeatSessionStore.getState().clearSectionSeats(section.id);
								}
							}}
						>
							<Trash2 className="mr-1 h-3 w-3" />
							Clear All Seats
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<NumberInputLabel
							label="Row Gap"
							value={section.blueprint_config?.row_gap || 0}
							onChange={(val: number) =>
								handleChange("blueprint_config", {
									...section.blueprint_config,
									row_gap: val,
								})
							}
							variant="no-rounded"
						/>
						<NumberInputLabel
							label="Col Gap"
							value={section.blueprint_config?.col_gap || 0}
							onChange={(val: number) =>
								handleChange("blueprint_config", {
									...section.blueprint_config,
									col_gap: val,
								})
							}
							variant="no-rounded"
						/>
					</div>

					<ArrayInputLabel
						label="Row Blocks (e.g. 5,5)"
						placeholder="Split by comma"
						value={section.blueprint_config?.row_blocks || []}
						onChange={(val) =>
							handleChange("blueprint_config", {
								...section.blueprint_config,
								row_blocks: val,
							})
						}
					/>

					<ArrayInputLabel
						label="Col Blocks (e.g. 10,10)"
						placeholder="Split by comma"
						value={section.blueprint_config?.col_blocks || []}
						onChange={(val) =>
							handleChange("blueprint_config", {
								...section.blueprint_config,
								col_blocks: val,
							})
						}
					/>
				</div>

				<SectionRotationControls section={section} />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function SimplifiedSectionForm({ section }: { section: EventSeatSection }) {
	const updateSection = useSeatSessionStore((state) => state.updateSection);
	const selectSection = useSeatSessionStore((state) => state.selectSection);

	const handleChange = (
		field: keyof EventSeatSection,
		value: string | number | BlueprintConfig | null,
	) => {
		updateSection(section.id, { [field]: value });
	};

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="mb-2 flex items-center gap-2 px-0 font-bold text-primary uppercase tracking-wider">
				<LayoutGrid className="h-4 w-4" />
				SECTION INFO
			</SidebarGroupLabel>
			<SidebarGroupAction
				onClick={() => selectSection(null)}
				className="text-primary hover:bg-primary/10 hover:text-primary"
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
				<div className="grid grid-cols-2 gap-3 border-t pt-2">
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

				<div className="space-y-4 border-t pt-4">
					<div className="flex items-center justify-between">
						<p className="font-bold text-[10px] text-primary uppercase tracking-widest">
							Blueprint Generator
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 rounded-none px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => {
								if (
									confirm(
										"Are you sure you want to delete all seats in this section? This cannot be undone until you save or refresh.",
									)
								) {
									useSeatSessionStore.getState().clearSectionSeats(section.id);
								}
							}}
						>
							<Trash2 className="mr-1 h-3 w-3" />
							Clear All Seats
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<NumberInputLabel
							label="Row Gap"
							value={section.blueprint_config?.row_gap || 0}
							onChange={(val: number) =>
								handleChange("blueprint_config", {
									...section.blueprint_config,
									row_gap: val,
								})
							}
							variant="no-rounded"
						/>
						<NumberInputLabel
							label="Col Gap"
							value={section.blueprint_config?.col_gap || 0}
							onChange={(val: number) =>
								handleChange("blueprint_config", {
									...section.blueprint_config,
									col_gap: val,
								})
							}
							variant="no-rounded"
						/>
					</div>

					<ArrayInputLabel
						label="Row Blocks (e.g. 5,5)"
						placeholder="Split by comma"
						value={section.blueprint_config?.row_blocks || []}
						onChange={(val) =>
							handleChange("blueprint_config", {
								...section.blueprint_config,
								row_blocks: val,
							})
						}
					/>

					<ArrayInputLabel
						label="Col Blocks (e.g. 10,10)"
						placeholder="Split by comma"
						value={section.blueprint_config?.col_blocks || []}
						onChange={(val) =>
							handleChange("blueprint_config", {
								...section.blueprint_config,
								col_blocks: val,
							})
						}
					/>
				</div>

				<SectionRotationControls section={section} />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function SectionList() {
	const sectionIds = useSeatSessionStore((state) => state.sectionIds);
	const sections = useSeatSessionStore((state) => state.sections);
	const selectSection = useSeatSessionStore((state) => state.selectSection);

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="mb-2 flex items-center justify-between px-0">
				<div className="flex items-center gap-2">
					<LayoutGrid className="h-4 w-4" />
					SECTIONS ({sectionIds.length})
				</div>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{sectionIds.length === 0 ? (
						<p className="px-2 text-muted-foreground text-xs italic">
							No sections created yet.
						</p>
					) : (
						sectionIds.map((sid) => {
							const s = sections[sid];
							if (!s) return null;
							return (
								<SidebarMenuItem key={s.id}>
									<SidebarMenuButton
										onClick={() => selectSection(s.id)}
										className="h-9 justify-between rounded-none"
									>
										<span className="truncate">{s.name}</span>
										<Badge
											variant="secondary"
											className="h-4 rounded-none font-normal text-[10px]"
										>
											{s.seat_row}x{s.seat_column}
										</Badge>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
