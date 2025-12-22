// new-eventzflow-panel/src/components/pages/business-matching/remove-host-confirm-dialog.tsx
"use client";

import React from 'react';
import { useDialog } from "@/hooks/use-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRemoveHost } from '@/hooks/use-business-matching';
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { BusinessHost } from '@/lib/api/business-matching';
import HostDetailsDialog from './host-details-dialog';

interface RemoveHostConfirmDialogProps {
  host: BusinessHost;
  bmEventId: string;
  eventId: string;
}

const RemoveHostConfirmDialog: React.FC<RemoveHostConfirmDialogProps> = ({ 
  host, 
  bmEventId, 
  eventId, 
}) => {
  const { closeDialog, openDialog } = useDialog();
  const { mutate: removeHost, isPending: isRemoving } = useRemoveHost(eventId);

  const handleCancel = () => {
    // Go back to details dialog
    openDialog({
        component: HostDetailsDialog,
        props: { 
            host, 
            bmEventId, 
            eventId 
        },
        config: {
            title: "Host Details",
            size: "md",
        },
    });
  };

  const handleConfirm = () => {
    removeHost(bmEventId, {
      onSuccess: () => {
        toast.success("Host removed successfully");
        closeDialog();
      },
      onError: (error) => {
        toast.error("Failed to remove host", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground text-center">
        Are you absolutely sure you want to remove <span className="font-medium text-foreground">{host.full_name}</span> as the host for this business matching session? This action cannot be undone.
      </p>
      <div className="flex flex-col gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={handleConfirm} 
          disabled={isRemoving}
          className="w-full"
        >
          {isRemoving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Yes, Remove Host
        </Button>
        <Button variant="destructive" onClick={handleCancel} disabled={isRemoving} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel and Go Back
        </Button>
      </div>
    </div>
  );
};

export default RemoveHostConfirmDialog;