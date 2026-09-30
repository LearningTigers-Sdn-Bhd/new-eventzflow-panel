/**
 * The AI comment summary is built but hidden until this is switched on:
 * set NEXT_PUBLIC_FEEDBACK_AI_SUMMARY=true (then rebuild) to show the card and
 * the export option. The API endpoints stay org_owner-only either way.
 */
export const FEEDBACK_AI_ENABLED =
	process.env.NEXT_PUBLIC_FEEDBACK_AI_SUMMARY === "true";
