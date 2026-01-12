"use client";

import { Layers, DollarSign, ListOrdered, FileText, Info } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateEventSponsorshipTier } from "@/hooks/use-event-sponsorships";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";

interface EditEventSponsorshipTierFormProps {
  eventId: string;
  tier: EventSponsorshipTier;
  onClose: () => void;
}

export default function EditEventSponsorshipTierForm({ eventId, tier, onClose }: EditEventSponsorshipTierFormProps) {
  const nameId = useId();
  const typeId = useId();
  const priceId = useId();
  const capacityId = useId();
  const benefitsId = useId();
  const descriptionId = useId();
  const sortId = useId();

  const [formData, setFormData] = useState({
    name: tier.name,
    sponsorship_type_default: tier.sponsorship_type_default,
    currency_default: tier.currency_default,
    suggested_value: tier.suggested_value || "",
    capacity: tier.capacity?.toString() || "",
    benefits: tier.benefits || "",
    description: tier.description || "",
    sort_order: tier.sort_order?.toString() || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateMutation = useUpdateEventSponsorshipTier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        eventId,
        id: tier.id.toString(),
        data: {
          name: formData.name,
          sponsorship_type_default: formData.sponsorship_type_default,
          currency_default: formData.currency_default,
          suggested_value: formData.suggested_value || "0",
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          benefits: formData.benefits || undefined,
          description: formData.description || undefined,
          sort_order: formData.sort_order ? parseInt(formData.sort_order) : undefined,
        },
      });
      
      toast.success("Tier updated successfully!");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update tier";
      toast.error(message);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldSeparator />
          <FieldGroup>
            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Layers className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Tier Details</h3>
                </div>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={nameId}>Tier Name *</FieldLabel>
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                  <Input
                    id={nameId}
                    placeholder="Gold, Silver, Platinum..."
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={updateMutation.isPending}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field orientation="vertical">
                    <FieldLabel htmlFor={typeId}>Default Type</FieldLabel>
                    <Select
                        value={formData.sponsorship_type_default}
                        onValueChange={(val) => handleChange("sponsorship_type_default", val)}
                        disabled={updateMutation.isPending}
                    >
                        <SelectTrigger id={typeId}>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="monetary">Monetary</SelectItem>
                        <SelectItem value="in_kind">In-Kind</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                    </Select>
                    </Field>

                    <Field orientation="vertical">
                    <FieldLabel htmlFor={priceId}>Suggested Value (RM)</FieldLabel>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                            id={priceId}
                            type="number"
                            className="pl-9"
                            placeholder="10000"
                            value={formData.suggested_value}
                            onChange={(e) => handleChange("suggested_value", e.target.value)}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field orientation="vertical">
                        <FieldLabel htmlFor={capacityId}>Capacity (Qty)</FieldLabel>
                        <Input
                            id={capacityId}
                            type="number"
                            min={0}
                            placeholder="Unlimited (leave blank)"
                            value={formData.capacity}
                            onChange={(e) => handleChange("capacity", e.target.value)}
                            disabled={updateMutation.isPending}
                        />
                    </Field>
                    
                    <Field orientation="vertical">
                        <FieldLabel htmlFor={sortId} className="flex items-center gap-2">
                          Sort Order
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Determines the display order (Ranking/Priority).</p>
                                <p>Lower numbers appear first.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FieldLabel>
                        <div className="relative">
                            <ListOrdered className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id={sortId}
                                type="number"
                                className="pl-9"
                                placeholder="1"
                                value={formData.sort_order}
                                onChange={(e) => handleChange("sort_order", e.target.value)}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    </Field>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Benefits & Description</h3>
                </div>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={benefitsId}>Benefits List</FieldLabel>
                  <Textarea
                    id={benefitsId}
                    placeholder={"- Logo on stage\n- VIP Tickets\n- Booth space"}
                    value={formData.benefits}
                    onChange={(e) => handleChange("benefits", e.target.value)}
                    disabled={updateMutation.isPending}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">List key benefits for this tier.</p>
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={descriptionId}>Internal Description</FieldLabel>
                  <Textarea
                    id={descriptionId}
                    placeholder="Internal notes..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    disabled={updateMutation.isPending}
                    rows={2}
                  />
                </Field>
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
                {updateMutation.isPending ? "Updating..." : "Update Tier"}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
