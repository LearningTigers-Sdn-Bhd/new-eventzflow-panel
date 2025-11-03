import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BannerProps {
	title: string;
	description?: string;
	leadingIcon?: ReactNode;
	className?: string;
	onCloser?: boolean;
}

export function Banner({
	title,
	description,
	leadingIcon,
	className,
	onCloser,
}: BannerProps): ReactElement {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return null as unknown as ReactElement;
	}

	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-none border border-primary/20 bg-primary/5 px-4 py-2.5",
				className,
			)}
		>
			{leadingIcon ? (
				<div className="flex shrink-0 items-center justify-center rounded-none border border-primary/30 bg-primary/10 p-2.5">
					{leadingIcon}
				</div>
			) : null}
			<div className="ml-1 min-w-0 flex-1">
				<p className="font-medium text-sm">{title}</p>
				{description ? (
					<p className="text-muted-foreground text-xs">{description}</p>
				) : null}
			</div>
			{onCloser ? (
				<button
					type="button"
					aria-label="Close"
					onClick={() => setIsVisible(false)}
					className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
				>
					<X className="h-4 w-4" />
				</button>
			) : null}
		</div>
	);
}

export default Banner;
