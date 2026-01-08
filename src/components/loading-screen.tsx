// Constants for loading screen
const LOGO_LETTERS = [
	{ char: "E", color: "#23c460" },
	{ char: "v", color: "#23c460" },
	{ char: "e", color: "#23c460" },
	{ char: "n", color: "#23c460" },
	{ char: "t", color: "#23c460" },
	{ char: "z", color: "#2766ec" },
	{ char: "F", color: "#23c460" },
	{ char: "l", color: "#23c460" },
	{ char: "o", color: "#23c460" },
	{ char: "w", color: "#23c460" },
] as const;

const ANIMATION_TIMING = {
	letterStagger: 0.05, // seconds between each letter animation
	letterSlideUp: 0.5, // duration of slide-up animation
	glowStart: 0.8, // when glow animation starts
	glowDuration: 2, // duration of glow pulse
	lineDrawDelay: 0.6, // delay before line starts drawing
	lineDrawDuration: 0.8, // duration of line draw
	lineGlowStart: 1.4, // when line glow starts
	taglineFadeDelay: 1, // delay before tagline fades in
	taglineFadeDuration: 0.5, // duration of tagline fade
	exitDuration: 0.6, // duration of exit animation in seconds
} as const;

// Export the exit duration in milliseconds for external use
export const EXIT_ANIMATION_DURATION_MS = ANIMATION_TIMING.exitDuration * 1000;

const LOADING_SCREEN_STYLES = `
	@keyframes slide-up {
		0% {
			opacity: 0;
			transform: translateY(40px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes draw-line {
		0% {
			width: 0;
		}
		100% {
			width: 100%;
		}
	}
	@keyframes pulse-glow {
		0%, 100% {
			text-shadow: 0 0 10px currentColor;
			filter: brightness(1);
		}
		50% {
			text-shadow: 0 0 20px currentColor, 0 0 35px currentColor;
			filter: brightness(1.2);
		}
	}
	@keyframes fade-in-up {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes line-glow {
		0%, 100% {
			box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
		}
		50% {
			box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 25px rgba(255, 255, 255, 0.3);
		}
	}
	@keyframes slide-out-up {
		0% {
			transform: translateY(0);
			opacity: 1;
		}
		100% {
			transform: translateY(-100%);
			opacity: 0;
		}
	}
`;

interface LoadingScreenProps {
	isExiting?: boolean;
}

export default function LoadingScreen({ isExiting = false }: LoadingScreenProps) {
	return (
		<div
			className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
			style={{
				animation: isExiting
					? `slide-out-up ${ANIMATION_TIMING.exitDuration}s ease-in-out forwards`
					: undefined,
			}}
		>
			<style>{LOADING_SCREEN_STYLES}</style>

			{/* Logo */}
			<div className="relative">
					<h1 className="text-5xl font-extrabold md:text-6xl lg:text-7xl flex tracking-tighter">
						{LOGO_LETTERS.map((letter, index) => {
							const letterDelay = index * ANIMATION_TIMING.letterStagger;
							const glowDelay = ANIMATION_TIMING.glowStart + letterDelay;
							const isSpecialChar = letter.char.toLowerCase() === "z";

							return (
								<span
									key={`${letter.char}-${index}`}
									className="inline-block"
									style={{
										color: letter.color,
										opacity: 0,
										animation: `slide-up ${ANIMATION_TIMING.letterSlideUp}s ease-out forwards, pulse-glow ${ANIMATION_TIMING.glowDuration}s ease-in-out infinite`,
										animationDelay: `${letterDelay}s, ${glowDelay}s`,
										filter: isSpecialChar ? "drop-shadow(0 0 8px rgba(39, 102, 236, 0.4))" : undefined,
									}}
								>
									{letter.char}
								</span>
							);
						})}
					</h1>

				{/* Animated underline */}
				<div className="relative h-[4px] mt-4 bg-white/10 overflow-hidden rounded-full">
					<div
						className="absolute left-0 top-0 h-full bg-white rounded-full"
						style={{
							width: 0,
							animation: `draw-line ${ANIMATION_TIMING.lineDrawDuration}s ease-out ${ANIMATION_TIMING.lineDrawDelay}s forwards, line-glow ${ANIMATION_TIMING.glowDuration}s ease-in-out ${ANIMATION_TIMING.lineGlowStart}s infinite`,
						}}
					/>
				</div>
			</div>

			{/* Tagline */}
			<p
				className="mt-10 text-base tracking-[0.25em] uppercase font-medium bg-gradient-to-r from-white/90 via-white/70 to-white/90 bg-clip-text text-transparent"
				style={{
					opacity: 0,
					animation: `fade-in-up ${ANIMATION_TIMING.taglineFadeDuration}s ease-out ${ANIMATION_TIMING.taglineFadeDelay}s forwards`,
					filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.15))",
				}}
			>
				We've got you covered.
			</p>
		</div>
	);
}
