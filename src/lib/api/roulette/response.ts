// Response types for Prize Roulette API

export interface RouletteSession {
  id: number;
  event_id: number;
  user_id: number;
  title: string;
  draw_date: string | null;
  logo_url: string | null;
  draw_styles: {
    style: "wheel" | "slot" | "box";
    theme: "wireframe" | "colorful" | "cartoon";
  } | null;
  wrapper_background: {
    useImage: boolean;
    backgroundImgUrl?: string;
    backgroundColor?: string;
  } | null;
  is_multiple: boolean;
  draw_counts?: number;
  created_at: string;
  updated_at: string;
}

export interface RoulettePrize {
  id: number;
  roulette_session_id: number;
  name: string;
  quantity: number;
  winners?: RouletteWinner[];
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

export interface RouletteWinner {
  id: number;
  roulette_session_id: number;
  roulette_prize_id: number;
  ticket_id: number | null;
  visitor_id: number | null;
  participant_name: string | null;
  drawn_at: string;
  created_at: string;
  updated_at: string;
}

// Backend response from GET /v1/events/:event_id/roulette/sessions/:session_id/participants/:id
export interface BackendRouletteParticipant {
  type: "ticket" | "visitor";
  id: number;
  public_id: string;
  role?: string | null;
  checked_in: boolean;
  check_in_at: string | null;
  status?: string;
  event: {
    id: number;
    title: string;
  };
  scanned_by?: {
    id: number;
    full_name: string;
  } | null;
  // Ticket-specific fields
  attendee_name?: string;
  attendee_email?: string;
  attendee_phone?: string;
  ticket_type?: {
    id: number;
    name: string;
    price: number;
  } | null;
  // Visitor-specific fields
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: number;
}

// Frontend-friendly participant response format
export interface RouletteParticipant {
  type: "ticket" | "visitor";
  id: number;
  publicId: string;
  role?: string | null;
  checkedIn: boolean;
  checkInAt: string | null;
  status?: string;
  // Common fields (normalized)
  name: string;
  email?: string;
  phone?: string;
  // Event info
  eventId: number;
  eventName: string;
  // Scanned by info
  scannedBy?: {
    id: number;
    fullName: string;
  };
  // Ticket-specific (only present when type === "ticket")
  ticketType?: {
    id: number;
    name: string;
    price: number;
  };
  // Visitor-specific (only present when type === "visitor")
  gender?: string;
  age?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}
