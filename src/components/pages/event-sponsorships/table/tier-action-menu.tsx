"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { useDeleteEventSponsorshipTier } from "@/hooks/use-event-sponsorships";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import EditEventSponsorshipTierForm from "../forms/edit-event-sponsorship-tier-form";

interface TierActionMenuProps {
  tier: EventSponsorshipTier;
}

export function TierActionMenu({ tier }: TierActionMenuProps) {
  const params = useParams();
  const eventId = params.event_id as string;
  const { openDialog, closeDialog } = useDialog();
  const deleteMutation = useDeleteEventSponsorshipTier();

  const handleEdit = () => {
    openDialog({
      component: EditEventSponsorshipTierForm,
      props: {
        eventId,
        tier,
        onClose: closeDialog,
      },
      config: {
        title: "Edit Tier",
        description: "Update sponsorship tier details",
        size: "2xl",
        showCloseButton: true,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this tier? This action cannot be undone.")) {
      deleteMutation.mutate(
        { eventId, id: tier.id.toString() },
        {
          onSuccess: () => toast.success("Tier deleted successfully"),
          onError: () => toast.error("Failed to delete tier"),
        }
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
