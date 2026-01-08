"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Menu, Pen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { IconHeading } from "@/components/admin-ui/icon-heading";
import {
	MobileStickyHeader,
	MobileStickyHeaderContent,
	MobileStickyHeaderIcon,
	MobileStickyHeaderMain,
	MobileStickyHeaderNav,
	MobileStickyHeaderRow,
	MobileStickyHeaderTitle,
} from "@/components/admin-ui/layout/mobile-sticky-header";
import { routeMenuMap } from "@/components/admin-ui/sidebar/resource-menu-config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { getResourceBySlug } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { useResourceActionsStore } from "@/stores/resource-actions-store";

// Context to pass resource to children
const ResourceContext = createContext<Resource | null>(null);
export const useResource = () => useContext(ResourceContext);

interface ResourceLayoutProps {
	children: React.ReactNode;
}

function AvatarIcon({ title }: { title: string }) {
	return (
		<Avatar className="size-8 rounded-none md:size-10">
			<AvatarFallback className="rounded-none bg-amber-200 font-bold">
				{title
					.split(" ")
					.map((word) => word.charAt(0))
					.slice(0, 2)
					.join("")}
			</AvatarFallback>
		</Avatar>
	);
}

function ResourceActionsSlot() {
	const actions = useResourceActionsStore((state) => state.actions);
	return actions ? (
		<div className="flex items-center gap-3">{actions}</div>
	) : null;
}

export default function ResourceLayout({ children }: ResourceLayoutProps) {
	const pathname = usePathname();

	// Render the full layout with sidebar integration
	return (
		<ResourceLayoutContent pathname={pathname}>
			{children}
		</ResourceLayoutContent>
	);
}

interface ResourceLayoutContentProps {
	children: React.ReactNode;
	pathname: string;
}

