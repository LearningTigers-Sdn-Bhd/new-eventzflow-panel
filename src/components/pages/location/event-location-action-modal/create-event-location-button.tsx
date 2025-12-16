import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import InfoForm from "./create-event-location-form";

export function LocationPageButton() {
	const { openDialog } = useDialog();
	const openLocationCreate = () => {
		openDialog({
			component: InfoForm,
			config: {
				title: "Create Location",
				size: "full", // Better for mobile - not too wide
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openLocationCreate}
				className="w-full rounded-none lg:w-auto"
			>
				<Pencil className="h-4 w-4" />
				Create Location
			</Button>
		</div>
	);
}
