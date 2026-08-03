export const RECOMMENDED_CERTIFICATE_SIZES = {
	landscape: { width: 1123, height: 794 },
	portrait: { width: 794, height: 1123 },
} as const;

export function resolveCertificateCanvasSize(
	naturalWidth: number,
	naturalHeight: number,
): {
	orientation: keyof typeof RECOMMENDED_CERTIFICATE_SIZES;
	canvasWidth: number;
	canvasHeight: number;
} {
	const orientation = naturalWidth >= naturalHeight ? "landscape" : "portrait";
	const recommended = RECOMMENDED_CERTIFICATE_SIZES[orientation];
	const scale =
		orientation === "landscape"
			? Math.max(1, recommended.width / naturalWidth)
			: Math.max(1, recommended.height / naturalHeight);

	return {
		orientation,
		canvasWidth: Math.round(naturalWidth * scale),
		canvasHeight: Math.round(naturalHeight * scale),
	};
}
