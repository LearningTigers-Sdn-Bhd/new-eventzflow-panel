/**
 * Resolve a reliable preview MIME type for a downloaded file Blob.
 *
 * The preview dialogs key their renderer off `blob.type`, but that value comes
 * from the HTTP `Content-Type` header, which is not trustworthy after security
 * hardening (servers/proxies may strip it or force a generic
 * `application/octet-stream` on `Content-Disposition: attachment` responses).
 * When it is blank or generic the renderer can't pick a branch and the dialog
 * shows up empty even though the bytes are a perfectly valid PDF or image.
 *
 * To stay robust we sniff the leading bytes (magic numbers) and fall back to
 * the declared type only when the signature is unrecognized.
 */

/** MIME type returned when nothing can be determined. */
const UNKNOWN = "application/octet-stream";

async function readLeadingBytes(
	blob: Blob,
	count: number,
): Promise<Uint8Array> {
	const buffer = await blob.slice(0, count).arrayBuffer();
	return new Uint8Array(buffer);
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
	if (bytes.length < signature.length) return false;
	return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Detect the true MIME type from a Blob's magic numbers.
 * Returns the declared `blob.type` when the signature is unrecognized, and
 * `application/octet-stream` when neither yields anything useful.
 */
export async function sniffBlobMimeType(blob: Blob): Promise<string> {
	// Read enough bytes for the longest signature we check (WEBP needs 12).
	const bytes = await readLeadingBytes(blob, 16);

	// PDF: "%PDF-"
	if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
		return "application/pdf";
	}
	// PNG
	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return "image/png";
	}
	// JPEG
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
		return "image/jpeg";
	}
	// GIF87a / GIF89a
	if (
		startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
		startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
	) {
		return "image/gif";
	}
	// WEBP: "RIFF"...."WEBP"
	if (
		startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
		bytes.length >= 12 &&
		startsWith(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50])
	) {
		return "image/webp";
	}

	// Trust the declared type only if it is specific (not blank/generic).
	if (blob.type && blob.type !== UNKNOWN) {
		return blob.type;
	}
	return UNKNOWN;
}

/**
 * Build a blob URL whose type reflects the real bytes, so `<iframe>`/`<img>`
 * preview renderers and the browser's download handling treat it correctly.
 */
export async function createTypedObjectUrl(
	blob: Blob,
): Promise<{ url: string; type: string }> {
	const type = await sniffBlobMimeType(blob);
	// Re-wrap so the object URL carries the sniffed type even when the source
	// blob was created from a response with a missing/generic Content-Type.
	const typedBlob = type === blob.type ? blob : new Blob([blob], { type });
	return { url: URL.createObjectURL(typedBlob), type };
}
