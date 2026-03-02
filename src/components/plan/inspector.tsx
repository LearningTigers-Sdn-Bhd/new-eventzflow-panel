"use client";

import { Plan, PlanObject } from "@/lib/api/plan/response";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, UserMinus, Settings2, Ruler, Info, ImageIcon, Users } from "lucide-react";
import { Unit, pxToUnit, unitToPx } from "./unit-conversion";
import ImageUpload from "@/components/file-upload/image-upload";
import { DelayedInput } from "./delayed-input";

interface InspectorProps {
  plan: Plan;
  object: PlanObject | null;
  onUpdate: (id: number, updates: Partial<PlanObject>) => void;
  onDelete: (id: number) => void;
  onDeleteAssignment?: (ids: { ticketId?: number; visitorId?: number }) => void;
  onUpdatePlan: (updates: any) => void;
  onUploadBackground?: (file: File | null) => void;
  onUploadObjectImage?: (id: number, file: File | null) => void;
  unit: Unit;
}

export function Inspector({ 
    plan, object, onUpdate, onDelete, 
    onDeleteAssignment, onUpdatePlan, 
    onUploadBackground, onUploadObjectImage, unit 
}: InspectorProps) {
  if (!object) {
    return (
      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Settings2 className="h-3 w-3" />
                Plan Settings
            </h3>
            <p className="text-[10px] text-slate-400">Configure your venue dimensions and units.</p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600">Plan Name</Label>
          <DelayedInput
            value={plan.name}
            onSubmit={(val) => onUpdatePlan({ name: val })}
            className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-medium"
          />
        </div>

        <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <ImageIcon className="h-3 w-3" />
                Venue Floor Plan (Background)
            </Label>
            <ImageUpload 
                value={plan.background_image_url || undefined}
                onChange={(file) => {
                    if (file instanceof File || file === null) {
                        onUploadBackground?.(file);
                    }
                }}
                className="bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 italic">Upload a PNG/JPG of your overall venue. It will be displayed behind everything.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600">Venue Width ({unit})</Label>
            <DelayedInput
              type="number"
              value={pxToUnit(plan.canvas_width, unit).toFixed(2)}
              onSubmit={(val) => onUpdatePlan({ canvas_width: unitToPx(Number(val), unit) })}
              className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-mono text-xs px-2"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600">Venue Height ({unit})</Label>
            <DelayedInput
              type="number"
              value={pxToUnit(plan.canvas_height, unit).toFixed(2)}
              onSubmit={(val) => onUpdatePlan({ canvas_height: unitToPx(Number(val), unit) })}
              className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-mono text-xs px-2"
            />
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-primary uppercase tracking-tight">Pro Tip</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                    Set your venue size to match the real-world dimensions. 
                    This ensures tables and paths are scaled correctly for the final print.
                </p>
            </div>
        </div>
      </div>
    );
  }

  const isDesignerType = ['floor', 'stage'].includes(object.object_type);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Ruler className="h-3 w-3" />
              Object Properties
          </h3>
          <p className="text-[10px] text-slate-400">Modify the selected {object.object_type}.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-600">Label</Label>
        <DelayedInput
          value={object.label || ""}
          onSubmit={(val) => onUpdate(object.id, { label: val })}
          className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-medium"
        />
      </div>

      {isDesignerType && (
          <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" />
                  Custom Design (Image)
              </Label>
              <ImageUpload 
                  value={object.image_url || undefined}
                  onChange={(file) => {
                      if (file instanceof File || file === null) {
                          onUploadObjectImage?.(object.id, file);
                      }
                  }}
                  className="bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 italic text-center">Use this to show a specific floor section or stage design.</p>
          </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600">Width ({unit})</Label>
          <DelayedInput
            type="number"
            value={pxToUnit(object.width, unit).toFixed(2)}
            onSubmit={(val) => onUpdate(object.id, { width: unitToPx(Number(val), unit) })}
            className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-mono text-xs px-2"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600">Height ({unit})</Label>
          <DelayedInput
            type="number"
            value={pxToUnit(object.height, unit).toFixed(2)}
            onSubmit={(val) => onUpdate(object.id, { height: unitToPx(Number(val), unit) })}
            className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-mono text-xs px-2"
          />
        </div>
      </div>

      {object.object_type === "table" && (
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600">Seating Capacity</Label>
          <DelayedInput
            type="number"
            value={object.capacity || 0}
            onSubmit={(val) => onUpdate(object.id, { capacity: Number(val) })}
            className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-medium text-center"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-600">Rotation (degrees)</Label>
        <DelayedInput
          type="number"
          value={object.rotation}
          onSubmit={(val) => onUpdate(object.id, { rotation: Number(val) })}
          className="h-9 bg-slate-50 border-transparent hover:border-slate-200 focus:border-primary transition-all font-mono text-xs px-2"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
        <Label className="text-xs font-bold text-slate-600 cursor-pointer" htmlFor="locked">Lock Object</Label>
        <Switch
          id="locked"
          checked={object.locked}
          onCheckedChange={(checked) => onUpdate(object.id, { locked: checked })}
        />
      </div>

      {object.object_type === "table" && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-[11px] uppercase tracking-tighter text-slate-400 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Assigned Guests
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {object.table_assignments?.length || 0} / {object.capacity}
            </span>
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {object.table_assignments?.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl border-slate-200">
                  <p className="text-[10px] font-medium text-slate-400 italic">No guests assigned.<br/>Drag a guest here to seat them.</p>
              </div>
            ) : (
              object.table_assignments?.map((assignment) => (
                <div key={assignment.id} className="group flex items-center justify-between p-3 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-xs transition-all">
                  <div className="flex items-center gap-3 truncate flex-1">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {assignment.ticket?.attendee_name?.[0] || assignment.visitor?.full_name?.[0] || "?"}
                      </div>
                      <span className="truncate font-bold text-slate-700">
                          {assignment.ticket?.attendee_name || assignment.visitor?.full_name || "Guest"}
                      </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteAssignment?.({ 
                        ticketId: assignment.ticket_id, 
                        visitorId: assignment.visitor_id 
                    })}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
            variant="ghost"
            className="w-full h-10 text-slate-400 hover:text-destructive hover:bg-destructive/5 font-bold text-xs"
            onClick={() => onDelete(object.id)}
        >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Object
        </Button>
      </div>
    </div>
  );
}
