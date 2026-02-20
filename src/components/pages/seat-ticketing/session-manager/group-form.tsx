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
import { useSeatSessionStore } from "./store/use-seat-session-store";

export function GroupForm() {
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);
	const selectedGroupId = useSeatSessionStore((state) => state.selectedGroupId);
	const updateGroup = useSeatSessionStore((state) => state.updateGroup);
	const removeGroup = useSeatSessionStore((state) => state.removeGroup);
	const selectGroup = useSeatSessionStore((state) => state.selectGroup);
	const addGroup = useSeatSessionStore((state) => state.addGroup);

	const section = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);
	const selectedGroup = section?.event_seat_groups?.find(
		(g) => g.id === selectedGroupId,
	);

	if (!section || !selectedSectionId) return null;

	const handleChange = (field: string, value: string | number | null) => {
		if (selectedGroupId) {
			updateGroup(selectedSectionId, selectedGroupId, { [field]: value });
		}
	};

	if (selectedGroup) {
		return (
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="mb-2 flex items-center gap-2 px-0 text-primary">
					<Layers className="h-4 w-4" />
					GROUP INFO
				</SidebarGroupLabel>
				<div className="absolute top-3.5 right-0 flex items-center gap-1">
					<SidebarGroupAction
						onClick={() => selectGroup(null)}
						className="relative rounded-none text-primary hover:bg-primary/10 hover:text-primary"
						title="Done editing"
					>
						<Check className="h-4 w-4" />
					</SidebarGroupAction>
					<SidebarGroupAction
						onClick={() => removeGroup(selectedSectionId, selectedGroup.id)}
						className="relative rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
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
			<SidebarGroupLabel className="mb-2 flex items-center justify-between px-0 font-bold uppercase tracking-wider">
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
								className="h-9 justify-between rounded-none"
							>
								<div className="flex items-center gap-2 truncate">
									<Layers className="h-3 w-3 text-slate-400" />
									<span className="truncate">{group.name}</span>
								</div>
								<Badge
									variant="outline"
									className="h-4 rounded-none font-mono font-normal text-[10px]"
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
							className="mt-1 h-9 gap-2 rounded-none border border-primary/20 border-dashed text-primary hover:bg-primary/5 hover:text-primary"
						>
							<Plus className="h-3.5 w-3.5" />
							<span className="font-medium text-[10px] uppercase">
								Add Pricing Group
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
