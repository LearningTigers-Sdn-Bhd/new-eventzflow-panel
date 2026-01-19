export interface PlanObject {
  id: number;
  plan_id: number;
  object_type: string; // 'table', 'wall', 'door', 'stage', 'label'
  layer: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  label: string | null;
  capacity: number | null;
  locked: boolean;
  z_index: number;
  table_assignments?: TableAssignment[];
}

export interface TableAssignment {
  id: number;
  ticket_id: number;
  visitor_id: number;
  plan_object_id: number;
  ticket?: {
    id: number;
    attendee_name: string;
    ticket_type_id: number;
    // Add other fields as needed
  };
  visitor?: {
    id: number;
    full_name: string;
    // Add other fields as needed
  };
}

export interface Plan {
  id: number;
  event_id: number;
  name: string;
  canvas_width: number;
  canvas_height: number;
  pixels_per_unit: number;
  public_enabled: boolean;
  share_token: string;
  settings_json: any;
  plan_objects?: PlanObject[];
}
