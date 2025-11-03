import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { IconTitle } from "@/components/ui/icon-heading";

interface TabHeaderProps {
	icon: LucideIcon | IconType;
	title: string;
	description: string;
	actions?: React.ReactNode;
}

export function TabHeader({
	icon: Icon,
	title,
	description,
	actions,
}: TabHeaderProps) {
	return (
		<div className="px-2 py-2 md:px-4 md:py-4">
			{/* Mobile Layout */}
			<div className="mb-4 flex flex-col gap-8 lg:hidden">
				<IconTitle icon={Icon} title={title} description={description} />
				{actions}
			</div>

			{/* Desktop Layout */}
			<div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
				<IconTitle icon={Icon} title={title} description={description} />
				{actions}
			</div>
		</div>
	);
}
