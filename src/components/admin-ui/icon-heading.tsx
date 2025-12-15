import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BaseProps {
	icon: LucideIcon | IconType;
	title: string;
	description?: string;
	className?: string;
}

interface IconHeadingProps {
	icon: LucideIcon | IconType;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}

export function IconHeading({
	icon: Icon,
	title,
	description,
	children,
	className,
}: IconHeadingProps) {
	const isMobile = useIsMobile();

	return !isMobile ? (
		<div className={cn("flex items-center gap-4", className)}>
			<div className="flex items-center gap-2 rounded-none border bg-muted p-2">
				<Icon className="size-6 md:size-5" />
			</div>
			<div className="flex flex-col">
				{title && (
					<h3 className="font-bold text-lg tracking-tight md:text-xl">
						{title}
					</h3>
				)}
				{description && (
					<p className="text-muted-foreground text-sm md:text-base">
						{description}
					</p>
				)}
				{children}
			</div>
		</div>
	) : (
		<div
			className={cn(
				"flex w-full flex-col items-start gap-2 rounded-none border bg-muted px-4 pt-2 pb-8",
				className,
			)}
		>
			<div className="flex h-full items-center gap-4">
				<Icon className="size-8" />
				{title && (
					<h3 className="text-balance font-bold text-lg tracking-tight md:text-xl">
						{title}
					</h3>
				)}
			</div>
			<div className="flex w-full flex-col">
				{description && (
					<p className="text-muted-foreground text-sm md:text-base">
						{description}
					</p>
				)}
				{children}
			</div>
		</div>
	);
}

export function IconTitle({ icon: Icon, title, description }: BaseProps) {
	const isMobile = useIsMobile();

	return !isMobile ? (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2 rounded-none border bg-muted p-2">
				<Icon className="size-6 md:size-5" />
			</div>
			<div className="flex flex-col">
				<h3 className="font-bold text-lg tracking-tight md:text-xl">{title}</h3>
				{description && (
					<p className="text-muted-foreground text-sm md:text-base">
						{description}
					</p>
				)}
			</div>
		</div>
	) : (
		<div className="flex w-full flex-col items-start gap-2 rounded-none border bg-muted px-4 pt-2 pb-8">
			<div className="flex h-full items-center gap-2">
				<Icon className="size-6 md:size-5" />
				<h3 className="font-bold text-xl tracking-tight">{title}</h3>
			</div>
			<div className="flex w-full flex-col">
				{description && (
					<p className="text-muted-foreground text-sm md:text-base">
						{description}
					</p>
				)}
			</div>
		</div>
	);
}
