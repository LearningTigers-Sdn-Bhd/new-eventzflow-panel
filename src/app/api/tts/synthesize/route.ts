import { synthesizeViaGoogle } from "@/lib/tts/server-utils";

interface SynthesizeRequestBody {
	text?: string;
	voiceId?: string;
	normalizeText?: boolean;
	speakingRate?: number;
	pitch?: number;
}

export async function POST(request: Request): Promise<Response> {
	const body = (await request
		.json()
		.catch(() => ({}))) as SynthesizeRequestBody;

	if (typeof body.text !== "string" || typeof body.voiceId !== "string") {
		return Response.json(
			{
				success: false,
				error: "Invalid request payload",
				errorCode: "INVALID_REQUEST",
			},
			{ status: 400 },
		);
	}

	const result = await synthesizeViaGoogle({
		text: body.text,
		voiceId: body.voiceId,
		normalizeText: body.normalizeText,
		speakingRate: body.speakingRate,
		pitch: body.pitch,
	});

	if (result.success && result.audioContent) {
		return Response.json({
			success: true,
			audioContent: result.audioContent,
		});
	}

	const status = result.status ?? 500;
	return Response.json(
		{
			success: false,
			error: result.error ?? "Speech synthesis failed",
			errorCode: status === 429 ? "RATE_LIMIT" : "API_ERROR",
		},
		{ status },
	);
}
