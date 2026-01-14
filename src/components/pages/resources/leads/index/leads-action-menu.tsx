"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ResourceLead } from "@/lib/api/resource/lead/response";

interface LeadsActionMenuProps {
	lead: ResourceLead;
}

export function LeadsActionMenu({ lead }: LeadsActionMenuProps) {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={() => setShowDetails(true)}
				title="View Lead Details"
			>
				<Eye className="size-4" />
			</Button>

			<Dialog open={showDetails} onOpenChange={setShowDetails}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Lead Details</DialogTitle>
					</DialogHeader>
					<div className="space-y-6">
						{/* Contact Information */}
						<div className="space-y-3">
							<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
								Contact Information
							</h3>
							<div className="grid gap-3">
								<div className="grid grid-cols-[120px_1fr] items-start gap-2">
									<span className="text-muted-foreground text-sm">Name:</span>
									<span className="text-sm">{lead.name}</span>
								</div>
								<div className="grid grid-cols-[120px_1fr] items-start gap-2">
									<span className="text-muted-foreground text-sm">Email:</span>
									<span className="text-sm">{lead.email}</span>
								</div>
								{lead.phone && (
									<div className="grid grid-cols-[120px_1fr] items-start gap-2">
										<span className="text-muted-foreground text-sm">
											Phone:
										</span>
										<span className="text-sm">{lead.phone}</span>
									</div>
								)}
							</div>
						</div>

						{/* Company Information */}
						{(lead.company || lead.jobTitle) && (
							<div className="space-y-3">
								<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
									Company Information
								</h3>
								<div className="grid gap-3">
									{lead.company && (
										<div className="grid grid-cols-[120px_1fr] items-start gap-2">
											<span className="text-muted-foreground text-sm">
												Company:
											</span>
											<span className="text-sm">{lead.company}</span>
										</div>
									)}
									{lead.jobTitle && (
										<div className="grid grid-cols-[120px_1fr] items-start gap-2">
											<span className="text-muted-foreground text-sm">
												Job Title:
											</span>
											<span className="text-sm">{lead.jobTitle}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Location Information */}
						{(lead.country || lead.state) && (
							<div className="space-y-3">
								<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
									Location
								</h3>
								<div className="grid gap-3">
									{lead.country && (
										<div className="grid grid-cols-[120px_1fr] items-start gap-2">
											<span className="text-muted-foreground text-sm">
												Country:
											</span>
											<span className="text-sm">{lead.country}</span>
										</div>
									)}
									{lead.state && (
										<div className="grid grid-cols-[120px_1fr] items-start gap-2">
											<span className="text-muted-foreground text-sm">
												State:
											</span>
											<span className="text-sm">{lead.state}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Resource Information */}
						{lead.resource && (
							<div className="space-y-3">
								<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
									Resource
								</h3>
								<div className="grid gap-3">
									<div className="grid grid-cols-[120px_1fr] items-start gap-2">
										<span className="text-muted-foreground text-sm">
											Title:
										</span>
										<span className="text-sm">{lead.resource.title}</span>
									</div>
									<div className="grid grid-cols-[120px_1fr] items-start gap-2">
										<span className="text-muted-foreground text-sm">
											Slug:
										</span>
										<span className="font-mono text-xs">
											/{lead.resource.slug}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Submission Information */}
						<div className="space-y-3">
							<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
								Submission
							</h3>
							<div className="grid gap-3">
								<div className="grid grid-cols-[120px_1fr] items-start gap-2">
									<span className="text-muted-foreground text-sm">
										Submitted At:
									</span>
									<span className="text-sm">
										{new Date(lead.createdAt).toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
