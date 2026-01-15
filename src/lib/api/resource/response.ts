import type {
	BackendResourceCategory,
	ResourceCategory,
} from "./category/response";
import type {
	BackendResourceMediaType,
	ResourceMediaType,
} from "./media-type/response";
import type { BackendResourceTopic, ResourceTopic } from "./topic/response";

// Backend User (Author)
export type ResourceWritePermission = {
	status: number;
	is_official: boolean;
};

export type ResourceBackendUser = {
	id: number;
	full_name: string;
	email: string;
	phone?: string;
	write_permission?: ResourceWritePermission;
};

export type ResourceAuthor = {
	id: string;
	fullName: string;
	email: string;
	phone?: string;
	writePermission?: {
		status: number;
		isOfficial: boolean;
	};
};

// Image Variants
export type ResourceImageVariants = {
	thumbnail: string;
	medium: string;
	large: string;
	original: string;
};

// Backend Resource

export type BackendResource = {
	id: number;
	title: string;
	slug: string;
	meta_description?: string | null;
	article?: string | null; // Rich text HTML
	status: "draft" | "pending_review" | "published" | "archived" | "rejected";
	is_gated: boolean;
	is_official: boolean;
	rejection_reason: string | null;
	published_at: string | null;
	header_img_url: string | ResourceImageVariants | null;
    min_read?: number;
	priority?: number;

	topic?: BackendResourceTopic;
	category?: BackendResourceCategory;
	media_type?: BackendResourceMediaType;
	author?: ResourceBackendUser;
    suggestions?: BackendResource[];

	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

// Frontend Resource
export type Resource = {
	id: string;
	title: string;
	slug: string;
	metaDescription?: string | null;
	article?: string | null;
	status: "draft" | "pending_review" | "published" | "archived" | "rejected";
	isGated: boolean;
	isOfficial: boolean;
	rejectionReason: string | null;
	publishedAt: string | null;
	headerImgUrl: string | ResourceImageVariants | null;
    minRead?: number;
	priority?: number;

	topic?: ResourceTopic;
	category?: ResourceCategory;
	mediaType?: ResourceMediaType;
	author?: ResourceAuthor;
    suggestions?: Resource[];

	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type CreateResourceResponse = Resource;
export type UpdateResourceResponse = Resource;
