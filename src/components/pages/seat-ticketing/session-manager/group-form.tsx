import { Check, Layers, Plus, Trash2 } from "lucide-react";
import { ColorPicker } from "@/components/admin-ui/form/color-picker";
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

export function GroupForm() {
	const {
		session,
		selectedSectionId,
		selectedGroupId,
		updateGroup,
		removeGroup,
		selectGroup,
		addGroup,
	} = useSeatSessionStore();

	const section = session?.event_seat_venues?.[0]?.event_seat_sections?.find(
		(s) => s.id === selectedSectionId,
	);
	const selectedGroup = section?.event_seat_groups?.find(
		(g) => g.id === selectedGroupId,
	);

	if (!section) return null;

	const handleChange = (field: string, value: string | number | null) => {
		if (selectedGroupId) {
			updateGroup(selectedGroupId, { [field]: value });
		}
	};

	if (selectedGroup) {
		return (
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 text-primary">
					<Layers className="h-4 w-4" />
					GROUP INFO
				</SidebarGroupLabel>
				<div className="absolute top-3.5 right-0 flex items-center gap-1">
					<SidebarGroupAction
						onClick={() => selectGroup(null)}
						className="text-primary hover:text-primary hover:bg-primary/10 relative rounded-none"
						title="Done editing"
					>
						<Check className="h-4 w-4" />
					</SidebarGroupAction>
					<SidebarGroupAction
						onClick={() => removeGroup(selectedGroup.id)}
						className="text-destructive hover:text-destructive hover:bg-destructive/10 relative rounded-none"
						title="Delete group"
					>
						<Trash2 className="h-4 w-4" />
					</SidebarGroupAction>
				</div>
				<SidebarGroupContent className="space-y-4">
					<InputLabel
						label="Group Name"
						value={selectedGroup.name}
						onChange={(val) => handleChange("name", val)}
						variant="no-rounded"
					/>
					<NumberInputLabel
						label="Additional Price"
						value={
							typeof selectedGroup.extra_price === "string"
								? Number.parseFloat(selectedGroup.extra_price)
								: selectedGroup.extra_price || 0
						}
						onChange={(val) => handleChange("extra_price", val)}
						variant="no-rounded"
						description="Added to section base price"
					/>
					<ColorPicker
						label="Group Color"
						value={selectedGroup.color || "green"}
						onChange={(val) => handleChange("color", val)}
					/>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	return (
		<SidebarGroup className="p-0">
			<SidebarGroupLabel className="px-0 mb-2 flex items-center justify-between uppercase font-bold tracking-wider">
				<div className="flex items-center gap-2">
					<Layers className="h-4 w-4" />
					PRICING GROUPS ({section.event_seat_groups?.length || 0})
				</div>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{section.event_seat_groups?.map((group) => (
						<SidebarMenuItem key={group.id}>
							<SidebarMenuButton
								onClick={() => selectGroup(group.id)}
								className="justify-between h-9 rounded-none"
							>
								<div className="flex items-center gap-2 truncate">
									<Layers className="h-3 w-3 text-slate-400" />
									<span className="truncate">{group.name}</span>
								</div>
								<Badge
									variant="outline"
									className="text-[10px] h-4 font-mono font-normal rounded-none"
								>
									+${group.extra_price}
								</Badge>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() =>
								addGroup(section.id, { name: "New Group", extra_price: 0 })
							}
							className="text-primary hover:text-primary hover:bg-primary/5 gap-2 h-9 rounded-none border border-dashed border-primary/20 mt-1"
						>
							<Plus className="h-3.5 w-3.5" />
							<span className="font-medium uppercase text-[10px]">
								Add Pricing Group
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
