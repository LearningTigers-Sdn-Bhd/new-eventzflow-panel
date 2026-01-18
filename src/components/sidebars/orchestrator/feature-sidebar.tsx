"use client";

import { PanelLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type {
	FeatureConfig,
	MenuConfig,
	MenuGroup,
	MenuItem,
} from "@/components/sidebars/types";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsTablet } from "@/hooks/use-tablet";
import { useSidebarStore } from "@/stores/sidebar-store";

// ============================================================================
// FEATURE SIDEBAR PROPS
// ============================================================================

interface FeatureSidebarProps {
	config: FeatureConfig;
	leftOffset?: string | number;
	basePath: string;
	isLoading?: boolean;
	permissions?: unknown;
	data?: unknown;
}

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

interface FeatureMenuItemProps {
	item: MenuItem;
	basePath: string;
	isActive: boolean;
}

function FeatureMenuItem({ item, basePath, isActive }: FeatureMenuItemProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				tooltip={item.label}
				className="rounded-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
				isActive={isActive}
			>
				<Link href={`${basePath}/${item.route}` as Route}>
					<item.icon className="size-4" />
					<span>{item.label}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

// ============================================================================
// MENU GROUP COMPONENT
// ============================================================================

interface FeatureMenuGroupProps {
	group: MenuGroup;
	basePath: string;
	checkIsActive: (item: MenuItem) => boolean;
}

function FeatureMenuGroup({
	group,
	basePath,
	checkIsActive,
}: FeatureMenuGroupProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>
				<group.icon className="mr-2 size-4" />
				{group.label}
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{group.tabs.map((item) => (
						<FeatureMenuItem
							key={item.route}
							item={item}
							basePath={basePath}
							isActive={checkIsActive(item)}
						/>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

// ============================================================================
// MENU CONTENT COMPONENT
// ============================================================================

interface FeatureMenuContentProps {
	menu: MenuConfig;
	basePath: string;
	permissions?: unknown;
	data?: unknown;
}

function FeatureMenuContent({
	menu,
	basePath,
	permissions,
	data,
}: FeatureMenuContentProps) {
	const pathname = usePathname();

	// Check if menu item is active
	// Uses item's custom isActive function if provided, otherwise falls back to default
	const checkIsActive = useCallback(
		(item: MenuItem) => {
			if (item.isActive) {
				return item.isActive(pathname, item.route);
			}
			// Default behavior: check if pathname includes the route
			return pathname.includes(`${basePath}/${item.route}`);
		},
		[pathname, basePath],
	);

	// Filter visible standalone items
	const visibleStandalone = useMemo(() => {
		return menu.standalone.filter((item) =>
			item.visible ? item.visible(permissions, data) : true,
		);
	}, [menu.standalone, permissions, data]);

	// Filter visible groups
	const visibleGroups = useMemo(() => {
		return menu.groups
			.map((group) => {
				// Check if group itself is visible
				if (group.visible && !group.visible(permissions, data)) {
					return null;
				}
				// Filter tabs within the group
				const filteredTabs = group.tabs.filter((tab) =>
					tab.visible ? tab.visible(permissions, data) : true,
				);
				// Only return group if it has visible tabs
				return filteredTabs.length > 0
					? { ...group, tabs: filteredTabs }
					: null;
			})
			.filter((group): group is MenuGroup => group !== null);
	}, [menu.groups, permissions, data]);

	return (
		<SidebarContent>
			{/* Standalone items */}
			{visibleStandalone.length > 0 && (
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleStandalone.map((item) => (
								<FeatureMenuItem
									key={item.route}
									item={item}
									basePath={basePath}
									isActive={checkIsActive(item)}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			)}

			{/* Groups */}
			{visibleGroups.map((group) => (
				<FeatureMenuGroup
					key={group.id}
					group={group}
					basePath={basePath}
					checkIsActive={checkIsActive}
				/>
			))}
		</SidebarContent>
	);
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function FeatureSidebarSkeleton({
	leftOffset,
}: {
	leftOffset?: string | number;
}) {
	return (
		<Sidebar leftOffset={leftOffset} collapsible="icon" className="border-l-0">
			<SidebarContent>
				<SidebarMenu>
					{Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
						<SidebarMenuItem key={key}>
							<div className="flex h-8 items-center gap-2 px-2">
								<Skeleton className="size-4 rounded-none" />
								<Skeleton
									className="h-4 flex-1 rounded-none"
									style={{
										width: `${Math.floor(Math.random() * 40) + 50}%`,
									}}
								/>
							</div>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

function FeatureSidebarFooter() {
	const isTablet = useIsTablet();
	const { isEventSidebarOpen, setEventSidebarOpen } = useSidebarStore();

	if (isTablet) return null;

	return (
		<SidebarFooter className="border-t">
			<SidebarMenuButton
				tooltip="Toggle Feature Navigation"
				onClick={() => setEventSidebarOpen(!isEventSidebarOpen)}
			>
				<PanelLeftIcon />
				<span>Close Navigation</span>
			</SidebarMenuButton>
		</SidebarFooter>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FeatureSidebar({
	config,
	leftOffset,
	basePath,
	isLoading = false,
	permissions,
	data,
}: FeatureSidebarProps) {
	if (isLoading) {
		return <FeatureSidebarSkeleton leftOffset={leftOffset} />;
	}

	return (
		<Sidebar leftOffset={leftOffset} collapsible="icon">
			{/* Header (optional) */}
			{config.header && (
				<config.header.component {...(config.header.props ?? {})} />
			)}

			{/* Menu Content */}
			<FeatureMenuContent
				menu={config.menu}
				basePath={basePath}
				permissions={permissions}
				data={data}
			/>

			{/* Footer (optional or default) */}
			{config.footer ? (
				<config.footer.component {...(config.footer.props ?? {})} />
			) : (
				<FeatureSidebarFooter />
			)}
		</Sidebar>
	);
}
