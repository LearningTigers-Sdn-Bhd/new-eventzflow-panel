"use client";

import { Plan, PlanObject } from "@/lib/api/plan/response";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, UserMinus, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface InspectorProps {
  plan: Plan;
  object: PlanObject | null;
  onUpdate: (id: number, updates: Partial<PlanObject>) => void;
  onDelete: (id: number) => void;
  onDeleteAssignment?: (ids: { ticketId?: number; visitorId?: number }) => void;
  onUpdatePlan: (updates: Partial<Plan>) => void;
}

export function Inspector({ plan, object, onUpdate, onDelete, onDeleteAssignment, onUpdatePlan }: InspectorProps) {
  if (!object) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2 font-medium text-sm">
            <Settings2 className="h-4 w-4" />
            Plan Settings
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="planName">Plan Name</Label>
          <Input
            id="planName"
            value={plan.name}
            onChange={(e) => onUpdatePlan({ name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="canvasWidth">Canvas Width</Label>
            <Input
              id="canvasWidth"
              type="number"
              value={plan.canvas_width}
              onChange={(e) => onUpdatePlan({ canvas_width: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="canvasHeight">Canvas Height</Label>
            <Input
              id="canvasHeight"
              type="number"
              value={plan.canvas_height}
              onChange={(e) => onUpdatePlan({ canvas_height: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pixelsPerUnit">Pixels per Unit (Scale)</Label>
            <span className="text-[10px] text-muted-foreground italic">e.g. 20px = 1m</span>
          </div>
          <Input
            id="pixelsPerUnit"
            type="number"
            value={plan.pixels_per_unit}
            onChange={(e) => onUpdatePlan({ pixels_per_unit: Number(e.target.value) })}
          />
        </div>

        <div className="p-3 bg-muted/30 rounded-md border text-[10px] text-muted-foreground">
            <p className="font-semibold mb-1 uppercase tracking-wider text-muted-foreground/70">Scale Info</p>
            <p>1 unit = {plan.pixels_per_unit} pixels</p>
            <p>Total area: {(plan.canvas_width / plan.pixels_per_unit).toFixed(1)} x {(plan.canvas_height / plan.pixels_per_unit).toFixed(1)} units</p>
        </div>
      </div>
    );
  }

  const realWidth = (object.width / plan.pixels_per_unit).toFixed(2);
  const realHeight = (object.height / plan.pixels_per_unit).toFixed(2);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={object.label || ""}
          onChange={(e) => onUpdate(object.id, { label: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            value={object.width}
            onChange={(e) => onUpdate(object.id, { width: Number(e.target.value) })}
          />
          <div className="text-[10px] text-muted-foreground italic">{realWidth} units</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={object.height}
            onChange={(e) => onUpdate(object.id, { height: Number(e.target.value) })}
          />
          <div className="text-[10px] text-muted-foreground italic">{realHeight} units</div>
        </div>
      </div>

      {object.object_type === "table" && (
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={object.capacity || 0}
            onChange={(e) => onUpdate(object.id, { capacity: Number(e.target.value) })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rotation">Rotation (deg)</Label>
        <Input
          id="rotation"
          type="number"
          value={object.rotation}
          onChange={(e) => onUpdate(object.id, { rotation: Number(e.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="locked">Locked</Label>
        <Switch
          id="locked"
          checked={object.locked}
          onCheckedChange={(checked) => onUpdate(object.id, { locked: checked })}
        />
      </div>

      {object.object_type === "floor" && (
        <div className="space-y-2">
          <Label htmlFor="path">SVG Path (for curves)</Label>
          <textarea
            id="path"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            value={object.path || ""}
            onChange={(e) => onUpdate(object.id, { path: e.target.value })}
            placeholder="M 0,0 L 100,0 ..."
          />
          <p className="text-[10px] text-muted-foreground">
            Use SVG path syntax. The floor's bounding box still uses Width/Height.
          </p>
        </div>
      )}

      {object.object_type === "table" && (
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Assigned Guests</h3>
            <span className="text-xs text-muted-foreground">
              {object.table_assignments?.length || 0} / {object.capacity}
            </span>
          </div>
          <div className="space-y-2">
            {object.table_assignments?.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No guests assigned yet.</p>
            ) : (
              object.table_assignments?.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-xs">
                  <span className="truncate flex-1 mr-2">
                      {assignment.ticket?.attendee_name || assignment.visitor?.full_name || "Guest"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteAssignment?.({ 
                        ticketId: assignment.ticket_id, 
                        visitorId: assignment.visitor_id 
                    })}
                  >
                    <UserMinus className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Separator />

      <Button
        variant="destructive"
        className="w-full"
        onClick={() => onDelete(object.id)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Object
      </Button>
    </div>
  );
}