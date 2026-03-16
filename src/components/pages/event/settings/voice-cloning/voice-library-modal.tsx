"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useClonedVoices } from "@/hooks/use-cloned-voices";
import { deleteClonedVoice, attachVoiceToEvent } from "@/lib/api/organization-voices/endpoints";
import { toast } from "sonner";
import { Loader2, Trash2, Check, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VoiceLibraryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
  eventId?: number;
  currentVoiceId?: string | null;
  onVoiceAttached?: (voiceId: string) => void;
}

export function VoiceLibraryModal({
  isOpen,
  onOpenChange,
  organizationId,
  eventId,
  currentVoiceId,
  onVoiceAttached
}: VoiceLibraryModalProps) {
  const { data: voices, isLoading, refetch } = useClonedVoices(organizationId);
  const [isActionInProgress, setIsActionInProgress] = useState<number | null>(null);

  const handleAttach = async (voiceId: number, elevenlabsId: string) => {
    if (!eventId) return;
    
    setIsActionInProgress(voiceId);
    try {
      await attachVoiceToEvent(voiceId, eventId);
      toast.success("Voice attached to event!");
      if (onVoiceAttached) {
        onVoiceAttached(elevenlabsId);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to attach voice.");
    } finally {
      setIsActionInProgress(null);
    }
  };

  const handleDelete = async (voiceId: number) => {
    if (!confirm("Are you sure you want to delete this cloned voice? This cannot be undone.")) return;

    setIsActionInProgress(voiceId);
    try {
      await deleteClonedVoice(voiceId);
      toast.success("Voice deleted successfully.");
      refetch();
    } catch (err) {
      toast.error("Failed to delete voice.");
    } finally {
      setIsActionInProgress(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-none">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Voice Library
          </DialogTitle>
          <DialogDescription>
            Manage your organization's cloned voices and attach them to this event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading library...</p>
            </div>
          ) : voices?.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No cloned voices found in your library.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {voices?.map((voice) => {
                const isCurrent = voice.elevenlabs_id === currentVoiceId;
                const isPending = voice.status === "pending";
                const isFailed = voice.status === "failed";

                return (
                  <div 
                    key={voice.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-none transition-all",
                      isCurrent ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-slate-300"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold">{voice.name}</h4>
                        {isCurrent && (
                          <Badge variant="default" className="h-4 text-[9px] uppercase px-1.5 rounded-none">Active</Badge>
                        )}
                        {isPending && (
                          <Badge variant="outline" className="h-4 text-[9px] uppercase px-1.5 rounded-none animate-pulse text-orange-500 border-orange-200 bg-orange-50">Cloning...</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Created on {new Date(voice.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isCurrent ? "secondary" : "default"}
                        disabled={!eventId || isPending || isFailed || isCurrent || isActionInProgress === voice.id}
                        className="h-8 text-[11px] font-bold uppercase rounded-none"
                        onClick={() => handleAttach(voice.id, voice.elevenlabs_id!)}
                      >
                        {isActionInProgress === voice.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : isCurrent ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <ExternalLink className="h-3 w-3 mr-1" />
                        )}
                        {isCurrent ? "Attached" : "Attach to Event"}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isActionInProgress === voice.id}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-none"
                        onClick={() => handleDelete(voice.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 pt-2 border-t bg-slate-50 flex justify-end">
          <Button variant="outline" className="rounded-none h-9 text-xs" onClick={() => onOpenChange(false)}>
            Close Library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
