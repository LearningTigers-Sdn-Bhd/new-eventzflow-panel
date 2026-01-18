"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
} from "react";
import { toast } from "sonner";
import { useUserPermissions } from "@/hooks/auth/use-user-permissions";
import { getResourceBySlug } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface ResourceSidebarContextValue {
	/** Permissions for current user */
	permissions: ReturnType<typeof useUserPermissions>;
	/** Current resource (if on a post route) */
	resource: Resource | undefined;
	/** Resource slug from URL */
	slug: string | null;
	/** Loading state */
	isLoading: boolean;
	/** Error state */
	error: Error | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ResourceSidebarContext =
	createContext<ResourceSidebarContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function useResourceSidebarContext() {
	const context = useContext(ResourceSidebarContext);
	if (!context) {
		throw new Error(
			"useResourceSidebarContext must be used within a ResourceSidebarProvider",
		);
	}
	return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ResourceSidebarProviderProps {
	children: ReactNode;
}

export function ResourceSidebarProvider({
	children,
}: ResourceSidebarProviderProps) {
	const pathname = usePathname();
	const router = useRouter();

	// Get permissions
	const permissions = useUserPermissions();

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
		isLoading: isLoadingResource,
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
			router.push("/manage-resources/posts");
		}
	}, [error, router]);

	// Combined loading state
	const isLoading = permissions.isLoading || (!!slug && isLoadingResource);

	const value = useMemo<ResourceSidebarContextValue>(
		() => ({
			permissions,
			resource,
			slug,
			isLoading,
			error: error as Error | null,
		}),
		[permissions, resource, slug, isLoading, error],
	);

	return (
		<ResourceSidebarContext.Provider value={value}>
			{children}
		</ResourceSidebarContext.Provider>
	);
}
