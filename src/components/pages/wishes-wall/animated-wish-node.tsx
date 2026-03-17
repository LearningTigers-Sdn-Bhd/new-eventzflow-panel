type AnimatedWishNodeProps = {
	label: string;
	target: { x: number; y: number; z?: number };
	isPlaceholder?: boolean;
	textColor: string;
	placeholderColor: string;
	/** Callback ref so the parent rAF loop can write positions directly to the DOM */
	nodeRef?: (el: HTMLDivElement | null) => void;
};

export function AnimatedWishNode({
	label,
	target,
	isPlaceholder = false,
	textColor,
	placeholderColor,
	nodeRef,
}: AnimatedWishNodeProps) {
	const zValue = target.z ?? 0;
	const scale = 0.86 + Math.max(zValue, 0) * 0.2;
	const opacity = 0.45 + (zValue + 1) * 0.22;

	// Trim long names so all nodes stay visually consistent on the shape.
	const MAX_LABEL_LENGTH = 12;
	const displayLabel =
		label.length > MAX_LABEL_LENGTH
			? `${label.slice(0, MAX_LABEL_LENGTH)}…`
			: label;

	const textStyle = {
		color: isPlaceholder ? placeholderColor : textColor,
		textShadow: isPlaceholder ? "none" : "0 1px 2px rgba(255,255,255,0.8)",
	};

	return (
		<div
			ref={nodeRef}
			style={{
				left: `${target.x}%`,
				top: `${target.y}%`,
				opacity,
				transform: `translate(-50%, -50%) scale(${scale})`,
			}}
			className="absolute z-10 cursor-default will-change-transform"
		>
			<div className="flex flex-col items-center">
				<span
					className="whitespace-nowrap font-medium font-serif text-[12px] tracking-wide"
					style={textStyle}
				>
					{displayLabel}
				</span>
			</div>
		</div>
	);
}
