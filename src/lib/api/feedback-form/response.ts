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
