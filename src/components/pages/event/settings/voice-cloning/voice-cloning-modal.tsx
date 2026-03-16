"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "./audio-recorder";
import { createClonedVoice } from "@/lib/api/organization-voices/endpoints";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface VoiceCloningModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
  eventId?: number;
  onSuccess?: (voiceId: string) => void;
}

type Step = "instructions" | "record" | "name" | "processing" | "success" | "failed";

export function VoiceCloningModal({
  isOpen,
  onOpenChange,
  organizationId,
  eventId,
  onSuccess
}: VoiceCloningModalProps) {
  const [step, setStep] = useState<Step>("instructions");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetModal = () => {
    setStep("instructions");
    setAudioBlobs([]);
    setVoiceName("");
    setIsSubmitting(false);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Don't allow closing while submitting
      if (isSubmitting) return;
      resetModal();
    }
    onOpenChange(open);
  };

  const handleStartCloning = async () => {
    if (audioBlobs.length === 0 || !voiceName) return;

    setIsSubmitting(true);
    setStep("processing");

    try {
      const result = await createClonedVoice(
        voiceName,
        organizationId,
        audioBlobs,
        eventId
      );

      // Note: Backend handles the actual cloning in a job.
      // We just successfully submitted the request.
      setStep("success");
      toast.success("Voice cloning request submitted successfully!");
      
      if (onSuccess && result.elevenlabs_id) {
        onSuccess(result.elevenlabs_id);
      }
    } catch (err) {
      console.error("Cloning error:", err);
      setError(err instanceof Error ? err.message : "Failed to start cloning process");
      setStep("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {step === "instructions" && "Voice Cloning"}
            {step === "record" && "Record Sample"}
            {step === "name" && "Name Your Voice"}
            {step === "processing" && "Processing Voice"}
            {step === "success" && "Success!"}
            {step === "failed" && "Cloning Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "instructions" && "Create a high-quality AI clone of your voice for event announcements."}
            {step === "record" && "Speak clearly into your microphone."}
            {step === "name" && "Give your new voice a recognizable name."}
            {step === "processing" && "We're uploading your sample to ElevenLabs."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {step === "instructions" && (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <h4 className="text-sm font-semibold mb-2">How it works:</h4>
                <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Record a 30-60 second sample of your voice.</li>
                  <li>Our AI will analyze your unique vocal characteristics.</li>
                  <li>Once ready, you can use this voice for all event announcements.</li>
                  <li>Cloned voices are available across your entire organization.</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Note: Cloning consumes premium credits. Ensure you have sufficient balance.
              </p>
            </div>
          )}

          {step === "record" && (
            <AudioRecorder 
              onSamplesChange={(blobs) => setAudioBlobs(blobs)} 
              maxDurationSeconds={120}
            />
          )}

          {step === "name" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="voice-name">Voice Name</Label>
                <Input 
                  id="voice-name" 
                  placeholder="e.g., John's Announcement Voice" 
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-sm font-medium">Uploading and initializing...</p>
              <p className="text-xs text-muted-foreground text-center">
                Please don't close this window until the upload is complete.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center">
                <p className="text-lg font-semibold">Request Submitted!</p>
                <p className="text-sm text-muted-foreground mt-2 px-6">
                  Your voice is being cloned. This usually takes 1-2 minutes. 
                  You will receive a notification when it's ready to use.
                </p>
              </div>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div className="text-center">
                <p className="text-lg font-semibold">Something went wrong</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error || "An unexpected error occurred during cloning."}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t">
          {step === "instructions" && (
            <Button onClick={() => setStep("record")}>Get Started</Button>
          )}
          
          {step === "record" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("instructions")}>Back</Button>
              <Button disabled={audioBlobs.length === 0} onClick={() => setStep("name")}>Next</Button>
            </div>
          )}

          {step === "name" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("record")}>Back</Button>
              <Button disabled={!voiceName} onClick={handleStartCloning}>Start Cloning</Button>
            </div>
          )}

          {(step === "success" || step === "failed") && (
            <Button onClick={() => handleOpenChange(false)}>
              {step === "success" ? "Done" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
