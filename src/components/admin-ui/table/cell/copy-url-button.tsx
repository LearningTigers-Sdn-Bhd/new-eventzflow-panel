"use client";

import { Check, Copy, Globe } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CopyUrlButtonProps {
	slug: string;
}

export function CopyUrlButton({ slug }: CopyUrlButtonProps) {
	const [isCopied, setIsCopied] = React.useState(false);
	const [origin, setOrigin] = React.useState("");

	React.useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const url = `${origin}/resources/${slug}`;

	const handleCopy = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		navigator.clipboard.writeText(url);
		setIsCopied(true);
		toast.success("Public URL copied to clipboard");
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<div
			className="space-y-1.5 pt-2"
			onClick={(e) => e.stopPropagation()}
		>
			<Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
				Public URL
			</Label>
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Globe className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={url}
						readOnly
						onClick={(e) => e.stopPropagation()}
						className="h-8 rounded-none border-dashed pl-8 text-xs font-mono"
					/>
				</div>
				<Button
					size="icon"
					variant="outline"
					className="h-8 w-8 rounded-none shrink-0"
					onClick={handleCopy}
					title="Copy URL"
				>
					{isCopied ? (
						<Check className="h-3.5 w-3.5 text-green-500" />
					) : (
						<Copy className="h-3.5 w-3.5" />
					)}
				</Button>
			</div>
		</div>
	);
}
