// app/api/og/route.tsx
import { ImageResponse } from "next/og";

async function loadGoogleFont(font: string, text: string, weight = 400) {
	const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype|woff2)'\)/,
	);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status === 200) {
			return await response.arrayBuffer();
		}
	}

	throw new Error("Failed to load font data");
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const title =
			searchParams.get("title")?.slice(0, 100) || "EventzFlow";
		const subtitle = searchParams.get("subtitle")?.slice(0, 200);

		const fontData900 = await loadGoogleFont("Inter", title, 900);
		const fontData600 = subtitle ? await loadGoogleFont("Inter", subtitle, 600) : null;

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
			<div tw="flex w-full h-full flex-col items-center justify-center bg-black text-center">
				{/* Background Mesh/Gradient */}
				<div tw="absolute inset-0 bg-[linear-gradient(to_bottom_right,#111111_0%,#000000_100%)]" />
				<div tw="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]" />

				{/* Content Container */}
				<div tw="flex flex-col items-center justify-center relative z-10 px-20">
					{/* Title */}
					<div
						tw="text-8xl font-black text-white tracking-tight leading-tight mb-6"
						style={{ fontFamily: "Inter", fontWeight: 900 }}
					>
						{title}
					</div>

					{/* Subtitle */}
					{subtitle && (
						<div
							tw="text-4xl font-semibold text-neutral-400 max-w-4xl leading-snug"
							style={{ fontFamily: "Inter", fontWeight: 600 }}
						>
							{subtitle}
						</div>
					)}

					{/* Optional Brand Badge/Decoration could go here */}
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
		return new Response("Failed to generate the image", {
			status: 500,
		});
	}
}
