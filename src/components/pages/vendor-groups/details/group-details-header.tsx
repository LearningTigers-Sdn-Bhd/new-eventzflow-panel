"use client";

import type { GroupWithMembers } from "@/lib/api/group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2 } from "lucide-react";
import { useGroupAffiliates } from "@/hooks/use-group-affiliates";

interface GroupDetailsHeaderProps {
	group: GroupWithMembers;
}

export function GroupDetailsHeader({ group }: GroupDetailsHeaderProps) {
	const { data: affiliates } = useGroupAffiliates(group.id);
	const vendorCount = affiliates?.length || 0;

	return (
		<Card className="rounded-none border-dashed bg-card">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<CardTitle className="font-bold text-2xl">{group.name}</CardTitle>
						<CardDescription className="text-sm">
							{group.description || "No description provided"}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					{/* Created Date Stat */}
					<div className="rounded-none border border-dashed bg-muted/40 p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-none border border-dashed bg-background">
								<Calendar className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="space-y-1">
								<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Created</p>
								<p className="font-bold text-sm">{new Date(group.created_at).toLocaleDateString()}</p>
							</div>
						</div>
					</div>

					{/* Vendors Count Stat */}
					<div className="rounded-none border border-dashed bg-muted/40 p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-none border border-dashed bg-background">
								<Building2 className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="space-y-1">
								<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Vendors</p>
								<p className="font-bold text-2xl">{vendorCount}</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
