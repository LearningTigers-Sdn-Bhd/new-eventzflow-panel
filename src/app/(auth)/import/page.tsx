"use client";

import { useState } from "react";
import { default as ImportTicketForm } from "@/components/pages/import/import-ticket";
import type { ImportTicketsResponse } from "@/lib/api/ticket";

export default function ImportPage() {
	const [dryResult, setDryResult] = useState<ImportTicketsResponse | null>(
		null,
	);
	const [liveResult, setLiveResult] = useState<ImportTicketsResponse | null>(
		null,
	);

	return (
		<div className="container mx-auto max-w-3xl p-6 space-y-6">
			<h1 className="text-xl font-semibold">Ticket Import</h1>

			{/* Dry-run section */}
			<div className="space-y-2">
				<h2 className="text-sm font-medium">Dry-run</h2>
				<ImportTicketForm dryRun onResult={setDryResult} />
				<div className="rounded-md border p-4">
					<h3 className="mb-2 text-sm font-medium text-muted-foreground">
						Result (dry-run)
					</h3>
					<pre className="whitespace-pre-wrap text-xs">
						{JSON.stringify(
							dryResult ?? {
								created: 0,
								updated: 0,
								skipped: 0,
								duplicates_in_file: 0,
								errors: [],
							},
							null,
							2,
						)}
					</pre>
				</div>
			</div>

			{/* Live import section */}
			<div className="space-y-2">
				<h2 className="text-sm font-medium">Import (apply changes)</h2>
				<ImportTicketForm onResult={setLiveResult} />
				<div className="rounded-md border p-4">
					<h3 className="mb-2 text-sm font-medium text-muted-foreground">
						Result (live)
					</h3>
					<pre className="whitespace-pre-wrap text-xs">
						{JSON.stringify(
							liveResult ?? {
								created: 0,
								updated: 0,
								skipped: 0,
								duplicates_in_file: 0,
								errors: [],
							},
							null,
							2,
						)}
					</pre>
				</div>
			</div>
		</div>
	);
}
