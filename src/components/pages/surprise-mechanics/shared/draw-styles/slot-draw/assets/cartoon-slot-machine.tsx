import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CartoonSlotMachineProps {
	children: ReactNode;
	isDrawing: boolean;
	isCelebrating?: boolean;
	onSpin?: () => void;
}

export const CartoonSlotMachine = ({ 
	children, 
	isDrawing, 
	isCelebrating,
	onSpin 
}: CartoonSlotMachineProps) => {
	const canSpin = Boolean(onSpin) && !isDrawing;
	return (
		<div className="mx-auto flex w-full max-w-xl flex-row">
			{/* The Machine Case */}
			<div className="flex h-fit min-w-0 flex-1 flex-col">
				{/* The Machine Case Bell */}
				<div className="flex flex-col">
					<div className="mx-auto h-2 w-10 border-[#530a1f] border-b-8" />
					<div className="mx-auto h-2 w-14 border-[#530a1f] border-x-8">
						<div className="h-full w-full border-[#fcb50b] border-x-8 bg-[#f9f3bd]" />
					</div>
					<div className="mx-auto flex h-12 w-20 flex-col border-[#530a1f] border-x-8 border-t-8">
						<div className="h-6 w-full border-[#530a1f] border-b-8 bg-black" />
						<div className="flex h-full w-full flex-col">
							<div className="h-full w-full border-[#fcb50b] border-x-8">
								<div className="h-full w-full border-[#ffec2e] border-x-8 bg-[#f9f3bd]" />
							</div>
						</div>
					</div>
				</div>
				{/* The Machine Case Top */}
				<div className="mx-2 flex h-36 flex-row border-[#530a1f] border-x-8 border-t-8">
					<div className="w-24 border-[#530a1f] border-r-8 bg-[#d3181f]">
						<div className="flex h-full w-full flex-col border-[#fe868e] border-t-8">
							<div className="w-1/2 border-[#fe868e] border-t-8" />
							<div className="w-1/3 border-[#fe868e] border-t-8" />
							<div className="w-1/6 border-[#fe868e] border-t-8" />
						</div>
					</div>
					<div className="min-w-0 flex-1 border-8 border-[#e9862d] bg-[#ffae07]">
						<div className="flex h-full flex-col items-center justify-center overflow-hidden border-2 border-[#e9862d] bg-[#ffae07]">
							<motion.span
								key={isCelebrating ? "winner" : isDrawing ? "spinning" : "ready"}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ 
									scale: isCelebrating ? [1, 1.1, 1] : 1,
									opacity: 1,
									textShadow: isCelebrating 
										? [
											"0 0 10px #ff0000, 0 0 20px #ff0000",
											"0 0 20px #ffff00, 0 0 30px #ffff00",
											"0 0 10px #ff0000, 0 0 20px #ff0000"
										]
										: "0 0 0px transparent"
								}}
								transition={{ 
									duration: isCelebrating ? 0.5 : 0.3,
									repeat: isCelebrating ? Number.POSITIVE_INFINITY : 0,
									repeatType: "reverse"
								}}
								className={cn(
									"font-black font-mono text-5xl uppercase tracking-wider",
									isCelebrating && "text-red-700",
									isDrawing && "animate-pulse text-orange-600",
									!isDrawing && !isCelebrating && "text-black"
								)}
							>
								{isCelebrating ? "WINNER" : isDrawing ? "SPINNING" : "READY?"}
							</motion.span>
						</div>
					</div>
					<div className="w-24 border-[#530a1f] border-l-8 bg-[#d3181f]">
						<div className="flex h-full w-full flex-row gap-x-4 border-[#fe868e] border-t-8">
							<div className="w-full border-[#fe868e] border-t-8" />
							<div className="w-1/3 border-[#fe868e] border-t-8" />
							<div className="w-1/6 border-[#fe868e] border-t-8" />
						</div>
					</div>
				</div>
				{/* The Machine Case Center */}
				<div className="flex w-full min-w-0 flex-row border-[#530a1f] border-x-8 border-t-8 bg-[#d3181f]">
					<div className="w-5 border-[#771f07] border-r-8 bg-[#e98628]" />
					<div className="relative min-w-0 flex-1 border-[#fe868e] border-t-8 p-6">
						<div className="absolute inset-0 grid grid-cols-4 gap-x-4">
							<div className="flex w-1/2 flex-col border-[#fe868e] border-t-8">
								<div className="w-1/2 border-[#fe868e] border-t-8" />
								<div className="w-1/3 border-[#fe868e] border-t-8" />
								<div className="w-1/6 border-[#fe868e] border-t-8" />
							</div>
							<div className="w-1/3 border-[#fe868e] border-t-8" />
							<div className="w-1/6 border-[#fe868e] border-t-8" />
						</div>
						<div className="z-20 w-full overflow-hidden border-8 border-[#2e323d]">
							{/* Slot for reel component */}
							{children}
						</div>
					</div>
					<div className="w-5 border-[#771f07] border-l-8 bg-[#e98628]" />
				</div>
				{/* The Machine Case Bottom */}
				<div className="-mx-8 relative flex h-28 flex-row items-center justify-center border-8 border-[#530a1f] bg-[#d5191f] px-8 py-6">
					<div className="absolute inset-0 z-10 border-[#7d0e1e] border-b-8">
						<div className="absolute inset-0 border-[#7d0e1e] border-b-2" />
					</div>
					<div className="absolute inset-0 grid grid-cols-4 gap-x-4">
						<div className="flex w-1/4 flex-col border-[#fe868e] border-t-8">
							<div className="w-1/2 border-[#fe868e] border-t-8" />
							<div className="w-1/3 border-[#fe868e] border-t-8" />
							<div className="w-1/6 border-[#fe868e] border-t-8" />
						</div>
						<div className="flex w-full flex-row gap-x-6 px-8">
							<div className="w-1/2 border-[#fe868e] border-t-8" />
							<div className="w-1/6 border-[#fe868e] border-t-8" />
						</div>
					</div>
					<div className="z-20 flex flex-1 flex-row items-center justify-between gap-3 border-8 border-[#530b26] bg-[#7b0f24] px-6 py-4">
						{/* Dashed Line */}
						<div className="flex-1 border-[#e9862d] border-y-8 border-dashed" />
						
						{/* Info Text + Spin Button */}
						<div className="flex items-center gap-3">
							<p className="whitespace-nowrap font-bold text-xs text-yellow-200">
								{isCelebrating
									? "🎉 Winner!"
									: isDrawing
										? "Spinning..."
										: "Press SPIN"}
							</p>
							<motion.button
							type="button"
							onClick={canSpin ? onSpin : undefined}
							disabled={!canSpin}
							whileHover={canSpin ? { scale: 1.05 } : undefined}
							whileTap={canSpin ? { scale: 0.95 } : undefined}
							className={cn(
								"relative overflow-hidden whitespace-nowrap rounded-lg border-4 px-6 py-2 font-black text-sm uppercase tracking-wider transition-all",
								canSpin
									? "border-yellow-600 bg-gradient-to-b from-yellow-400 to-yellow-600 text-red-900 shadow-[0_4px_0_0_#854d0e] hover:from-yellow-300 hover:to-yellow-500 active:translate-y-[2px] active:shadow-[0_2px_0_0_#854d0e]"
									: "cursor-not-allowed border-gray-600 bg-gray-700 text-gray-500"
							)}
							aria-disabled={!canSpin}
							aria-busy={isDrawing}
						>
							{/* Button Shine Effect */}
							{canSpin && (
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
							)}
							<span className="relative">
								{isDrawing ? "..." : "SPIN"}
							</span>
						</motion.button>
						</div>
					</div>
				</div>
			</div>
			{/* The Machine Lever Side */}
			<div className="flex h-full flex-col">
				<div className="h-16 w-full" />
				<div className="h-36 w-full" />
				<div className="flex w-[100px] flex-1 flex-col items-center justify-start">
					<div className="flex h-14 w-full flex-row items-center justify-start">
						<div className="h-full w-[30px]" />
						<div className="-mb-10 flex h-full w-full flex-1 flex-col">
							<div className="w-full px-2">
								<div className="h-full w-full border-[#4f0f23] border-t-8 bg-[#d1181d]" />
							</div>
							<div className="flex h-full w-full flex-1 flex-col border-[#4f0f23] border-x-8 bg-[#d1181d]">
								<div className="flex h-full w-full flex-row items-start justify-start">
									<div className="h-1/2 w-[10px] bg-[#fc8188]" />
								</div>
								<div className="flex h-full w-full flex-row items-end justify-start">
									<div className="h-1/4 w-[10px] bg-[#7a0b19]" />
									<div className="h-1/4 w-[10px] bg-[#7a0b19]" />
									<div className="h-1/2 w-[10px] bg-[#7a0b19]" />
									<div className="h-full w-[10px] bg-[#7a0b19]" />
								</div>
							</div>
							<div className="w-full px-2">
								<div className="h-full w-full border-[#4f0f23] border-b-8 bg-[#d1181d]" />
							</div>
						</div>
						<div className="h-full w-[15px]" />
					</div>
					<div className="flex h-25 w-full flex-row items-center justify-start">
						<div className="h-full w-[45px]" />
						<div className="-mb-10 h-full w-full flex-1 border-[#2d3038] border-x-8 bg-[#464749]" />
						<div className="h-full w-[20px]" />
						<div className="h-full w-[10px]" />
					</div>
					<div className="z-20 flex w-full flex-row items-center justify-start">
						<div className="flex h-[100px] w-[40px] flex-col border-[#2d3038] border-y-8 border-r-8 bg-[#acadc0]">
							<div className="flex h-full w-full flex-row items-start justify-start">
								<div className="h-1/2 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/2 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/4 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/4 w-[10px] bg-[#b8c4d3]" />
							</div>
							<div className="flex h-full w-full flex-row items-end justify-start">
								<div className="h-1/4 w-[10px] bg-[#595b67]" />
								<div className="h-1/4 w-[10px] bg-[#595b67]" />
								<div className="h-1/2 w-[10px] bg-[#595b67]" />
								<div className="h-3/4 w-[10px] bg-[#595b67]" />
							</div>
						</div>
						<div className="flex h-[90px] w-full flex-1 flex-col border-[#2d3038] border-y-8 bg-[#acadc0]">
							<div className="flex h-1/2 w-full flex-row items-start justify-start">
								<div className="h-1/2 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/2 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/4 w-[10px] bg-[#b8c4d3]" />
								<div className="h-1/4 w-[10px] bg-[#b8c4d3]" />
							</div>
							<div className="flex h-1/2 w-full flex-row items-end justify-start">
								<div className="h-1/4 w-[10px] bg-[#595b67]" />
								<div className="h-1/4 w-[10px] bg-[#595b67]" />
								<div className="h-1/2 w-[10px] bg-[#595b67]" />
								<div className="h-3/4 w-[10px] bg-[#595b67]" />
							</div>
						</div>
						<div className="h-[80px] w-[10px] border-[#2d3038] border-y-8 bg-[#acadc0]">
							<div className="flex h-full w-full flex-col justify-end border-[#2d3038] border-y-4">
								<div className="h-1/2 w-full bg-[#595b67]" />
							</div>
						</div>
						<div className="h-[65px] w-[10px] border-[#2d3038] border-y-8">
							<div className="h-full w-[10px] border-[#2d3038] border-y-4 bg-[#2d3038]" />
						</div>
					</div>
				</div>
				<div className="h-28 w-full" />
			</div>
		</div>
	);
};
