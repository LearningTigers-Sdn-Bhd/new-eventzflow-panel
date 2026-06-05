import type React from "react";
import { useRef } from "react";

interface PhoneProps {
	children: React.ReactNode;
}

const Phone: React.FC<PhoneProps> = ({ children }) => {
	return (
		<div className="relative z-10 mx-auto h-[500px] w-[260px] rounded-[2.5rem] bg-black p-2.5 shadow-2xl ring-1 ring-white/10 dark:ring-white/20">
			{/* Screen */}
			<div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-[#0a1014] ring-1 ring-white/5">
				{/* Status Bar */}
				<div className="relative z-10 flex h-9 flex-shrink-0 items-center justify-between px-4 pt-1.5 text-white">
					<span className="font-medium text-[10px]">9:41</span>

					{/* Dynamic Island */}
					<div className="absolute top-1.5 left-1/2 h-5 w-24 -translate-x-1/2 transform rounded-full bg-black" />

					{/* Signal Indicators */}
					<div className="flex items-center gap-1">
						<div className="flex items-end space-x-0.5">
							<div className="h-1 w-1 rounded-sm bg-white" />
							<div className="h-1.5 w-1 rounded-sm bg-white" />
							<div className="h-2 w-1 rounded-sm bg-white" />
							<div className="h-2.5 w-1 rounded-sm bg-white" />
						</div>
						<div className="relative ml-1 h-3 w-3.5">
							<svg viewBox="0 0 16 12" className="h-3 w-3.5 fill-white">
								<path
									d="M8 0C3.58 0 0 3.58 0 8h2c0-3.31 2.69-6 6-6s6 2.69 6 6h2c0-4.42-3.58-8-8-8z"
									transform="scale(1, 0.6)"
								/>
								<path
									d="M8 3C5.24 3 3 5.24 3 8h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5z"
									transform="scale(1, 0.7) translate(0, 2)"
								/>
								<circle cx="8" cy="10" r="1.5" />
							</svg>
						</div>
					</div>
				</div>

				{/* Screen Content - Must not overflow */}
				<div className="relative flex flex-1 flex-col overflow-hidden">
					{children}
				</div>

				{/* Home Indicator */}
				<div className="absolute bottom-1.5 left-1/2 h-0.5 w-24 -translate-x-1/2 transform rounded-full bg-white/30" />
			</div>
		</div>
	);
};

export default Phone;
