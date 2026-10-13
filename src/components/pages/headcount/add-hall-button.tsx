import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { HallForm } from "./hall-form";

export function AddHallButton({ eventId }: { eventId: string }) {
	const { openDialog } = useDialog();

	return (
		<Button
			variant="outline"
			className="rounded-none"
			onClick={() =>
				openDialog({
					component: HallForm,
					props: { eventId },
					config: {
						title: "Add hall",
						description:
							"A hall is an area of the event whose visitors are counted.",
						size: "md",
					},
				})
			}
		>
			<Plus className="h-4 w-4" />
			Add Hall
		</Button>
	);
}
