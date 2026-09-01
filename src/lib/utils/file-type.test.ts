import { describe, expect, test } from "bun:test";
import { createTypedObjectUrl, sniffBlobMimeType } from "./file-type";

function blobWith(bytes: number[], type = ""): Blob {
	return new Blob([new Uint8Array(bytes)], { type });
}

describe("sniffBlobMimeType", () => {
	test("detects PDF from magic bytes even with a generic declared type", async () => {
		const pdf = blobWith(
			[0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
			"application/octet-stream",
		);
		expect(await sniffBlobMimeType(pdf)).toBe("application/pdf");
	});

	test("detects PNG from magic bytes with no declared type", async () => {
		const png = blobWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
		expect(await sniffBlobMimeType(png)).toBe("image/png");
	});

	test("detects JPEG from magic bytes", async () => {
		const jpeg = blobWith([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
		expect(await sniffBlobMimeType(jpeg)).toBe("image/jpeg");
	});

	test("detects WEBP from RIFF/WEBP signature", async () => {
		const webp = blobWith([
			0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
		]);
		expect(await sniffBlobMimeType(webp)).toBe("image/webp");
	});

	test("falls back to a specific declared type for unrecognized bytes", async () => {
		const csv = blobWith([0x61, 0x2c, 0x62], "text/csv");
		expect(await sniffBlobMimeType(csv)).toBe("text/csv");
	});

	test("returns octet-stream when nothing is determinable", async () => {
		const data = blobWith([0x01, 0x02, 0x03, 0x04]);
		expect(await sniffBlobMimeType(data)).toBe("application/octet-stream");
	});
});

describe("createTypedObjectUrl", () => {
	test("returns the sniffed type and an object url", async () => {
		const png = blobWith(
			[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
			"application/octet-stream",
		);
		const { url, type } = await createTypedObjectUrl(png);
		expect(type).toBe("image/png");
		expect(url.startsWith("blob:")).toBe(true);
		URL.revokeObjectURL(url);
	});
});
