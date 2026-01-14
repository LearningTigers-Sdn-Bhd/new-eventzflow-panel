// Backend response types
export type BackendResourceLead = {
	id: number;
	resource_id: number;
	name: string;
	email: string;
	phone: string | null;
	company_name: string | null;
	job_title: string | null;
	state: string | null;
	country: string | null;
	created_at: string;
	updated_at: string;
	resource?: {
		id: number;
		title: string;
		slug: string;
	};
};

// Frontend type
export type ResourceLead = {
	id: string;
	resourceId: string;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	jobTitle: string | null;
	state: string | null;
	country: string | null;
	createdAt: string;
	updatedAt: string;
	resource?: {
		id: string;
		title: string;
		slug: string;
	};
};

// Metrics Types
export type ResourceLeadMetrics = {
	resources: {
		count: number;
		filled: number;
	};
	total_leads: number;
	date: Array<{
		week: string;
		lead_counts: number;
	}>;
	country: Array<{
		name: string;
		count: number;
	}>;
	job: Array<{
		title: string;
		count: number;
	}>;
};

// Response types
export type CreateResourceLeadResponse = ResourceLead;
