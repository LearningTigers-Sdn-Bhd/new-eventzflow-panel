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
				size: "lg", // Better for mobile - not too wide
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
