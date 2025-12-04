"use client";

import { Package } from "lucide-react";
import { IconTitle } from "@/components/ui/icon-heading";

export default function ExhibitorKitPage() {
	return (
		<div className="space-y-6 p-0">
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Package}
						title="Exhibitor Kit"
						description="Manage exhibitor kits for your assigned events."
					/>
				</div>
			</div>
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<Package className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">Coming Soon</h3>
				<p className="text-muted-foreground text-sm">
					Exhibitor kit management will be available here.
				</p>
			</div>
		</div>
	);
}
