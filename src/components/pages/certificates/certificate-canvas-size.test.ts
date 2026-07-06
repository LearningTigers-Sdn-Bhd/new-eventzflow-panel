import { describe, expect, test } from "bun:test";
import { resolveCertificateCanvasSize } from "./certificate-canvas-size";

describe("resolveCertificateCanvasSize", () => {
	test("upscales tiny landscape uploads to a usable certificate canvas", () => {
		expect(resolveCertificateCanvasSize(300, 232)).toEqual({
			orientation: "landscape",
			canvasWidth: 1123,
			canvasHeight: 868,
		});
	});

	test("keeps larger uploads at their original dimensions", () => {
		expect(resolveCertificateCanvasSize(2339, 1653)).toEqual({
			orientation: "landscape",
			canvasWidth: 2339,
			canvasHeight: 1653,
		});
	});

	test("upscales tiny portrait uploads to a usable certificate canvas", () => {
		expect(resolveCertificateCanvasSize(232, 300)).toEqual({
			orientation: "portrait",
			canvasWidth: 868,
			canvasHeight: 1123,
		});
	});
});
