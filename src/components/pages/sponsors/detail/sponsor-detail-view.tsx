"use client";

import { Handshake, Globe, Mail, Phone, Pencil, Trash2, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDialog } from "@/hooks/use-dialog";
import { useDeleteSponsor } from "@/hooks/use-sponsorships";
import type { Sponsor } from "@/lib/api/sponsorship/response";
import EditSponsorForm from "../forms/edit-sponsor-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface SponsorDetailViewProps {
  sponsor: Sponsor;
}

export default function SponsorDetailView({ sponsor }: SponsorDetailViewProps) {
  const { openDialog, closeDialog } = useDialog();
  const deleteMutation = useDeleteSponsor();
  const router = useRouter();

  const handleEdit = () => {
    openDialog({
      component: EditSponsorForm,
      props: {
        sponsor,
        onClose: closeDialog,
      },
      config: {
        title: "Edit Sponsor",
        description: "Update sponsor details",
        size: "2xl",
        showCloseButton: true,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
        deleteMutation.mutate(sponsor.id.toString(), {
            onSuccess: () => {
                toast.success("Sponsor deleted");
                router.push("/sponsors");
            },
            onError: () => toast.error("Failed to delete sponsor"),
        });
    }
  };

  const sponsorships = sponsor.event_sponsorships || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {sponsor.logo_path ? (
                <img
                src={sponsor.logo_path}
                alt={sponsor.name}
                className="h-12 w-12 rounded-full object-cover"
                />
            ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Handshake className="h-6 w-6 text-primary" />
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{sponsor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <Badge 
                        variant={sponsor.is_active ? "default" : "secondary"}
                        className={sponsor.is_active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                        {sponsor.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {sponsor.industry && (
                        <span className="text-sm text-muted-foreground">• {sponsor.industry}</span>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
                <Pencil className="size-4 mr-2" />
                Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4 mr-2" />
                Delete
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                        <span className="text-muted-foreground block mb-1">Default Contact Person</span>
                        <div className="font-medium">{sponsor.default_contact_name || "-"}</div>
                        <div className="text-xs text-muted-foreground">{sponsor.default_contact_position}</div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            <span>{sponsor.default_email || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="size-4 text-muted-foreground" />
                            <span>{sponsor.default_whatsapp || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="size-4 text-muted-foreground" />
                            {sponsor.website ? (
                                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {sponsor.website}
                                </a>
                            ) : (
                                <span>-</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {sponsor.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {sponsor.notes}
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Sidebar Info - Stats */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Analytics Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sponsorships</span>
                        <div className="text-3xl font-bold">{sponsor.total_sponsorship_count || 0}</div>
                        <p className="text-[10px] text-muted-foreground">Active and completed events</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sponsor Amount</span>
                            <div className="text-xl font-semibold">MYR {parseFloat(sponsor.total_pledged_amount || "0").toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Received</span>
                            <div className="text-xl font-semibold text-emerald-600">MYR {parseFloat(sponsor.total_received_amount || "0").toLocaleString()}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Sponsorship History Table */}
        <div className="md:col-span-3">
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Sponsorship History</CardTitle>
                </CardHeader>
                <CardContent>
                    {!sponsorships.length ? (
                        <div className="text-sm text-muted-foreground py-4 text-center">No sponsorships recorded.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event / Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Received</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sponsorships.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <a 
                                                    href={`/event/${s.event_id}/sponsorships/${s.id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-primary"
                                                >
                                                    {s.title}
                                                </a>
                                                {s.event && (
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        {s.event.title}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const status = s.status;
                                                let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                                                let className = "capitalize";

                                                if (status === "received") {
                                                    variant = "default";
                                                    className += " bg-emerald-600 hover:bg-emerald-700";
                                                } else if (status === "partially_received") {
                                                    variant = "secondary";
                                                    className += " bg-amber-100 text-amber-800 hover:bg-amber-200";
                                                } else if (status === "cancelled") {
                                                    variant = "destructive";
                                                }
                                                    
                                                return (
                                                    <Badge variant={variant} className={className}>
                                                        {status.replace("_", " ")}
                                                    </Badge>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>{s.currency} {parseFloat(s.total_sponsor_amount || "0").toLocaleString()}</TableCell>
                                        <TableCell className="text-emerald-600 font-medium">
                                            {s.currency} {parseFloat(s.received_total || "0").toLocaleString()}
                                        </TableCell>
                                        <TableCell>{format(new Date(s.created_at), "dd MMM yyyy")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
