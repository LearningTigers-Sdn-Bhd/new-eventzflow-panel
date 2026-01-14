"use client";

import { RichDisplay } from "@/components/admin-ui/rich-editor/display/display";
import { RichDisplayContent } from "@/components/admin-ui/rich-editor/display/display-content";
import { RichDisplayOutline } from "@/components/admin-ui/rich-editor/display/display-outline";
import type { Resource } from "@/lib/api/resource/response";
import GatedForm from "./show-form";

interface ShowArticleProps {
	resource: Resource;
	hasAccess: boolean;
}

export default function ShowArticle({ resource, hasAccess }: ShowArticleProps) {
	if (!hasAccess) {
		return <GatedForm resource={resource} />;
	}

	return (
		<RichDisplay
			content={resource.article || ""}
			className="h-full w-full border-none shadow-none **:data-[slot='outline-toggle-button']:rounded-none! **:data-[slot='outline-toggle-button']:border-black/70! **:data-[slot='outline-toggle-icon']:text-black!"
		>
			<RichDisplayOutline
				style="inset"
				side="left"
				className="h-full! border-black/10 border-y-0! border-l-0! bg-white! pe-2 text-black"
			/>
			<RichDisplayContent className="border-none! bg-white! text-black shadow-none! lg:ps-20!">
				{/* Article content is rendered here */}
			</RichDisplayContent>
		</RichDisplay>
	);
}
