import { Armchair, Check, Trash2 } from "lucide-react";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { Separator } from "@/components/ui/separator";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { GroupForm } from "./group-form";
import { SeatList } from "./seat-list";
import { useSeatSessionStore } from "./use-seat-session-store";

export function SeatForm() {
	const selectedSectionId = useSeatSessionStore(state => state.selectedSectionId);
	const selectedSeatIds = useSeatSessionStore(state => state.selectedSeatIds);
	const updateSeat = useSeatSessionStore(state => state.updateSeat);
	const removeSeat = useSeatSessionStore(state => state.removeSeat);
	const selectSeat = useSeatSessionStore(state => state.selectSeat);

	const section = useSeatSessionStore(state => 
		selectedSectionId ? state.sections[selectedSectionId] : null
	);

	const isSingleSeatSelected = selectedSeatIds.length === 1;
	const activeSeatId = isSingleSeatSelected ? selectedSeatIds[0] : null;

	const selectedSeat = useSeatSessionStore(state => 
		activeSeatId ? state.seats[activeSeatId] : null
	);

	if (!section) return null;

	const handleChange = (field: string, value: string | number | null) => {
		if (activeSeatId) {
			updateSeat(activeSeatId, { [field]: value });
		}
	};

	if (selectedSeat && isSingleSeatSelected) {
		return (
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 text-primary">
					<Armchair className="h-4 w-4" />
					SEAT INFO
				</SidebarGroupLabel>
				<div className="absolute top-3.5 right-0 flex items-center gap-1">
					<SidebarGroupAction
						onClick={() => selectSeat(null)}
						className="text-primary hover:text-primary hover:bg-primary/10 relative rounded-none"
						title="Done editing"
					>
						<Check className="h-4 w-4" />
					</SidebarGroupAction>
					<SidebarGroupAction
						onClick={() => removeSeat(selectedSeat.id)}
						className="text-destructive hover:text-destructive hover:bg-destructive/10 relative rounded-none"
						title="Delete seat"
					>
						<Trash2 className="h-4 w-4" />
					</SidebarGroupAction>
				</div>
				<SidebarGroupContent className="space-y-4">
					<InputLabel
						label="Seat Name"
						value={selectedSeat.name}
						onChange={(val) => handleChange("name", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Additional Price"
						value={
							typeof selectedSeat.extra_price === "string"
								? Number.parseFloat(selectedSeat.extra_price)
								: selectedSeat.extra_price || 0
						}
						onChange={(val) => handleChange("extra_price", val)}
						variant="no-rounded"
					/>
					<div className="grid grid-cols-2 gap-3">
						<NumberInputLabel
							label="Row Pos"
							value={selectedSeat.row_set || 0}
							onChange={(val) => handleChange("row_set", val)}
							variant="no-rounded"
						/>
						<NumberInputLabel
							label="Col Pos"
							value={selectedSeat.col_set || 0}
							onChange={(val) => handleChange("col_set", val)}
							variant="no-rounded"
						/>
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	return (
		<div className="space-y-8">
			<GroupForm />
			<Separator className="bg-border/50" />
			<SeatList />
		</div>
	);
}
