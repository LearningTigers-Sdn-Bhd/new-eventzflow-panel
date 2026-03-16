"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOwnerVoices, type ClonedVoice } from "@/lib/api/organization-voices/endpoints";
import { useUserSessionStore } from "@/stores/new-auth-store";
import { useEffect, useCallback } from "react";
import { cable } from "@/lib/cable";
import { toast } from "sonner";

export function useClonedVoices(ownerId?: number) {
  const queryClient = useQueryClient();
  const user = useUserSessionStore((state) => state.user);
  
  // Default to current user if no ownerId provided
  const targetId = ownerId || user?.id;
  
  const query = useQuery({
    queryKey: ["cloned-voices", targetId],
    queryFn: () => getOwnerVoices(targetId!),
    enabled: !!targetId,
  });

  const handleVoiceUpdate = useCallback((data: any) => {
    if (data.type === "voice_cloning_update") {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["cloned-voices", targetId] });
      
      if (data.status === "ready") {
        toast.success(`Voice "${data.name}" is now ready!`);
      } else if (data.status === "failed") {
        toast.error(`Voice cloning for "${data.name}" failed.`);
      }
    }
  }, [targetId, queryClient]);

  // Real-time updates via ActionCable
  useEffect(() => {
    if (!targetId) return;

    const subscription = cable.subscriptions.create(
      { channel: "UserVoicesChannel", user_id: targetId },
      {
        received(data) {
          handleVoiceUpdate(data);
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [targetId, handleVoiceUpdate]);

  return query;
}
