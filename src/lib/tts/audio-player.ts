/**
 * Audio Player Utility
 *
 * Handles audio blob playback with proper cleanup and error handling.
 */

export interface AudioPlaybackResult {
	success: boolean;
	error?: string;
}

/**
 * Play an audio blob and return a promise that resolves when playback completes.
 * Handles cleanup of object URLs automatically.
 */
export function playAudioBlob(blob: Blob): Promise<AudioPlaybackResult> {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(blob);
		const audio = new Audio(url);

		const cleanup = () => {
			URL.revokeObjectURL(url);
		};

		audio.onended = () => {
			cleanup();
			resolve({ success: true });
		};

		audio.onerror = (event) => {
			cleanup();
			const error =
				event instanceof ErrorEvent ? event.message : "Audio playback failed";
			resolve({ success: false, error });
		};

		audio.play().catch((err) => {
			cleanup();
			resolve({
				success: false,
				error: err instanceof Error ? err.message : "Failed to start playback",
			});
		});
	});
}

/**
 * Create an audio element for a blob with manual control.
 * Caller is responsible for cleanup.
 */
export function createAudioFromBlob(blob: Blob): {
	audio: HTMLAudioElement;
	url: string;
	cleanup: () => void;
} {
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);

	return {
		audio,
		url,
		cleanup: () => URL.revokeObjectURL(url),
	};
}
