// Backend response types
export type BackendResourceLead = {
	id: number;
	resource_id: number;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	created_at: string;
	updated_at: string;
};

// Frontend type
export type ResourceLead = {
	id: string;
	resourceId: string;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	createdAt: string;
	updatedAt: string;
};

// Metrics Types
export type ResourceLeadMetrics = {
    total_leads: number;
    leads_by_resource: {
        resource_id: number;
        resource_title: string;
        count: number;
    }[];
    recent_leads: BackendResourceLead[];
};

// Response types
export type CreateResourceLeadResponse = ResourceLead;
