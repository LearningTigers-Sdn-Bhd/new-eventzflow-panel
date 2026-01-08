import * as React from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

interface HoverCellProps {
	children: React.ReactNode;
	openDelay?: number;
	closeDelay?: number;
}

const HoverCell = ({
	children,
	openDelay = 0,
	closeDelay = 0,
}: HoverCellProps) => {
	return (
		<HoverCard openDelay={openDelay} closeDelay={closeDelay}>
			{children}
		</HoverCard>
	);
};

interface CellViewProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const CellView = React.forwardRef<HTMLDivElement, CellViewProps>(
	({ className, children, ...props }, ref) => {
		return (
			<HoverCardTrigger asChild>
				<div
					ref={ref}
					className={cn("cursor-help", className)}
					{...props}
				>
					{children}
				</div>
			</HoverCardTrigger>
		);
	},
);
CellView.displayName = "CellView";

interface HoverCardViewProps
	extends React.ComponentPropsWithoutRef<typeof HoverCardContent> {
	children: React.ReactNode;
}

const HoverCardView = React.forwardRef<
	React.ElementRef<typeof HoverCardContent>,
	HoverCardViewProps
>(({ className, children, align = "start", side = "right", ...props }, ref) => {
	return (
		<HoverCardContent
			ref={ref}
			align={align}
			side={side}
			className={cn("w-80 rounded-none", className)}
			onClick={(e) => e.stopPropagation()}
			{...props}
		>
			{children}
		</HoverCardContent>
	);
});
HoverCardView.displayName = "HoverCardView";

export { HoverCell, CellView, HoverCardView };
