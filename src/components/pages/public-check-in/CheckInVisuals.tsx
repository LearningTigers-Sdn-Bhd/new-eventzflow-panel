"use client";

export const NoiseTexture = () => (
	<div
		className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
		style={{
			backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
		}}
	/>
);

export const GridBackground = () => (
	<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		<div className="absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 bg-neutral-200/50 lg:block" />
		<div className="absolute top-24 left-0 h-px w-full bg-neutral-200/50" />
		<div className="absolute bottom-24 left-0 h-px w-full bg-neutral-200/50" />
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
	<div className="flex flex-col border-neutral-200 border-t py-6 last:border-b">
		<div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
			{Icon && <Icon className="h-3 w-3" />}
			{label}
		</div>
		<div className="font-medium text-lg text-neutral-900">{value}</div>
	</div>
);
