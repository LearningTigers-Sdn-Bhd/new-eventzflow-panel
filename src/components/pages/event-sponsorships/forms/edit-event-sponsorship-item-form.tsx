import { Package, DollarSign, Trash2 } from "lucide-react";
import { useId, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateEventSponsorshipItem, useDeleteEventSponsorshipItem } from "@/hooks/use-event-sponsorships";
import type { EventSponsorshipItem } from "@/lib/api/sponsorship/response";
import { useDialog } from "@/hooks/use-dialog";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";

interface EditEventSponsorshipItemFormProps {
  sponsorshipId: string;
  item: EventSponsorshipItem;
  currency: string;
  onClose: () => void;
}

export default function EditEventSponsorshipItemForm({ sponsorshipId, item, currency, onClose }: EditEventSponsorshipItemFormProps) {
  const { openDialog, closeDialog: closeDeleteDialog } = useDialog();
  const titleId = useId();
  const quantityId = useId();
  const unitValueId = useId();
  const totalValueId = useId();
  const notesId = useId();
  const receivedId = useId();

  const [formData, setFormData] = useState({
    title: item.title,
    quantity: item.quantity?.toString() || "1",
    unit_value: item.unit_value || "0",
    total_value: item.total_value || "0",
    notes: item.notes || "",
    received: item.received || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateMutation = useUpdateEventSponsorshipItem();
  const deleteMutation = useDeleteEventSponsorshipItem();

  const calculateTotal = (qty: string, unit: string) => {
    const q = parseFloat(qty) || 0;
    const u = parseFloat(unit) || 0;
    return (q * u).toFixed(2);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      if (field === "quantity" || field === "unit_value") {
        next.total_value = calculateTotal(next.quantity, next.unit_value);
      }
      
      return next;
    });
    
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = "Item title is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        sponsorshipId,
        id: item.id.toString(),
        data: {
          title: formData.title,
          quantity: parseInt(formData.quantity) || 1,
          unit_value: formData.unit_value || "0",
          total_value: formData.total_value || "0",
          notes: formData.notes,
          received: formData.received,
        },
      });
      
      toast.success("Item updated successfully!");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update item";
      toast.error(message);
    }
  };

  const handleDelete = () => {
    openDialog({
      component: DeleteConfirmationDialog,
      props: {
        title: "Delete Item",
        description: `Are you sure you want to permanently delete the item "${item.title}"?`,
        // We pass a function that returns a promise so the dialog can manage loading state
        onConfirm: async () => {
          try {
            await deleteMutation.mutateAsync({ 
              sponsorshipId, 
              id: item.id.toString() 
            });
            toast.success("Item deleted successfully");
            closeDeleteDialog();
            onClose(); // Close the parent edit modal
          } catch (error: any) {
            toast.error(error.message || "Failed to delete item");
            // We don't close the dialog on error so user can retry
          }
        },
        onClose: closeDeleteDialog,
      },
      config: { showCloseButton: false },
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldSeparator />
          <FieldGroup>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <Package className="size-5 text-primary" />
                    <h3 className="font-semibold text-lg">Edit Item</h3>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive/90">
                    <Trash2 className="size-4" />
                </Button>
              </div>

              <Field orientation="vertical">
                <FieldLabel htmlFor={titleId}>Item Title *</FieldLabel>
                {errors.title && <FieldError>{errors.title}</FieldError>}
                <Input
                  id={titleId}
                  placeholder="e.g. 500x Water Bottles"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field orientation="vertical">
                  <FieldLabel htmlFor={quantityId}>Quantity</FieldLabel>
                  <Input
                    id={quantityId}
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={unitValueId}>Unit Value ({currency})</FieldLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id={unitValueId}
                      type="number"
                      className="pl-9"
                      placeholder="0.00"
                      value={formData.unit_value}
                      onChange={(e) => handleChange("unit_value", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={totalValueId}>Total Value</FieldLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id={totalValueId}
                      type="number"
                      className="pl-9"
                      placeholder="0.00"
                      value={formData.total_value}
                      onChange={(e) => handleChange("total_value", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </Field>
              </div>

              <Field orientation="horizontal" className="items-center justify-between border rounded-lg p-3">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor={receivedId} className="text-base">Mark as Received</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    If checked, the value will be added to the total received amount.
                  </p>
                </div>
                <Switch
                  id={receivedId}
                  checked={formData.received}
                  onCheckedChange={(checked) => handleChange("received", checked)}
                  disabled={updateMutation.isPending}
                />
              </Field>

              <Field orientation="vertical">
                <FieldLabel htmlFor={notesId}>Notes</FieldLabel>
                <Textarea
                  id={notesId}
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  disabled={updateMutation.isPending}
                  rows={2}
                />
              </Field>
              
              {/* Audit Info */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                {item.created_by && (
                    <div>Created by {item.created_by.full_name} on {new Date(item.created_at).toLocaleDateString()}</div>
                )}
                {item.updated_by && item.updated_at !== item.created_at && (
                    <div>Last updated by {item.updated_by.full_name} on {new Date(item.updated_at).toLocaleString()}</div>
                )}
              </div>
            </div>

            <FieldSeparator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