function ResourceLayoutContent({
	children,
	pathname,
}: ResourceLayoutContentProps) {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const { toggleSidebar } = useSidebar();
	const router = useRouter();

	// Extract slug if we are on a post route
	const slug = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const postsIndex = segments.indexOf("posts");
		if (postsIndex !== -1 && segments[postsIndex + 1]) {
			// Ensure it's not one of the static routes under posts
			const nextSegment = segments[postsIndex + 1];
			if (["published-posts", "post-approval"].includes(nextSegment)) {
				return null;
			}
			return nextSegment;
		}
		return null;
	}, [pathname]);

	// Fetch resource details
	const {
		data: resource,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["resource", slug],
		queryFn: () => getResourceBySlug(slug as string),
		enabled: !!slug,
		retry: false,
	});

	// Handle fetch error
	useEffect(() => {
		if (error) {
			toast.error("Resource not found", {
				description:
					"The resource you are looking for does not exist or has been removed.",
			});
			router.push("/resources/posts");
		}
	}, [error, router]);

	// Determine current menu from pathname
	const currentMenu = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);

		// Handle resource post routes specifically for the second heading
		const postsIndex = segments.indexOf("posts");
		if (postsIndex !== -1 && segments[postsIndex + 1]) {
			const nextSegment = segments[postsIndex + 1];
			if (!["published-posts", "post-approval"].includes(nextSegment)) {
				const isManage = segments.includes("manage");
				if (isManage) {
					return {
						title: "Edit Resource Post",
						description: "Edit and update your resource post details.",
						icon: Pen,
					};
				}
				return {
					title: "Read Resource Post",
					description: "View and read the resource post content.",
					icon: FileText,
				};
			}
		}

		// Walk from the end to find the first segment combination that matches a route
		for (let i = segments.length - 1; i >= 0; i--) {
			for (let j = segments.length; j > i; j--) {
				const segment = segments.slice(i, j).join("/");
				if (routeMenuMap[segment]) {
					return {
						title: routeMenuMap[segment].label,
						description: routeMenuMap[segment].description,
						icon: routeMenuMap[segment].icon,
					};
				}
			}
		}

		// Default
		return {
			title: "Resources",
			description: "Manage and view your resources.",
			icon: Menu,
		};
	}, [pathname]);

	const currentMenuTitle = currentMenu.title;
	const isManageRoute = pathname.includes("/manage");

	return (
		<ResourceContext.Provider value={resource ?? null}>
			<div className="flex min-h-screen flex-col gap-2 md:gap-4">
				{/* Resource Header */}
				<div className="rounded-none border-b-0 border-dashed px-0 pt-4 pb-0 md:border-b md:px-4 md:pb-4">
					{isLoading ? (
						<div className="mx-auto flex w-full flex-col gap-2 3xl:px-4 md:max-w-5xl md:px-0 2xl:max-w-7xl">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-5 w-96" />
						</div>
					) : !isMobile ? (
						<div
							className={cn(
								"mx-auto flex w-full flex-row justify-between gap-4 3xl:px-4 md:px-0",
								isManageRoute
									? "md:max-w-7xl 2xl:max-w-360"
									: "md:max-w-5xl 2xl:max-w-7xl",
							)}
						>
							<div className="flex w-full flex-row gap-4">
								{(resource || slug) && (
									<AvatarIcon title={resource?.title || slug || ""} />
								)}
								<div className="flex flex-col gap-2">
									<div className="flex flex-col items-start">
										<h3 className="text-start font-bold text-lg leading-none tracking-tight md:text-xl">
											{resource
												? resource.title
												: "Resources and Contents Management"}
										</h3>
										<p className="text-justify text-muted-foreground text-sm md:text-base">
											{resource
												? "Manage resource post details, content, and metadata."
												: "Manage platform contents and resources, such as posts, topics, and categories."}
										</p>
									</div>
								</div>
							</div>
							{isTablet && (
								<div className="flex items-center justify-end">
									<Button
										variant="ghost"
										size="icon"
										onClick={toggleSidebar}
										className="size-8 rounded-none"
									>
										<Menu className="size-5" />
										<span className="sr-only">Open Resource Navigation</span>
									</Button>
								</div>
							)}
						</div>
					) : (
						<MobileStickyHeader>
							<MobileStickyHeaderMain>
								<MobileStickyHeaderRow>
									{(resource || slug) && (
										<MobileStickyHeaderIcon
											icon={
												<AvatarIcon title={resource?.title || slug || ""} />
											}
										/>
									)}
									<MobileStickyHeaderTitle>
										{resource
											? resource.title
											: "Resources and Contents Management"}
									</MobileStickyHeaderTitle>
								</MobileStickyHeaderRow>

								<MobileStickyHeaderContent>
									<p className="text-muted-foreground text-sm md:text-base">
										{resource
											? "Manage resource post details, content, and metadata."
											: "Manage platform contents and resources, such as posts, topics, and categories."}
									</p>
								</MobileStickyHeaderContent>
							</MobileStickyHeaderMain>

							<MobileStickyHeaderNav label={currentMenuTitle} />
						</MobileStickyHeader>
					)}
				</div>

				{/* Current Menu Header */}
				<div
					className={cn(
						"mx-auto w-full rounded-none bg-card px-0",
						isManageRoute
							? "md:max-w-7xl 2xl:max-w-360"
							: "md:max-w-5xl 2xl:max-w-7xl",
					)}
				>
					<div className="flex flex-col gap-2 px-0 py-0 md:flex-row md:items-center md:justify-between md:px-4">
						<IconHeading
							icon={currentMenu.icon}
							title={currentMenu.title}
							description={currentMenu.description}
						/>

						{/* Resource Actions Slot */}
						<div className="py-2 md:py-0">
							<ResourceActionsSlot />
						</div>
					</div>

					{/* Page Content */}
					<div className="w-full pt-4 md:px-4">
						<div className="w-full">{children}</div>
					</div>
				</div>
			</div>
		</ResourceContext.Provider>
	);
}
