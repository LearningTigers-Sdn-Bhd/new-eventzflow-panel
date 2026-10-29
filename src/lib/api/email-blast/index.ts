export {
	createEmailBlast,
	deleteEmailBlast,
	deliverEmailBlast,
	duplicateEmailBlast,
	type EmailBlastDraft,
	getEmailBlast,
	getEmailBlastAudience,
	getEmailBlasts,
	previewEmailBlast,
	previewEmailBlastDraft,
	testEmailBlast,
	updateEmailBlast,
} from "./endpoints";
export type {
	EmailBlast,
	EmailBlastAttachment,
	EmailBlastAudience,
	EmailBlastFormat,
	EmailBlastRecipient,
	EmailBlastStatus,
} from "./response";
