import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubmissionStatusPanel({
	attendeeName,
	publicId,
	message,
}: {
	attendeeName: string;
	publicId: string;
	message: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Submission status</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<p>
					<strong>Attendee:</strong> {attendeeName}
				</p>
				<p>
					<strong>Ticket ID:</strong> {publicId}
				</p>
				<p className="text-muted-foreground">{message}</p>
			</CardContent>
		</Card>
	);
}
