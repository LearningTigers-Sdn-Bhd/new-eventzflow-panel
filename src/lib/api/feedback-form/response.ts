export type FeedbackQuestionType =
	| "rating"
	| "text"
	| "single_choice"
	| "multi_choice"
	| "yes_no";

export interface FeedbackQuestion {
	id: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	options: string[] | null;
	required: boolean;
	position: number;
}

export interface FeedbackForm {
	id: number;
	event_id: number;
	title: string;
	description: string | null;
	is_active: boolean;
	questions: FeedbackQuestion[];
}

export interface FeedbackFormEnvelope {
	success: boolean;
	message: string;
	data?: FeedbackForm;
}

export interface FeedbackResponseEnvelope {
	success: boolean;
	message: string;
	data: {
		id: number;
		feedback_form_id: number;
		ticket_id: number | null;
		submitted_at: string;
	};
}

export interface FeedbackSummaryOption {
	label: string;
	count: number;
	percent: number;
}

export interface FeedbackSummaryQuestion {
	id: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	required: boolean;
	answered_count: number;
	average?: number;
	distribution?: Record<string, number>;
	options?: FeedbackSummaryOption[];
	latest?: { answer_text: string; submitted_at: string }[];
}

export interface FeedbackSummary {
	total_responses: number;
	last_submitted_at: string | null;
	questions: FeedbackSummaryQuestion[];
}

export interface FeedbackSummaryEnvelope {
	success: boolean;
	message: string;
	data?: FeedbackSummary;
}

export interface FeedbackIndividualResponse {
	id: number;
	submitted_at: string;
	ticket: {
		public_id: string;
		attendee_name: string | null;
		attendee_email: string | null;
		ticket_type_name: string | null;
	} | null;
	answers: Record<string, string | null>;
}

export interface FeedbackResponsePagination {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
	prev_page: number | null;
	next_page: number | null;
	first_page: number;
	last_page: number;
	from: number;
	to: number;
}

export interface FeedbackResponsesEnvelope {
	data: FeedbackIndividualResponse[];
	pagination: FeedbackResponsePagination;
}
