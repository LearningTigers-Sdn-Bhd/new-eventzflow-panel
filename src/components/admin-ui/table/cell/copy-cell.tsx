"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface CopyCellProps {
	value: string | number;
	successMessage?: string;
}

export function CopyCell({
	value,
	successMessage = "Copied to clipboard",
}: CopyCellProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage,
	});

	return (
		<div className="flex items-center gap-2 text-center font-medium">
			<p className="truncate">{value}</p>
			<Button
				variant="ghost"
				size="icon"
				className="rounded-none hover:border"
				onClick={() => copyToClipboard(String(value))}
			>
				<Copy className="size-4" />
			</Button>
		</div>
	);
}
