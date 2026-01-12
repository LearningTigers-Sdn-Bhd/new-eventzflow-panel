"use client";

import { Upload, X, File as FileIcon } from "lucide-react";
import { useId, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEventSponsorshipAttachment } from "@/hooks/use-event-sponsorships";

interface CreateEventSponsorshipAttachmentFormProps {
  sponsorshipId: string;
  onClose: () => void;
}

export default function CreateEventSponsorshipAttachmentForm({ sponsorshipId, onClose }: CreateEventSponsorshipAttachmentFormProps) {
  const typeId = useId();
  const fileId = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] = useState("other_doc");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateEventSponsorshipAttachment();

  const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let hasError = false;

      newFiles.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          hasError = true;
          toast.error(`File "${file.name}" exceeds the 40MB limit.`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
      
      // Reset input so selecting the same file again triggers change if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("event_sponsorship_attachment[file]", file);
      formData.append("event_sponsorship_attachment[attachment_type]", attachmentType);
      
      try {
        await createMutation.mutateAsync({
          sponsorshipId,
          data: formData,
        });
        successCount++;
      } catch (error) {
        console.error("Upload failed for", file.name, error);
        failCount++;
      }
    }

    setIsUploading(false);

    if (failCount === 0) {
      toast.success(`Uploaded ${successCount} file(s) successfully!`);
      onClose();
    } else {
      toast.error(`Uploaded ${successCount} files, failed ${failCount}.`);
      if (successCount > 0) {
          onClose(); 
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldSeparator />
          <FieldGroup>
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Upload className="size-5 text-primary" />
                <h3 className="font-semibold text-lg">Upload Attachments</h3>
              </div>

              <Field orientation="vertical">
                <FieldLabel htmlFor={typeId}>Attachment Type</FieldLabel>
                <Select
                  value={attachmentType}
                  onValueChange={setAttachmentType}
                  disabled={isUploading}
                >
                  <SelectTrigger id={typeId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other_doc">Other Document</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="logo_pack">Logo Pack</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field orientation="vertical">
                <FieldLabel htmlFor={fileId}>Files</FieldLabel>
                <div 
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to select files</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports Images, PDF, Docs (Max 40MB per file)
                    </p>
                    <Input
                        id={fileId}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isUploading}
                    />
                </div>
              </Field>

              {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files ({files.length})</p>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    disabled={isUploading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>

            <FieldSeparator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || files.length === 0}>
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
