import type { FeedbackQuestionType } from "./response";

export interface FeedbackQuestionInput {
	id?: number;
	question_text: string;
	question_type: FeedbackQuestionType;
	options: string[] | null;
	required: boolean;
	position: number;
	placeholder?: string | null;
	hint_text?: string | null;
}

export interface SaveFeedbackFormRequest {
	title: string;
	description: string | null;
	is_active: boolean;
	feedback_questions_attributes: FeedbackQuestionInput[];
}

export interface SubmitFeedbackRequest {
	form_id: number;
	ticket_public_id?: string;
	answers: { question_id: number; answer_text: string }[];
}
