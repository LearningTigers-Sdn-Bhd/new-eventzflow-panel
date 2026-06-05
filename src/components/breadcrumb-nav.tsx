"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { routeMenuMap } from "@/components/sidebars/features/events/event-menu-config";
import { useEventSidebarContextSafe } from "@/components/sidebars/features/events/event-sidebar-provider";

interface BreadcrumbItem {
	label: string;
	href: string;
	isLast: boolean;
}

const staticRouteLabels: Record<string, string> = {
	event: "Events",
	dashboard: "Dashboard",
	"manage-resources": "Manage Resources",
	help: "Help",
};

function formatSegment(segment: string): string {
	return segment
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function getLabel(
	segment: string,
	prevSegment: string | undefined,
): { label: string; isComposite: boolean } | null {
	if (prevSegment) {
		const compositeRoute = `${prevSegment}/${segment}`;
		if (routeMenuMap[compositeRoute]) {
			return { label: routeMenuMap[compositeRoute].label, isComposite: true };
		}
	}

	if (routeMenuMap[segment]) {
		return { label: routeMenuMap[segment].label, isComposite: false };
	}

	if (staticRouteLabels[segment]) {
		return { label: staticRouteLabels[segment], isComposite: false };
	}

	return null;
}

export function BreadcrumbNav() {
	const pathname = usePathname();
	const eventContext = useEventSidebarContextSafe();

	const breadcrumbs = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const items: BreadcrumbItem[] = [];
		let currentPath = "";

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i];
			const prevSegment = segments[i - 1];
			currentPath += `/${segment}`;
			const isLast = i === segments.length - 1;

			// Dynamic event ID segment
			if (prevSegment === "event" && /^\d+$/.test(segment)) {
				items.push({
					label: eventContext?.currentEvent?.title || `Event #${segment}`,
					href: `${currentPath}/details`,
					isLast,
				});
				continue;
			}

			const labelResult = getLabel(segment, prevSegment);

			if (labelResult) {
				if (labelResult.isComposite) {
					items.pop();
				}
				items.push({
					label: labelResult.label,
					href: currentPath,
					isLast,
				});
			} else {
				items.push({
					label: formatSegment(segment),
					href: currentPath,
					isLast,
				});
			}
		}

		return items;
	}, [pathname, eventContext?.currentEvent?.title]);

	if (breadcrumbs.length === 0) {
		return null;
	}

	return (
		<nav
			aria-label="Breadcrumb"
			className="flex items-center gap-1.5 text-muted-foreground text-sm"
		>
			<Link
				href="/dashboard"
				className="flex items-center transition-colors hover:text-foreground"
			>
				<Home className="size-4" />
			</Link>

			{breadcrumbs.map((item, index) => (
				<div
					key={`${index}-${item.href}`}
					className="flex items-center gap-1.5"
				>
					<ChevronRight className="size-3.5 text-muted-foreground/50" />
					{item.isLast ? (
						<span className="max-w-[250px] truncate font-medium text-foreground">
							{item.label}
						</span>
					) : (
						<Link
							href={item.href as "/dashboard"}
							className="max-w-[200px] truncate transition-colors hover:text-foreground"
						>
							{item.label}
						</Link>
					)}
				</div>
			))}
		</nav>
	);
}
