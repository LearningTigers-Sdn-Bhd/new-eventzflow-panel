import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import SeatSessionCreateModal from "./form-modals/seat-session-create-modal";

export function SeatSessionCreateButton() {
	const { openDialog } = useDialog();

	const openCreate = () => {
		openDialog({
			component: SeatSessionCreateModal,
			config: {
				title: "Create Seat Session",
				description: "Set up a new seat session for this event.",
				size: "lg",
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openCreate}
				className="w-full rounded-none lg:w-auto"
			>
				<Plus className="h-4 w-4" />
				Create Session
			</Button>
		</div>
	);
}
