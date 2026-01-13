import type { Resource } from "@/lib/api/resource/response";

interface ShowResponseDebugProps {
	resource: Resource;
}

export default function ShowResponseDebug({ resource }: ShowResponseDebugProps) {
	return (
		<div className="container mx-auto max-w-7xl px-4 py-16">
			<div className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
				<div className="mb-6 flex items-center gap-2 border-slate-800 border-b pb-4">
					<div className="h-3 w-3 rounded-full bg-red-500" />
					<div className="h-3 w-3 rounded-full bg-yellow-500" />
					<div className="h-3 w-3 rounded-full bg-green-500" />
					<span className="ml-4 font-mono text-slate-400 text-xs uppercase tracking-widest">
						Resource Data Response
					</span>
				</div>
				<pre className="font-mono text-blue-300 text-sm leading-relaxed">
					{JSON.stringify(resource, null, 2)}
				</pre>
			</div>
		</div>
	);
}
