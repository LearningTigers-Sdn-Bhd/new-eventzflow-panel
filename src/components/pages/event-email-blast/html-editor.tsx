"use client";

import { Textarea } from "@/components/ui/textarea";

/** Raw HTML box with a live preview underneath. The server still cleans the HTML on save. */
export function HtmlEditor({
	value,
	onChange,
}: {
	value: string;
	onChange: (html: string) => void;
}) {
	return (
		<div className="space-y-3">
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				spellCheck={false}
				placeholder="Paste or write your email HTML here"
				className="h-72 resize-y rounded-none font-mono text-xs leading-relaxed"
			/>
			<p className="text-muted-foreground text-xs">
				Use inline styles. Scripts, &lt;style&gt; blocks and event handlers are
				removed when saved, and images must be hosted online (use their full
				https:// address).
			</p>
			<div className="border">
				<p className="border-b bg-muted/40 px-3 py-1.5 font-medium text-muted-foreground text-xs">
					Live preview (the Preview button shows the exact email)
				</p>
				<iframe
					title="Live HTML preview"
					sandbox=""
					srcDoc={value}
					className="h-[480px] w-full border-0 bg-white"
				/>
			</div>
		</div>
	);
}
