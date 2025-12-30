// app/api/og/route.tsx

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const rateLimitMap = new Map<string, number[]>();

function rateLimit(ip: string, limit = 10, window = 60000) {
	const now = Date.now();
	const timestamps = rateLimitMap.get(ip) || [];
	const recentTimestamps = timestamps.filter((t) => now - t < window);

	if (recentTimestamps.length >= limit) {
		return false;
	}

	recentTimestamps.push(now);
	rateLimitMap.set(ip, recentTimestamps);
	return true;
}

async function loadGoogleFont(font: string, weight = 400) {
	const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;
	const css = await (await fetch(url, { cache: "force-cache" })).text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype|woff2)'\)/,
	);

	if (resource) {
		const response = await fetch(resource[1], { cache: "force-cache" });
		if (response.status === 200) {
			return await response.arrayBuffer();
		}
	}

	throw new Error("Failed to load font data");
}

export async function GET(request: Request) {
	try {
		const ip =
			request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
		if (!rateLimit(ip)) {
			return new Response("Rate limit exceeded", { status: 429 });
		}

		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const title = searchParams.get("title")?.slice(0, 100) || "EventzFlow";
		const subtitle = searchParams.get("subtitle")?.slice(0, 200);

		const fontData900 = await loadGoogleFont("Inter", 900);
		const fontData600 = subtitle ? await loadGoogleFont("Inter", 600) : null;

		// Load background image
		const imagePath = join(
			process.cwd(),
			"public/images/homepage/Conference.png",
		);
		const imageBuffer = await readFile(imagePath);
		const imageBase64 = imageBuffer.toString("base64");
		const imageDataUrl = `data:image/png;base64,${imageBase64}`;

		const fonts: {
			name: string;
			data: ArrayBuffer;
			weight: 600 | 900;
			style: "normal";
		}[] = [
			{
				name: "Inter",
				data: fontData900,
				weight: 900,
				style: "normal",
			},
		];

		if (fontData600) {
			fonts.push({
				name: "Inter",
				data: fontData600,
				weight: 600,
				style: "normal",
			});
		}

		return new ImageResponse(
			<div tw="flex w-full h-full bg-black relative">
				{/* Background Image */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={imageDataUrl}
					alt="Background"
					tw="absolute inset-0 w-full h-full"
					style={{ objectFit: "cover" }}
				/>

				{/* General Dark Overlay */}
				<div tw="absolute inset-0 bg-emerald-900 opacity-50 filt" />

				{/* Gradient Overlay: Left (Solid Black) -> Right (Transparent) */}
				<div
					tw="absolute inset-0 opacity-90"
					style={{
						background:
							"linear-gradient(110deg, #000000 5%, #000000 45%, rgba(0,0,0,0) 100%)",
					}}
				/>

				{/* Content Container - Left Aligned */}
				<div tw="flex flex-col justify-center items-start w-full h-full p-20 relative z-10">
					<div tw="flex flex-col max-w-lg">
						{/* Title */}
						<div
							tw="text-6xl font-black text-white tracking-tight leading-tight mb-6 text-left"
							style={{ fontFamily: "Inter", fontWeight: 900 }}
						>
							{title}
						</div>

						{/* Subtitle */}
						{subtitle && (
							<div
								tw="text-3xl font-semibold text-neutral-300 leading-tight text-left text-balance max-w-lg"
								style={{ fontFamily: "Inter", fontWeight: 600 }}
							>
								{subtitle}
							</div>
						)}
					</div>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: fonts,
				emoji: "twemoji",
			},
		);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unknown error";
		console.error(`Error generating image: ${message}`);
		return new Response(`Error generating image: ${message}`, { status: 500 });
	}
}
