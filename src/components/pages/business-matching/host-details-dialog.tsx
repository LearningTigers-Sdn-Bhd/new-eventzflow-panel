// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx
import React from 'react';
import { useDialog } from "@/hooks/use-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BusinessHost } from '@/lib/api/business-matching';
import { Trash2, Copy } from "lucide-react";
import { toast } from "sonner"; // Re-add this import
import RemoveHostConfirmDialog from "./remove-host-confirm-dialog"; // Import the new dialog

interface HostDetailsDialogProps {
  host: BusinessHost;
  bmEventId: string;
  eventId: string;
}

const HostDetailsDialog: React.FC<HostDetailsDialogProps> = ({ host, bmEventId, eventId }) => {
  const { closeDialog, openDialog } = useDialog();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(host.email)
      .then(() => toast.success("Email copied to clipboard"))
      .catch(() => toast.error("Failed to copy email"));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-1">
          <Label className="text-muted-foreground">Full Name</Label>
          <div className="font-medium text-lg">{host.full_name}</div>
        </div>
        <div className="grid gap-1">
          <Label className="text-muted-foreground">Email</Label>
          <div className="flex items-center gap-2">
            <div className="font-medium">{host.email}</div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyEmail}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid gap-1">
          <Label className="text-muted-foreground">Phone</Label>
          <a className="font-medium" href={`tel:${host.phone}`}>{host.phone || "N/A"}</a>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
            variant="destructive" 
            onClick={() => {
                openDialog({
                    component: RemoveHostConfirmDialog,
                    props: { 
                        host, 
                        bmEventId, 
                        eventId,
                    },
                });
            }}
        >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Host
        </Button>
      </div>
    </div>
  );
};

export default HostDetailsDialog;
