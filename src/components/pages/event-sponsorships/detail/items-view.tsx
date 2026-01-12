"use client";

import { Plus, Package, CheckCircle2, Circle, Pencil } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";
import { useEventSponsorshipItems, useDeleteEventSponsorshipItem } from "@/hooks/use-event-sponsorships";
import { useDialog } from "@/hooks/use-dialog";
import CreateEventSponsorshipItemForm from "../forms/create-event-sponsorship-item-form";
import EditEventSponsorshipItemForm from "../forms/edit-event-sponsorship-item-form";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
import { toast } from "sonner";

interface ItemsViewProps {
  sponsorship: EventSponsorship;
}

export default function ItemsView({ sponsorship }: ItemsViewProps) {
  const { data: items = [], isLoading } = useEventSponsorshipItems(sponsorship.id.toString());
  const { openDialog, closeDialog } = useDialog();
  const deleteMutation = useDeleteEventSponsorshipItem();

  const handleAddItem = () => {
    openDialog({
      component: CreateEventSponsorshipItemForm,
      props: {
        sponsorshipId: sponsorship.id.toString(),
        currency: sponsorship.currency,
        onClose: closeDialog,
      },
      config: {
        title: "Add In-Kind Item",
        description: "Record a new in-kind contribution",
        size: "lg",
        showCloseButton: true,
      },
    });
  };

  const handleDeleteItem = (item: any) => {
    openDialog({
      component: DeleteConfirmationDialog,
      props: {
        title: "Delete Item",
        description: `Are you sure you want to permanently delete the item "${item.title}"?`,
        isPending: deleteMutation.isPending,
        onClose: closeDialog,
        onConfirm: () => {
          deleteMutation.mutate(
            { sponsorshipId: sponsorship.id.toString(), id: item.id.toString() },
            {
              onSuccess: () => {
                toast.success("Item deleted successfully");
                closeDialog();
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to delete item");
                closeDialog();
              },
            }
          );
        },
      },
      config: { showCloseButton: false },
    });
  };

  const handleEditItem = (item: any) => {
    openDialog({
        component: EditEventSponsorshipItemForm,
        props: {
            sponsorshipId: sponsorship.id.toString(),
            item,
            currency: sponsorship.currency,
            onClose: closeDialog,
            onDelete: () => handleDeleteItem(item),
        },
        config: {
            title: "Edit Item",
            description: "Update in-kind item details",
            size: "lg",
            showCloseButton: true,
        },
    });
  };

  if (isLoading) {
      return <div className="p-4 text-center text-sm text-muted-foreground">Loading items...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" />
            In-Kind Items
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleAddItem}>
            <Plus className="size-4 mr-2" />
            Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {!items.length ? (
            <div className="text-sm text-muted-foreground text-center py-4">No items recorded.</div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Title</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Estimated Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="group">
                            <TableCell className="font-medium">
                                <div>{item.title}</div>
                                {item.notes && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</div>}
                            </TableCell>
                            <TableCell>{item.quantity || "-"}</TableCell>
                            <TableCell>
                                {parseFloat(item.total_value || "0") > 0 ? (
                                    `${sponsorship.currency} ${parseFloat(item.total_value || "0").toLocaleString()}`
                                ) : "-"}
                            </TableCell>
                            <TableCell>
                                {item.received ? (
                                    <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                                        <CheckCircle2 className="size-3" />
                                        Received
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <Circle className="size-3" />
                                        Pending
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleEditItem(item)}
                                >
                                    <Pencil className="size-3.5 text-muted-foreground" />
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
