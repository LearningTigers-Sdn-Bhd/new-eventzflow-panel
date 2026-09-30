import type {
	FeedbackDisplayMode,
	FeedbackPageMetadata,
	FeedbackQuestionType,
	FeedbackRoutingRule,
} from "./response";

export interface FeedbackQuestionInput {
	id?: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	options: string[] | null;
	required: boolean;
	position: number;
	placeholder?: string | null;
	hint_text?: string | null;
	page_number?: number;
	routing_rules?: FeedbackRoutingRule[];
}

export interface SaveFeedbackFormRequest {
	/** Version the editor loaded; a mismatch means someone else saved (409). */
	expected_updated_at?: string;
	title: string;
	description: string | null;
	is_active: boolean;
	display_mode?: FeedbackDisplayMode;
	pages_metadata?: FeedbackPageMetadata[];
	thank_you_title?: string | null;
	thank_you_message?: string | null;
	feedback_questions_attributes: FeedbackQuestionInput[];
}

export interface SubmitFeedbackRequest {
	form_id: number;
	ticket_public_id?: string;
	session_token?: string;
	answers: { question_id: number; answer_text: string }[];
}
