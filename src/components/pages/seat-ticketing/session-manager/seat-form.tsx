import { Armchair, Check, List, Trash2 } from "lucide-react";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { Badge } from "@/components/ui/badge";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSeatSessionStore } from "./use-seat-session-store";

export function SeatForm() {
	const {
		session,
		selectedSectionId,
		selectedSeatId,
		updateSeat,
		removeSeat,
		selectSeat,
	} = useSeatSessionStore();

	const section = session?.event_seat_venues?.[0]?.event_seat_sections?.find(
		(s) => s.id === selectedSectionId,
	);
	const selectedSeat = section?.event_ticket_seats?.find(
		(s) => s.id === selectedSeatId,
	);

	if (!section) return null;

	const handleChange = (field: string, value: string | number | null) => {
		if (selectedSeatId) {
			updateSeat(selectedSeatId, { [field]: value });
		}
	};

	if (selectedSeat) {
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
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<List className="h-4 w-4" />
					SEATS ({section.event_ticket_seats?.length || 0})
				</div>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{section.event_ticket_seats?.length === 0 ? (
						<p className="text-xs text-muted-foreground italic px-2">
							No seats placed in this section.
						</p>
					) : (
						section.event_ticket_seats?.map((seat) => (
							<SidebarMenuItem key={seat.id}>
								<SidebarMenuButton
									onClick={() => selectSeat(seat.id)}
									className="justify-between h-9 rounded-none"
								>
									<div className="flex items-center gap-2 truncate">
										<Armchair className="h-3 w-3 text-slate-400" />
										<span className="truncate">{seat.name}</span>
									</div>
									<Badge
										variant="outline"
										className="text-[10px] h-4 font-mono font-normal rounded-none"
									>
										{seat.row_set}:{seat.col_set}
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
