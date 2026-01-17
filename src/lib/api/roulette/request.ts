// Request types for Prize Roulette API

export interface CreateRouletteSessionRequest {
  title: string;
  draw_date?: string | null;
  draw_styles?: {
    style: "wheel" | "slot" | "box";
    theme: "wireframe" | "colorful" | "cartoon";
  };
  wrapper_background?: {
    useImage: boolean;
    backgroundImgUrl?: string;
    backgroundColor?: string;
  };
  is_multiple?: boolean;
  draw_counts?: number;
}

export interface UpdateRouletteSessionRequest {
  title?: string;
  draw_date?: string | null;
  draw_styles?: {
    style: "wheel" | "slot" | "box";
    theme: "wireframe" | "colorful" | "cartoon";
  };
  wrapper_background?: {
    useImage: boolean;
    backgroundImgUrl?: string;
    backgroundColor?: string;
  };
  is_multiple?: boolean;
  draw_counts?: number;
}

export interface CreateRoulettePrizeRequest {
  name: string;
  quantity: number;
}

export interface UpdateRoulettePrizeRequest {
  name?: string;
  quantity?: number;
}

export interface CreateRouletteWinnerRequest {
  prize_id: number;
  ticket_public_id?: string;
  visitor_public_id?: string;
}
