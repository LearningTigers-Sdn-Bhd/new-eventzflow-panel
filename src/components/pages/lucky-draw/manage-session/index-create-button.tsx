import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import CreateForm from "./create-form";

export function LuckyDrawPageButton() {
	const { openDialog } = useDialog();
	const openLuckyDrawCreate = () => {
		openDialog({
			component: CreateForm,
			config: {
				title: "Create Lucky Draw Session",
				description: "Set up a new lucky draw session with custom settings",
				size: "full",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openLuckyDrawCreate}
				className="w-full rounded-none lg:w-auto"
			>
				<Pencil className="h-4 w-4" />
				Create Session
			</Button>
		</div>
	);
}
