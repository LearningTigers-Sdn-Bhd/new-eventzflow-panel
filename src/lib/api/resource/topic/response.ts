// Backend response types
export type BackendResourceTopic = {
	id: number;
	name: string;
	description: string | null;
	logo: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

// Frontend type
export type ResourceTopic = {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

// Response types
export type CreateResourceTopicResponse = ResourceTopic;
export type UpdateResourceTopicResponse = ResourceTopic;
