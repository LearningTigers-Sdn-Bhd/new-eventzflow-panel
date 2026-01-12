"use client";

import { Handshake, DollarSign, FileText } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEventSponsorship } from "@/hooks/use-event-sponsorships";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { SponsorSelect } from "./sponsor-select";

interface CreateEventSponsorshipFormProps {
  eventId: string;
  tiers: EventSponsorshipTier[];
  onClose: () => void;
}

export default function CreateEventSponsorshipForm({ eventId, tiers, onClose }: CreateEventSponsorshipFormProps) {
  const sponsorId = useId();
  const tierId = useId();
  const titleId = useId();
  const amountId = useId();
  const typeId = useId();
  const notesId = useId();

  const [formData, setFormData] = useState({
    sponsor_id: "",
    event_sponsorship_tier_id: "none",
    title: "",
    total_sponsor_amount: "",
    sponsorship_type: "monetary", // default
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateEventSponsorship();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.sponsor_id) {
      newErrors.sponsor_id = "Please select a sponsor";
    }
    if (!formData.title) {
      newErrors.title = "Title is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createMutation.mutateAsync({
        eventId,
        data: {
          sponsor_id: parseInt(formData.sponsor_id),
          event_sponsorship_tier_id: formData.event_sponsorship_tier_id === "none" ? null : parseInt(formData.event_sponsorship_tier_id),
          title: formData.title,
          total_sponsor_amount: formData.total_sponsor_amount || "0",
          sponsorship_type: formData.sponsorship_type as any,
          description: formData.description,
          status: "pending",
        },
      });
      
      toast.success("Sponsorship added successfully!");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add sponsorship";
      toast.error(message);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
        // Clear error
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
    }
  };

  // Auto-fill details when tier is selected
  const handleTierChange = (value: string) => {
      handleChange("event_sponsorship_tier_id", value);
      if (value !== "none") {
          const tier = tiers.find(t => t.id.toString() === value);
          if (tier) {
              setFormData(prev => ({
                  ...prev,
                  total_sponsor_amount: tier.suggested_value || prev.total_sponsor_amount,
                  sponsorship_type: tier.sponsorship_type_default,
              }));
          }
      }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldSeparator />
          <FieldGroup>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Handshake className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Sponsorship Details</h3>
                </div>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={sponsorId}>Sponsor *</FieldLabel>
                  {errors.sponsor_id && <FieldError>{errors.sponsor_id}</FieldError>}
                  <SponsorSelect 
                    value={formData.sponsor_id} 
                    onSelect={(s) => {
                        handleChange("sponsor_id", s.id?.toString() || "");
                        // Auto-fill title if empty
                        if (!formData.title && s.name) {
                            handleChange("title", `${s.name} Sponsorship`);
                        }
                    }}
                  />
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={tierId}>Tier / Package</FieldLabel>
                  <Select
                    value={formData.event_sponsorship_tier_id}
                    onValueChange={handleTierChange}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id={tierId}>
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Tier (Standalone)</SelectItem>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id.toString()}>
                          {tier.name} ({tier.currency_default} {tier.suggested_value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={titleId}>Title *</FieldLabel>
                  {errors.title && <FieldError>{errors.title}</FieldError>}
                  <Input
                    id={titleId}
                    placeholder="e.g. Acme Corp Gold Sponsorship"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    disabled={createMutation.isPending}
                  />
                </Field>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <DollarSign className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Value & Terms</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field orientation="vertical">
                    <FieldLabel htmlFor={amountId}>Total Amount</FieldLabel>
                    <Input
                        id={amountId}
                        type="number"
                        placeholder="0.00"
                        value={formData.total_sponsor_amount}
                        onChange={(e) => handleChange("total_sponsor_amount", e.target.value)}
                        disabled={createMutation.isPending}
                    />
                    </Field>

                    <Field orientation="vertical">
                    <FieldLabel htmlFor={typeId}>Type</FieldLabel>
                    <Select
                        value={formData.sponsorship_type}
                        onValueChange={(val) => handleChange("sponsorship_type", val)}
                        disabled={createMutation.isPending}
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
                </div>

                <Field orientation="vertical">
                  <FieldLabel htmlFor={notesId}>Description / Notes</FieldLabel>
                  <Textarea
                    id={notesId}
                    placeholder="Additional details..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    disabled={createMutation.isPending}
                    rows={3}
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Sponsorship"}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}