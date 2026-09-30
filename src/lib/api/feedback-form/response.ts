export type FeedbackQuestionType =
	| "rating"
	| "text"
	| "single_choice"
	| "multi_choice"
	| "yes_no";

export type FeedbackDisplayMode = "pages" | "continuous";

export interface FeedbackPageMetadata {
	page_number: number;
	title?: string | null;
	description?: string | null;
}

export interface FeedbackRoutingRule {
	answer: string;
	action?: "jump_to_page" | "submit";
	target_page?: number | null;
}

export interface FeedbackQuestion {
	id: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	options: string[] | null;
	required: boolean;
	position: number;
	placeholder?: string | null;
	hint_text?: string | null;
	page_number?: number;
	routing_rules?: FeedbackRoutingRule[];
	/** Organizer only: how many responses answered this question. */
	answers_count?: number;
}

export interface FeedbackForm {
	id: number;
	event_id: number;
	/** Version stamp; sent back on save so concurrent edits are detected. */
	updated_at?: string;
	title: string;
	description: string | null;
	is_active: boolean;
	display_mode?: FeedbackDisplayMode;
	pages_metadata?: FeedbackPageMetadata[];
	thank_you_title?: string | null;
	thank_you_message?: string | null;
	questions: FeedbackQuestion[];
	/** Public endpoint only: the `?ticket=` holder has already responded. */
	already_submitted?: boolean;
	/** Public endpoint only: lets this visitor finish even if the form closes. */
	session_token?: string;
	/** Organizer only. */
	response_count?: number;
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
		/** True when a feedback-gated e-certificate was queued for this ticket. */
		certificate_queued: boolean;
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
	/** Responses that could see this question (follows branching). */
	seen_count?: number;
	average?: number;
	satisfied_count?: number;
	/** Share of answers rated 4 or 5. */
	satisfied_percent?: number | null;
	/** Average per ticket type; only when several types responded. */
	by_ticket_type?: FeedbackTicketTypeRating[];
	distribution?: Record<string, number>;
	options?: FeedbackSummaryOption[];
	latest?: { answer_text: string; submitted_at: string }[];
}

export interface FeedbackTicketTypeRating {
	ticket_type_id: number;
	ticket_type_name: string | null;
	average: number;
	count: number;
}

export interface FeedbackResponseRate {
	eligible: number;
	responded: number;
	/** null when nobody was eligible (for example no check-ins yet). */
	percent: number | null;
}

export interface FeedbackTimelinePoint {
	date: string;
	count: number;
}

export interface FeedbackSummary {
	total_responses: number;
	last_submitted_at: string | null;
	response_rate?: FeedbackResponseRate;
	overall_average?: number | null;
	overall_satisfied_percent?: number | null;
	timeline?: FeedbackTimelinePoint[];
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

/** Filters shared by every view and the exports. Empty values mean "no filter". */
export interface FeedbackFilters {
	ticketTypeId?: string;
	from?: string;
	to?: string;
}

export interface FeedbackComment {
	id: number;
	question_id: number;
	question_text: string;
	answer_text: string;
	submitted_at: string;
	/** Average of this response's ratings, when it has any. */
	response_rating: number | null;
	attendee: {
		name: string | null;
		email: string | null;
		ticket_type_name: string | null;
	} | null;
}

export interface FeedbackCommentsEnvelope {
	data: FeedbackComment[];
	pagination: FeedbackResponsePagination;
}

export interface FeedbackNonResponder {
	public_id: string;
	attendee_name: string | null;
	attendee_email: string | null;
	ticket_type_name: string | null;
	checked_in_at: string | null;
	last_emailed_at: string | null;
}

export interface FeedbackNonRespondersEnvelope {
	data: FeedbackNonResponder[];
	pagination: FeedbackResponsePagination;
}

export interface FeedbackRemindResult {
	queued: number;
	skipped: number;
}

export interface FeedbackExportQuestion {
	id: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	options: string[] | null;
	required: boolean;
	page_number: number;
	position: number;
	routing_rules: FeedbackRoutingRule[];
}

export interface FeedbackExportResponse {
	id: number;
	submitted_at: string;
	ticket: {
		public_id: string;
		attendee_name: string | null;
		attendee_email: string | null;
		ticket_type_name: string | null;
	} | null;
	/** Keyed by question id; multi-choice answers are arrays. */
	answers: Record<string, string | string[] | null>;
}

export interface FeedbackExportComment {
	question_id: number;
	question_text: string;
	answer_text: string;
	submitted_at: string;
	attendee_name: string | null;
	attendee_email: string | null;
}

export interface FeedbackExportData {
	generated_at: string;
	filters: { ticket_type_id?: string; from?: string; to?: string };
	event: { title: string; start_date: string | null; end_date: string | null };
	form: { title: string; display_mode: FeedbackDisplayMode };
	summary: FeedbackSummary;
	questions: FeedbackExportQuestion[];
	responses: FeedbackExportResponse[];
	comments: FeedbackExportComment[];
}

export interface FeedbackExportEnvelope {
	success: boolean;
	message: string;
	data: FeedbackExportData;
}

export interface FeedbackRemindEnvelope {
	success: boolean;
	message: string;
	data: FeedbackRemindResult;
}

export type FeedbackSentiment = "positive" | "mixed" | "negative";

export interface FeedbackAiTheme {
	name: string;
	description: string;
	sentiment: FeedbackSentiment;
	/** Approximate number of comments on this theme. */
	comment_count: number;
	/** Verbatim excerpts, verified server-side against the comments. */
	quotes: string[];
}

export interface FeedbackAiContent {
	overall_sentiment: FeedbackSentiment;
	overview: string;
	themes: FeedbackAiTheme[];
	strengths: string[];
	problems: string[];
	suggested_actions: string[];
}

export interface FeedbackAiSummary {
	id: number;
	status: "queued" | "running" | "ready" | "failed";
	content: FeedbackAiContent | null;
	error: string | null;
	model: string | null;
	filters: { ticket_type_id?: string; from?: string; to?: string };
	responses_count: number;
	comments_count: number;
	generated_by: string | null;
	created_at: string;
	finished_at: string | null;
	/** New responses arrived after this summary started. */
	stale: boolean;
}

export interface FeedbackAiSummaryState {
	/** Only an org_owner can generate. */
	can_generate: boolean;
	/** An AI provider with a default model is set up. */
	configured: boolean;
	provider: string | null;
	model: string | null;
	/** Seconds until another summary may be generated. */
	retry_after: number;
	summary: FeedbackAiSummary | null;
}

export interface FeedbackAiSummaryEnvelope {
	success: boolean;
	message: string;
	data: FeedbackAiSummaryState;
}
