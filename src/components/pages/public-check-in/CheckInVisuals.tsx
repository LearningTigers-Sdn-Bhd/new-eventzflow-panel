"use client";

export const NoiseTexture = () => (
	<div
		className="pointer-events-none fixed inset-0 z-50 opacity-[0.05] mix-blend-overlay"
		style={{
			backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
		}}
	/>
);

export const GridBackground = () => (
	<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		{/* Secondary Large Grid */}
		<div
			className="absolute inset-0 opacity-[0.05]"
			style={{
				backgroundImage:
					"linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
				backgroundSize: "128px 128px",
			}}
		/>

		{/* Primary Blueprint Dotted Grid */}
		<div
			className="absolute inset-0 opacity-[0.15]"
			style={{
				backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
				backgroundSize: "32px 32px",
			}}
		/>

		{/* Technical Text Fragments */}
		<div className="absolute top-12 left-12 font-mono text-[7px] text-neutral-300 uppercase tracking-[0.4em] opacity-40">
			Node_Station_01 // Access_Point
		</div>
		<div className="absolute bottom-12 left-12 font-mono text-[7px] text-neutral-300 uppercase tracking-[0.4em] opacity-40">
			Status: <span className="text-brand-green">Encryption_Active</span>
		</div>
		<div className="absolute top-1/2 right-12 -translate-y-1/2 rotate-90 font-mono text-[7px] text-neutral-300 uppercase tracking-[0.4em] opacity-40">
			Stream_Sync_Primary
		</div>

		{/* Technical Crosshairs */}
		<div className="absolute top-1/2 left-0 h-px w-full bg-neutral-200/40" />
		<div className="absolute top-0 left-1/2 h-full w-px bg-neutral-200/40" />

		{/* Animated Scan Line */}
		<div
			className="absolute left-0 h-[2px] w-full bg-brand-green/10 blur-sm"
			style={{
				animation: "scan 8s linear infinite",
				top: "-10%",
			}}
		/>
		<style jsx global>{`
			@keyframes scan {
				0% { top: -10%; opacity: 0; }
				5% { opacity: 1; }
				95% { opacity: 1; }
				100% { top: 110%; opacity: 0; }
			}
		`}</style>
	</div>
);

export const InfoRow = ({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon?: React.ElementType;
}) => (
	<div className="group relative flex flex-col transition-all duration-300 hover:pl-2">
		<div className="mb-1.5 flex items-center gap-3">
			<div className="flex h-6 w-6 items-center justify-center rounded-none bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-black group-hover:text-white">
				{Icon && <Icon className="h-3.5 w-3.5" />}
			</div>
			<span className="font-bold font-mono text-[11px] text-neutral-500 uppercase tracking-[0.2em] group-hover:text-black">
				{label}
			</span>
		</div>
		<div className="font-bold text-lg text-neutral-900 tracking-tight transition-colors group-hover:text-black lg:text-xl">
			{value}
		</div>
	</div>
);

export const StationRow = ({
	station,
	onClick,
	icon: Icon,
}: {
	station: string;
	onClick: () => void;
	icon?: React.ElementType;
}) => (
	<button
		type="button"
		onClick={onClick}
		className="group relative flex w-full cursor-pointer flex-col text-left transition-all duration-300 hover:pl-2"
	>
		<div className="mb-1.5 flex items-center gap-3">
			<div className="flex h-6 w-6 items-center justify-center rounded-none bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-black group-hover:text-white">
				{Icon && <Icon className="h-3.5 w-3.5" />}
			</div>
			<span className="font-bold font-mono text-[11px] text-neutral-500 uppercase tracking-[0.2em] group-hover:text-black">
				Station
			</span>
			<span className="font-mono text-[10px] text-neutral-400 tracking-wide">
				(click to change)
			</span>
		</div>
		<div className="font-bold text-lg text-neutral-900 tracking-tight transition-colors group-hover:text-black lg:text-xl">
			{station}
		</div>
	</button>
);
