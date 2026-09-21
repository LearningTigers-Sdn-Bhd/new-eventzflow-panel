// src/lib/api/system-activity/types.ts

export interface SystemUser {
	id: number;
	email: string;
	full_name: string;
	role: string;
	is_current_user: boolean;
	last_active_at: string;
	seconds_ago: number;
	status: "active" | "idle";
	latest_activity?: {
		action_name: string;
		category: string;
		http_method: string;
		path: string;
		created_at: string;
	} | null;
}

export interface DeploymentStatus {
	status: "safe" | "warning" | "critical";
	label: string;
	message: string;
	safe_to_deploy: boolean;
}

export interface AiDiagnosis {
	cause: string;
	suggested_fix: string;
	severity: "low" | "medium" | "high";
}

export interface SystemAuditRecord {
	id: number;
	user: {
		id: number;
		email: string;
		full_name: string;
		role: string;
	};
	category: string;
	action_name: string;
	result: "success" | "failed";
	error_message: string | null;
	http_method: string;
	path: string;
	details: Record<string, unknown>;
	ip_address?: string;
	created_at: string;
	unusual: boolean;
	ai_diagnosis: AiDiagnosis | null;
	ai_diagnosed_at: string | null;
}

export interface AnalyzeSystemActivityErrorResponse {
	success: boolean;
	ai_diagnosis: AiDiagnosis;
	ai_diagnosed_at: string;
}

export interface SystemActivityResponse {
	success: boolean;
	deployment_status: DeploymentStatus;
	active_users_summary: {
		total_active_15m: number;
		other_active_15m: number;
		active_last_5m: number;
	};
	active_users: SystemUser[];
	audit_logs: {
		records: SystemAuditRecord[];
		meta: {
			current_page: number;
			per_page: number;
			total_count: number;
			total_pages: number;
		};
	};
}
