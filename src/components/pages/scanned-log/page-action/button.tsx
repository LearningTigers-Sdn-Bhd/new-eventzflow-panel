import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScannedLogPageButton() {
	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button variant="outline" className="w-full lg:w-auto">
				<FileSpreadsheet className="h-4 w-4" />
				Export Log
			</Button>
		</div>
	);
}
