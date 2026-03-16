import { restClient } from "@/utils/rest-api";

export type VoiceStatus = "pending" | "ready" | "failed";

export interface ClonedVoice {
  id: number;
  name: string;
  elevenlabs_id: string | null;
  status: VoiceStatus;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  group_id: number;
  event_id: number | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all cloned voices for a user (owner)
 */
export async function getOwnerVoices(ownerId: number): Promise<ClonedVoice[]> {
  return restClient.get<ClonedVoice[]>(`v1/users/${ownerId}/cloned_voices`);
}

/**
 * Fetch cloned voices for a specific event
 */
export async function getEventVoices(eventId: number): Promise<ClonedVoice[]> {
  return restClient.get<ClonedVoice[]>(`v1/events/${eventId}/cloned_voices`);
}

/**
 * Create a new cloned voice (triggers background cloning)
 */
export async function createClonedVoice(
  name: string,
  ownerId: number,
  audioBlobs: Blob[],
  eventId?: number
): Promise<ClonedVoice> {
  const formData = new FormData();
  formData.append("cloned_voice[name]", name);
  formData.append("cloned_voice[owner_id]", ownerId.toString());
  if (eventId) {
    formData.append("cloned_voice[event_id]", eventId.toString());
  }
  
  // Append multiple samples
  for (let i = 0; i < audioBlobs.length; i++) {
    formData.append("cloned_voice[audio_samples][]", audioBlobs[i], `sample_${i + 1}.wav`);
  }

  return restClient.postFormData<ClonedVoice>("v1/cloned_voices", formData);
}

/**
 * Attach an existing cloned voice to an event
 */
export async function attachVoiceToEvent(voiceId: number, eventId: number): Promise<ClonedVoice> {
  return restClient.post<ClonedVoice>(`v1/cloned_voices/${voiceId}/attach`, { event_id: eventId });
}

/**
 * Delete a cloned voice
 */
export async function deleteClonedVoice(voiceId: number): Promise<void> {
  return restClient.delete(`v1/cloned_voices/${voiceId}`);
}
