import { AlertTriangle, Box } from "lucide-react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// TypeScript interfaces for universal data state components
interface BaseStateProps {
	title?: string;
	description?: string;
	icon?: React.ReactNode;
	height?: string;
	className?: string;
}

interface ErrorStateProps extends BaseStateProps {
	action?: React.ReactNode;
}

interface EmptyStateProps extends BaseStateProps {
	action?: React.ReactNode;
}

export const LoadingState = ({
	title = "Waiting for data...",
	description = "Please wait while we load the data...",
	icon = <Spinner />,
	height = "h-[calc(100vh-10rem)]",
	className,
}: BaseStateProps) => {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-center p-8",
				height,
				className,
			)}
		>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">{icon}</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
};

export const ErrorState = ({
	title = "Data loading failed...",
	description = "Please try again later. If the problem persists, please contact support.",
	icon = <AlertTriangle />,
	height = "h-[calc(100vh-10rem)]",
	className,
	action,
}: ErrorStateProps) => {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-center p-8",
				height,
				className,
			)}
		>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">{icon}</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>
				{action && <EmptyContent>{action}</EmptyContent>}
			</Empty>
		</div>
	);
};

export const EmptyState = ({
	title = "No data found...",
	description = "Please try again later...",
	icon = <Box />,
	height = "h-[calc(100vh-10rem)]",
	className,
	action,
}: EmptyStateProps) => {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-center p-8",
				height,
				className,
			)}
		>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">{icon}</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>
				{action && <EmptyContent>{action}</EmptyContent>}
			</Empty>
		</div>
	);
};
