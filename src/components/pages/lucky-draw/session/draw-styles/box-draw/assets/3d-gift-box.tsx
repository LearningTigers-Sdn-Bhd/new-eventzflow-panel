"use client";

import CSSBox, { type CSSBoxRef } from "@/components/ui/css-box";

interface ThreeDGiftBoxProps {
	lidRef: React.RefObject<CSSBoxRef | null>;
	mainBoxRef: React.RefObject<CSSBoxRef | null>;
}

export function ThreeDGiftBox({ lidRef, mainBoxRef }: ThreeDGiftBoxProps) {
	// Lid face components - extracted from colorful.tsx lines 42-64
	const LidTop = () => (
		<div className="flex h-full w-full flex-col">
			<div className="grid h-full grid-cols-5">
				<div className="col-span-2 bg-[#d43536]" />
				<div className="bg-[#fac26e]" />
				<div className="col-span-2 bg-[#d43536]" />
			</div>
			<div className="h-10 shrink-0 bg-[#fac26e]" />
			<div className="grid h-full grid-cols-5">
				<div className="col-span-2 bg-[#d43536]" />
				<div className="bg-[#fac26e]" />
				<div className="col-span-2 bg-[#d43536]" />
			</div>
		</div>
	);

	const LidSide = () => (
		<div className="grid h-full w-full grid-cols-5">
			<div className="col-span-2 bg-[#d43536]" />
			<div className="bg-[#fac26e]" />
			<div className="col-span-2 bg-[#d43536]" />
		</div>
	);

	const LidBottom = () => (
		<div className="flex h-full w-full flex-col border-8 border-[#d43536]">
			<div className="h-full border-8 border-[#d43536] bg-[#a32b2c]" />
		</div>
	);

	// MainBox face components - extracted from colorful.tsx lines 67-90
	const MainBoxTop = () => (
		<div className="flex h-full w-full flex-col border-8 border-[#d43536]">
			<div className="h-full border-8 border-[#d43536] bg-[#a32b2c]" />
		</div>
	);

	const MainBoxSide = () => (
		<div className="grid h-full w-full grid-cols-5">
			<div className="col-span-2 bg-[#a33029]" />
			<div className="bg-[#e29d3a]" />
			<div className="col-span-2 bg-[#a33029]" />
		</div>
	);

	const MainBoxBottom = () => (
		<div className="flex h-full w-full flex-col">
			<div className="grid h-full grid-cols-5">
				<div className="col-span-2 bg-[#a33029]" />
				<div className="bg-[#e29d3a]" />
				<div className="col-span-2 bg-[#a33029]" />
			</div>
			<div className="h-10 shrink-0 bg-[#e29d3a]" />
			<div className="grid h-full grid-cols-5">
				<div className="col-span-2 bg-[#a33029]" />
				<div className="bg-[#e29d3a]" />
				<div className="col-span-2 bg-[#a33029]" />
			</div>
		</div>
	);

	return (
		<div className="relative flex h-96 w-full items-center justify-center">
			{/* Main Box - positioned at center, z-index 1 */}
			<div
				className="absolute"
				style={{ transform: "translateY(20px)", zIndex: 1 }}
			>
				<CSSBox
					ref={mainBoxRef}
					width={200}
					height={160}
					depth={200}
					perspective={800}
					draggable={false}
					showBackface={false}
					stiffness={100}
					damping={30}
					initialRotation={{ x: 0, y: 45 }}
					faces={{
						front: <MainBoxSide />,
						back: <MainBoxSide />,
						left: <MainBoxSide />,
						right: <MainBoxSide />,
						top: <MainBoxTop />,
						bottom: <MainBoxBottom />,
					}}
				/>
			</div>

			{/* Lid - positioned directly on top of main box, z-index 2 for proper stacking */}
			<div
				className="absolute"
				style={{
					transform: "translateY(-80px)",
					transformOrigin: "center bottom",
					zIndex: 2,
				}}
			>
				<CSSBox
					ref={lidRef}
					width={220}
					height={40}
					depth={220}
					perspective={800}
					draggable={false}
					showBackface={false}
					stiffness={100}
					damping={30}
					initialRotation={{ x: 0, y: 45 }}
					faces={{
						front: <LidSide />,
						back: <LidSide />,
						left: <LidSide />,
						right: <LidSide />,
						top: <LidTop />,
						bottom: <LidBottom />,
					}}
				/>
			</div>
		</div>
	);
}
