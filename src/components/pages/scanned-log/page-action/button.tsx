import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScannedLogPageButton() {
	return (
		<div className="flex items-center gap-2">
			<Button variant="outline">
				<FileSpreadsheet className="h-4 w-4" />
				Export Log
			</Button>
		</div>
	);
}
