const NOTION_EMBED_URL =
	"https://eventzflow.notion.site/ebd/2ef6f6554406804b99ace89c8f2c0478";

export default function HelpPage() {
	return (
		<div className="size-full overflow-hidden">
			<iframe
				src={NOTION_EMBED_URL}
				className="w-full h-[calc(100%+52px)] -mt-[52px] border-0"
				title="EventzFlow Documentation"
			/>
		</div>
	);
}
