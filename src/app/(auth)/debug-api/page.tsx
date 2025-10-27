"use client";

import { useAuth } from "@/hooks/use-auth";
export default function DebugApiPage() {
	const { user } = useAuth();

	return (
		<div className="flex flex-col gap-4">
			<h1 className="font-bold text-2xl">Debug API - User</h1>
			<pre className="text-gray-500 text-sm">
				{JSON.stringify({ user }, null, 2)}
			</pre>
		</div>
	);
}
