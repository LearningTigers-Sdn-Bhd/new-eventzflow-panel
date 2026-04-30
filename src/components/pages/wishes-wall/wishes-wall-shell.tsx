import type { PropsWithChildren } from "react";
import type { NormalizedWallSettings } from "./wall-settings";

type WishesWallShellProps = PropsWithChildren<{
	settings: NormalizedWallSettings;
	eventTitle: string;
	preview?: boolean;
	className?: string;
	contentClassName?: string;
}>;

export function WishesWallShell({
	settings,
	eventTitle,
	preview = false,
	className,
	contentClassName,
	children,
}: WishesWallShellProps) {
	const wallSurfaceStyle = !settings.style.backgroundImageUrl && settings.style.wallOverlay
		? {
				background: settings.style.wallOverlay,
			}
		: undefined;
	const wallBackgroundLayerStyle = settings.style.backgroundImageUrl
		? {
				backgroundImage: `${settings.style.wallOverlay}, url("${settings.style.backgroundImageUrl}")`,
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
			}
		: undefined;
	const wallBackgroundLayerClassName = preview
		? "pointer-events-none absolute inset-0 z-0"
		: "pointer-events-none fixed inset-0 z-0";
	const accentTintStyle = {
		backgroundColor: `${settings.style.accentColor}22`,
	};
	const headerTextStyle = {
		color: settings.style.headerTextColor,
	};
	const accentBorderStyle = {
		borderColor: `${settings.style.accentColor}55`,
	};
	const accentFillStyle = {
		backgroundColor: settings.style.accentColor,
	};

	return (
		<div
			className={
				className ??
				"relative min-h-screen overflow-hidden bg-rsvp-canvas px-6 py-12 sm:px-10 lg:px-14"
			}
			style={wallSurfaceStyle}
		>
			{wallBackgroundLayerStyle ? (
				<div
					className={wallBackgroundLayerClassName}
					style={wallBackgroundLayerStyle}
				/>
			) : null}
			<div className="pointer-events-none absolute inset-0 z-0">
				<div
					className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full opacity-40 blur-[120px]"
					style={accentTintStyle}
				/>
				<div
					className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full opacity-40 blur-[120px]"
					style={accentTintStyle}
				/>
			</div>

			<div
				className={
					contentClassName ??
					"relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-[100rem] flex-col"
				}
			>
				<div className="mb-4 flex flex-col items-center justify-center text-center">
					<div className="flex flex-col items-center">
						<p
							className="mb-4 font-serif text-lg italic tracking-wide"
							style={headerTextStyle}
						>
							Blessings & Wishes for
						</p>
						<h1
							className="mb-8 max-w-4xl text-6xl sm:text-7xl lg:text-8xl"
							style={{
								...headerTextStyle,
								fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
							}}
						>
							{eventTitle}
						</h1>
						<div className="relative w-full max-w-[18rem] py-2">
							<div
								className="absolute inset-0 flex items-center"
								aria-hidden="true"
							>
								<div className="w-full border-t" style={accentBorderStyle} />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-transparent px-4">
									<div
										className="h-2 w-2 rotate-45 border shadow-sm"
										style={{
											...accentBorderStyle,
											...accentFillStyle,
										}}
									/>
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className={preview ? "min-h-0 flex-1" : undefined}>{children}</div>
			</div>
		</div>
	);
}
