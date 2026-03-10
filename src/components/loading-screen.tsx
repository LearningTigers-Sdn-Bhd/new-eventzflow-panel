import Image from "next/image";

const ANIMATION_TIMING = {
	logoFadeDuration: 0.45, // logo reveal duration
	glowDuration: 2, // duration of glow pulse
	lineDrawDelay: 0.3, // delay before line starts drawing
	lineDrawDuration: 0.5, // duration of line draw
	lineGlowStart: 0.8, // when line glow starts
	exitDuration: 0.6, // duration of exit animation in seconds
} as const;

// Export the exit duration in milliseconds for external use
export const EXIT_ANIMATION_DURATION_MS = ANIMATION_TIMING.exitDuration * 1000;

const LOADING_SCREEN_STYLES = `
	@keyframes logo-in {
		0% {
			opacity: 0;
			transform: translateY(18px) scale(0.98);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
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

export default function LoadingScreen({
	isExiting = false,
}: LoadingScreenProps) {
	return (
		<div
			className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black"
			style={{
				animation: isExiting
					? `slide-out-up ${ANIMATION_TIMING.exitDuration}s ease-in-out forwards`
					: undefined,
			}}
		>
			<style>{LOADING_SCREEN_STYLES}</style>

			{/* Logo */}
			<div className="relative w-[320px] md:w-[400px] lg:w-[460px]">
				<Image
					src="/logo/LogoDark.png"
					alt="Eventzflow logo"
					width={910}
					height={127}
					priority
					className="h-auto w-full"
					style={{
						opacity: 0,
						animation: `logo-in ${ANIMATION_TIMING.logoFadeDuration}s ease-out forwards`,
						filter: "drop-shadow(0 0 10px rgba(35, 196, 96, 0.25))",
					}}
				/>

				{/* Animated underline */}
				<div className="relative mt-4 h-[4px] overflow-hidden rounded-full bg-white/10">
					<div
						className="absolute top-0 left-0 h-full rounded-full bg-white"
						style={{
							width: 0,
							animation: `draw-line ${ANIMATION_TIMING.lineDrawDuration}s ease-out ${ANIMATION_TIMING.lineDrawDelay}s forwards, line-glow ${ANIMATION_TIMING.glowDuration}s ease-in-out ${ANIMATION_TIMING.lineGlowStart}s infinite`,
						}}
					/>
				</div>
			</div>
		</div>
	);
}
