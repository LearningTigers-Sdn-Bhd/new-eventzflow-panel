"use client";

import { Upload, FileText, File, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDialog } from "@/hooks/use-dialog";
import { useEventSponsorshipAttachments, useDeleteEventSponsorshipAttachment } from "@/hooks/use-event-sponsorships";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import CreateEventSponsorshipAttachmentForm from "../forms/create-event-sponsorship-attachment-form";
import { API_BASE_URL } from "@/utils/rest-api";
import { toast } from "sonner";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";

interface AttachmentsViewProps {
  sponsorship: EventSponsorship;
}

export default function AttachmentsView({ sponsorship }: AttachmentsViewProps) {
  const { openDialog, closeDialog } = useDialog();
  const { data: attachments, isLoading } = useEventSponsorshipAttachments(sponsorship.id.toString());
  const deleteMutation = useDeleteEventSponsorshipAttachment();

  const handleUpload = () => {
    openDialog({
      component: CreateEventSponsorshipAttachmentForm,
      props: {
        sponsorshipId: sponsorship.id.toString(),
        onClose: closeDialog,
      },
      config: {
        title: "Upload Attachments",
        description: "Upload proof of payment, contracts, or other documents",
        size: "lg",
        showCloseButton: true,
      },
    });
  };

  const handleDelete = (id: string, fileName: string) => {
    openDialog({
      component: DeleteConfirmationDialog,
      props: {
        title: "Delete Attachment",
        description: `Are you sure you want to permanently delete the attachment "${fileName}"?`,
        isPending: deleteMutation.isPending,
        onClose: closeDialog,
        onConfirm: () => {
          deleteMutation.mutate(
            { sponsorshipId: sponsorship.id.toString(), id },
            {
              onSuccess: () => {
                toast.success("Attachment deleted successfully");
                closeDialog();
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to delete attachment");
                closeDialog();
              },
            }
          );
        },
      },
      config: { showCloseButton: false },
    });
  };

  const getDownloadUrl = (path?: string) => {
      if (!path) return "#";
      if (path.startsWith("http")) return path;
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      return `${API_BASE_URL}/${cleanPath}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Attachments
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleUpload}>
            <Upload className="size-4 mr-2" />
            Upload File
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading attachments...</div>
        ) : !attachments?.length ? (
            <div className="text-sm text-muted-foreground text-center py-4">No attachments uploaded.</div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attachments.map((attachment) => (
                        <TableRow key={attachment.id} className="group">
                            <TableCell className="font-medium">
                                <a 
                                    href={getDownloadUrl(attachment.file_url)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:underline text-primary"
                                >
                                    <File className="size-4 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-[200px]">{attachment.file_name}</span>
                                    <ExternalLink className="size-3 opacity-50" />
                                </a>
                            </TableCell>
                            <TableCell className="capitalize">{attachment.attachment_type.replace("_", " ")}</TableCell>
                            <TableCell>{format(new Date(attachment.created_at), "dd MMM yyyy")}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(attachment.id.toString(), attachment.file_name)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
