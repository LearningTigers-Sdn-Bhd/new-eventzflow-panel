import { AnimatePresence } from "framer-motion";
import type { Wish } from "@/lib/api/wishes";
import type { NormalizedWallSettings } from "./wall-settings";
import { WishCard } from "./wish-card";

type CardWallRendererProps = {
	visibleWishes: Wish[];
	page: number;
	pageNumbers: number[];
	wishesCount: number;
	settings: NormalizedWallSettings;
	preview?: boolean;
};

export function CardWallRenderer({
	visibleWishes,
	page,
	pageNumbers,
	wishesCount,
	settings,
	preview = false,
}: CardWallRendererProps) {
	const accentDotInactiveStyle = {
		backgroundColor: `${settings.style.accentColor}4D`,
	};
	const accentDotActiveStyle = {
		backgroundColor: settings.style.accentColor,
	};
	const emptyStateStyle = {
		backgroundColor: `${settings.style.cardBackgroundColor}D9`,
		color: settings.style.cardTextColor,
	};
	const emptyStateBorderStyle = {
		borderColor: `${settings.style.accentColor}33`,
	};
	const emptyStateIconStyle = {
		backgroundColor: `${settings.style.accentColor}1A`,
		color: settings.style.accentColor,
	};

	if (wishesCount === 0) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div
					className="max-w-lg rounded-[2rem] border p-12 text-center backdrop-blur-sm"
					style={{
						...emptyStateStyle,
						...emptyStateBorderStyle,
					}}
				>
					<div
						className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full"
						style={emptyStateIconStyle}
					>
						<svg
							aria-hidden="true"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							/>
						</svg>
					</div>
					<h3 className="mb-3 font-serif text-2xl">
						Waiting for the first blessing
					</h3>
					<p className="font-serif text-lg italic leading-relaxed opacity-80">
						Approved wishes will appear here in real time during the
						celebration.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${preview ? "pb-0" : "pb-12"}`}>
			{pageNumbers.length > 1 ? (
				<div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em]">
					<div className="flex items-center gap-2 tracking-normal">
						{pageNumbers.map((pageNumber) => (
							<span
								key={pageNumber}
								className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${pageNumber === page ? "w-4" : ""}`}
								style={
									pageNumber === page
										? accentDotActiveStyle
										: accentDotInactiveStyle
								}
							/>
						))}
					</div>
				</div>
			) : null}

			<div className="grid flex-1 auto-rows-max gap-6 [perspective:2000px] md:grid-cols-2 xl:grid-cols-4">
				<AnimatePresence mode="popLayout">
					{visibleWishes.map((wish, index) => (
						<WishCard
							key={wish.id}
							wish={wish}
							index={index}
							settings={settings}
						/>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
