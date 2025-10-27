import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import InfoForm from "./info-form";

export function LocationPageButton() {
	const { openDialog } = useDialog();
	const openLocationCreate = () => {
		openDialog({
			component: InfoForm,
			config: {
				title: "Create Location",
			},
		});
	};

	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" onClick={openLocationCreate}>
				<Pencil className="h-4 w-4" />
				Create Location
			</Button>
		</div>
	);
}
