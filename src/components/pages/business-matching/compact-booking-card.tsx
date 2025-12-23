import type * as React from "react";
import { cn } from "@/lib/utils";

function CompactCard({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

function CompactCardHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex shrink-0 flex-col space-y-1 bg-muted/20 p-2",
				className,
			)}
			{...props}
		/>
	);
}

function CompactCardTitle({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={cn(
				"font-semibold text-sm leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function CompactCardContent({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("grid flex-1 gap-1 p-2 pt-0", className)} {...props} />
	);
}

function CompactCardFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex shrink-0 items-center p-2 pt-0", className)}
			{...props}
		/>
	);
}

export {
	CompactCard,
	CompactCardHeader,
	CompactCardFooter,
	CompactCardTitle,
	CompactCardContent,
};
