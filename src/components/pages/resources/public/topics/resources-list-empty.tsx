"use client";

import { FileX2 } from "lucide-react";

export function ResourcesListEmpty() {
	return (
		<div className="mx-auto flex h-full w-full max-w-md items-center justify-center lg:max-w-xl">
			<div className="flex h-full w-full flex-row items-center justify-center py-28">
				<div className="flex h-full items-center justify-center">
					<FileX2 className="size-24 text-black lg:size-48" />
				</div>
				<div className="flex flex-col items-start justify-start">
					<h3 className="font-black text-5xl text-black uppercase tracking-tighter lg:text-7xl">
						Discover resources
					</h3>
					<p className="text-balance ps-1 text-base text-stone-950 tracking-tight lg:text-lg">
						Use the search or filters above to explore our collection and find
						what you're looking for
					</p>
				</div>
			</div>
		</div>
	);
}
