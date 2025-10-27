import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportLogPageButton() {
	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" disabled>
				<FileDown className="h-4 w-4" />
				Download All
			</Button>
		</div>
	);
}
