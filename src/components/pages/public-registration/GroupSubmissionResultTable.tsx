import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupSubmissionSummary } from "@/lib/api/public-registration";

export function GroupSubmissionResultTable({
  summary,
  onRetryFailed,
  retrying,
}: {
  summary: GroupSubmissionSummary;
  onRetryFailed: () => void;
  retrying: boolean;
}) {
  const hasFailed = summary.failedCount > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
        <span>
          Success: <strong>{summary.successCount}</strong>
        </span>
        <span>
          Failed: <strong>{summary.failedCount}</strong>
        </span>
      </div>

      {hasFailed ? (
        <Button type="button" variant="outline" onClick={onRetryFailed} disabled={retrying}>
          {retrying ? "Retrying..." : "Retry failed only"}
        </Button>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.rows.map((row, index) => (
              <TableRow key={`${row.attendee_name}-${index}`}>
                <TableCell>{row.attendee_name}</TableCell>
                <TableCell>{row.ok ? "Success" : "Failed"}</TableCell>
                <TableCell>{row.data?.public_id ?? "-"}</TableCell>
                <TableCell>{row.error ?? "Created successfully"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
