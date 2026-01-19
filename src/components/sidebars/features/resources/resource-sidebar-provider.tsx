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

		// Start with null
		let extractedSlug: string | null = null;

		// Handle /posts/[slug]
		const postsIndex = segments.indexOf("posts");
		if (postsIndex !== -1 && segments[postsIndex + 1]) {
			extractedSlug = segments[postsIndex + 1];
		}

		// Handle /published-posts/[slug]
		const publishedPostsIndex = segments.indexOf("published-posts");
		if (publishedPostsIndex !== -1 && segments[publishedPostsIndex + 1]) {
			extractedSlug = segments[publishedPostsIndex + 1];
		}

		// Handle /post-approval/[slug]
		const postApprovalIndex = segments.indexOf("post-approval");
		if (postApprovalIndex !== -1 && segments[postApprovalIndex + 1]) {
			extractedSlug = segments[postApprovalIndex + 1];
		}

		// SAFETY CHECK: Ensure the extracted slug is not actually a route segment
		// This prevents /manage-resources/published-posts from treating "published-posts" as a slug
		// if we somehow got the logic wrong or if the URL structure is unexpected.
		if (
			["published-posts", "post-approval", "posts", "manage"].includes(
				extractedSlug || "",
			)
		) {
			return null;
		}

		return extractedSlug;
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
