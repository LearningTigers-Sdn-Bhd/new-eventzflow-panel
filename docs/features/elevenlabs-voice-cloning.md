# ElevenLabs Voice Cloning & Announcement Integration Plan

This document outlines the frontend implementation plan for integrating ElevenLabs' voice cloning into the EventzFlow panel.

## Objective
Enable users to:
1.  Upload/Record voice samples in the admin panel.
2.  Clone their voice using ElevenLabs Instant Voice Cloning.
3.  Store cloned voices at the **Organization** level for reuse.
4.  Select between "Standard Voices" (Google) and "Premium Cloned Voices" (ElevenLabs).
5.  Hear announcements in the cloned voice during guest check-ins.

## Frontend Architecture

### 1. State Management & API Integration
- **Cloned Voices Fetching**: Use `@tanstack/react-query` to fetch organization-level cloned voices.
- **Voice selection**: Store the selected `voice_id` in the `CheckInDisplay` settings.
- **API Endpoints (Assumed)**:
  - `GET /v1/organizations/:id/cloned_voices`: Returns a list of available cloned voices.
  - `POST /v1/organizations/:id/cloned_voices`: Uploads audio samples and triggers cloning.
  - `DELETE /v1/organizations/:id/cloned_voices/:id`: Deletes a cloned voice.

### 2. Components

#### `VoiceCloningModal`
A wizard-based modal for the cloning process:
- **Step 1: Instructions**: Explain the cloning process and privacy.
- **Step 2: Audio Collection**: 
  - `AudioRecorder`: Live recording with visual feedback (waveform).
  - `FileUploader`: Drag-and-drop support for `.mp3`, `.wav`.
  - **Validation**: Ensure at least 1 minute of total audio or 3-5 distinct samples.
- **Step 3: Processing**: Show a loading state while the backend interacts with ElevenLabs.
- **Step 4: Preview & Name**: Allow the user to name the voice and hear a sample before saving.

#### `VoiceSelector` (Update)
Enhance the existing voice selector in `WelcomeScreenForm`:
- Categorize voices into **Standard (Google)** and **Premium (Cloned)**.
- Display voice details (gender, name).
- Add a "Play Preview" button for each voice.
- Add a "Clone New Voice" action that opens the `VoiceCloningModal`.

### 3. TTS Integration
- **Provider Detection**: The frontend will pass the `voice_id` to the internal API `/api/tts/synthesize`.
- **API Route Update**:
  - Detect ElevenLabs IDs (e.g., those not matching Google's `ms-MY-*` pattern).
  - Forward synthesis requests to ElevenLabs API (server-side).

## Implementation Steps

### Phase 1: Core Components
1.  Implement `VoiceRecorder` using the `MediaRecorder` API.
2.  Update `Voice` types and `VOICES` list to handle dynamic data.
3.  Create the `VoiceCloningModal` skeleton.

### Phase 2: Selection & Preview
1.  Update `WelcomeScreenForm` to include the categorized selector.
2.  Implement audio preview playback using the `Audio` object.
3.  Add "Clone New Voice" entry point.

### Phase 3: API Integration (Frontend-Side)
1.  Add API calls to `src/lib/api/organization-voices` (new file).
2.  Update the synthesize API route to support ElevenLabs.

## UI Considerations
- **Status Indicators**: Show "Cloning..." status if the voice isn't ready immediately.
- **Error Handling**: Gracefully handle microphone permission denial or upload failures.
- **User Feedback**: Use `sonner` for toast notifications on successful cloning.

## Fallback & Quality
- **Google Wavenet**: Maintain as the reliable default.
- **Quality Check**: Display a "Quality Score" or status based on the provided samples (if ElevenLabs API provides it).
