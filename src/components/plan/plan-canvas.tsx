"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { Move, Copy, Trash2, Lock, Unlock } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface PlanCanvasProps {
  plan: Plan;
  selectedObjectId?: number | null;
  activeTool: 'select' | 'floor' | 'eraser';
  isCalibrating?: boolean;
  onSelectObject?: (id: number | null) => void;
  onUpdateObjectPosition?: (id: number, x: number, y: number) => void;
  onResizeObject?: (id: number, width: number, height: number, x?: number, y?: number) => void;
  onUpdatePlan?: (updates: Partial<Plan>) => void;
  onCreateObject?: (data: { object_type: string, x: number, y: number, width: number, height: number, label?: string, capacity?: number }) => void;
  onDeleteObject?: (id: number) => void;
  onUpdateObject?: (id: number, updates: Partial<PlanObject>) => void;
}

export function PlanCanvas({
  plan,
  selectedObjectId,
  activeTool,
  isCalibrating,
  onSelectObject,
  onUpdateObjectPosition,
  onResizeObject,
  onUpdatePlan,
  onCreateObject,
  onDeleteObject,
  onUpdateObject,
}: PlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  // Calibration State
  const [calibState, setCalibState] = useState({
      width: plan.canvas_width,
      height: plan.canvas_height,
      bgX: plan.settings_json?.bgX || 0,
      bgY: plan.settings_json?.bgY || 0,
      ghostX: plan.settings_json?.ghostX || 0,
      ghostY: plan.settings_json?.ghostY || 0
  });

  useEffect(() => {
      if (!isCalibrating) {
          setCalibState({
              width: plan.canvas_width,
              height: plan.canvas_height,
              bgX: plan.settings_json?.bgX || 0,
              bgY: plan.settings_json?.bgY || 0,
              ghostX: plan.settings_json?.ghostX || 0,
              ghostY: plan.settings_json?.ghostY || 0
          });
      }
  }, [plan.canvas_width, plan.canvas_height, plan.settings_json, isCalibrating]);

  const pushCalibUpdate = useCallback((newState: typeof calibState) => {
      onUpdatePlan?.({
          canvas_width: newState.width,
          canvas_height: newState.height,
          settings_json: {
              ...plan.settings_json,
              bgX: newState.bgX,
              bgY: newState.bgY,
              ghostX: newState.ghostX,
              ghostY: newState.ghostY
          }
      });
  }, [onUpdatePlan, plan.settings_json]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .filter((event) => {
          if (isCalibrating) return false; 
          if (activeTool === 'floor') return false;
          if (activeTool === 'eraser' && event.type === 'mousedown') return false;
          return !event.button;
      })
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);
  }, [activeTool, isCalibrating]);

  // Calibration D3 logic
  useEffect(() => {
      if (!isCalibrating || !bgRef.current || !ghostRef.current) return;

      const bg = d3.select(bgRef.current);
      const ghost = d3.select(ghostRef.current);

      bg.call(d3.drag<SVGGElement, unknown>().on("drag", (event) => {
          setCalibState(prev => ({
              ...prev,
              bgX: prev.bgX + event.dx / zoomTransform.k,
              bgY: prev.bgY + event.dy / zoomTransform.k
          }));
      }).on("end", () => pushCalibUpdate(calibState)));

      ghost.call(d3.drag<SVGGElement, unknown>().on("drag", (event) => {
          setCalibState(prev => ({
              ...prev,
              ghostX: prev.ghostX + event.dx / zoomTransform.k,
              ghostY: prev.ghostY + event.dy / zoomTransform.k
          }));
      }).on("end", () => pushCalibUpdate(calibState)));

      const resizers = d3.select(containerRef.current).selectAll<SVGCircleElement, unknown>(".bg-resizer");
      resizers.call(d3.drag<SVGCircleElement, unknown>().on("drag", function(event) {
          const type = d3.select(this).attr("data-type");
          setCalibState(prev => {
              const ratio = prev.width / prev.height;
              let { width: w, height: h, bgX: x, bgY: y } = prev;
              const dx = event.dx / zoomTransform.k;
              
              if (type === 'se' || type === 'ne') w = Math.max(100, w + dx);
              else { const d = Math.min(dx, w - 100); x += d; w -= d; }
              
              const oldH = h;
              h = w / ratio;
              if (type === 'ne' || type === 'nw') y -= (h - oldH);
              
              return { ...prev, width: w, height: h, bgX: x, bgY: y };
          });
      }).on("end", () => pushCalibUpdate(calibState)));

  }, [isCalibrating, zoomTransform.k, calibState, pushCalibUpdate]);

  const ghostR = 45; 

  return (
    <div className={cn(
        "w-full h-full relative overflow-hidden bg-[#f0f2f5]",
        isCalibrating && "bg-slate-950"
    )}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        onClick={() => !isCalibrating && onSelectObject?.(null)}
      >
        <rect width="100%" height="100%" fill="transparent" />
        <g ref={containerRef}>
          {/* Background */}
          <g transform={`translate(${calibState.bgX}, ${calibState.bgY})`} ref={bgRef} className={cn(isCalibrating ? "cursor-move" : "pointer-events-none")}>
              {plan.background_image_url && <image href={plan.background_image_url} width={calibState.width} height={calibState.height} preserveAspectRatio="none" style={{ opacity: isCalibrating ? 0.5 : 0.8 }} />}
              {isCalibrating && <rect width={calibState.width} height={calibState.height} fill="none" className="stroke-[#00C4CC] stroke-2 stroke-dasharray-4" />}
          </g>

          {/* Ghost Table */}
          {isCalibrating && (
              <g ref={ghostRef} transform={`translate(${calibState.width / 2 + calibState.bgX + calibState.ghostX}, ${calibState.height / 2 + calibState.bgY + calibState.ghostY})`} className="cursor-grab active:cursor-grabbing">
                  <circle r={ghostR} className="fill-[#00C4CC]/30 stroke-[#00C4CC] stroke-[4px] animate-pulse pointer-events-none" />
                  <text y={-ghostR - 20} textAnchor="middle" className="fill-white text-[14px] font-black uppercase tracking-widest pointer-events-none text-center leading-tight">Scale Reference<tspan x="0" dy="1.2em" className="text-[10px] fill-slate-400">1.8m Round</tspan></text>
                  <circle r={12} className="fill-white/10 hover:fill-white/20 stroke-white/20 stroke-1" />
                  <Move className="h-4 w-4 text-white -translate-x-2 -translate-y-2 opacity-50" />
              </g>
          )}

          {/* Calibration Handles */}
          {isCalibrating && (
              <g transform={`translate(${calibState.bgX}, ${calibState.bgY})`}>
                  <circle data-type="nw" cx={0} cy={0} r={10} className="bg-resizer fill-white stroke-[#00C4CC] stroke-2 cursor-nw-resize shadow-2xl" />
                  <circle data-type="ne" cx={calibState.width} cy={0} r={10} className="bg-resizer fill-white stroke-[#00C4CC] stroke-2 cursor-ne-resize shadow-2xl" />
                  <circle data-type="sw" cx={0} cy={calibState.height} r={10} className="bg-resizer fill-white stroke-[#00C4CC] stroke-2 cursor-sw-resize shadow-2xl" />
                  <circle data-type="se" cx={calibState.width} cy={calibState.height} r={10} className="bg-resizer fill-white stroke-[#00C4CC] stroke-2 cursor-se-resize shadow-2xl" />
              </g>
          )}

          {/* Objects with Context Menu */}
          {!isCalibrating && plan.plan_objects?.sort((a, b) => (a.z_index || 0) - (b.z_index || 0)).map((obj) => (
            <foreignObject 
                key={obj.id}
                x={obj.x} y={obj.y}
                width={obj.width} height={obj.height}
                transform={`rotate(${obj.rotation || 0}, ${obj.x + obj.width / 2}, ${obj.y + obj.height / 2})`}
                className="overflow-visible"
            >
                <ContextMenu>
                    <ContextMenuTrigger className="w-full h-full block">
                        <svg width={obj.width} height={obj.height} className="overflow-visible">
                            <PlanObjectRenderer
                                object={obj}
                                isSelected={selectedObjectId === obj.id}
                                onClick={(e: any) => { e.stopPropagation(); onSelectObject?.(obj.id); }}
                                onDragEnd={(x: number, y: number) => onUpdateObjectPosition?.(obj.id, x, y)}
                                zoomScale={zoomTransform.k}
                            />
                        </svg>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48 shadow-2xl border-slate-200">
                        <ContextMenuItem onClick={() => onCreateObject?.({ ...obj, id: undefined, x: obj.x + 20, y: obj.y + 20, table_assignments: [] })} className="gap-2 font-bold text-xs">
                            <Copy className="h-3.5 w-3.5" />
                            Duplicate (Cmd+D)
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onUpdateObject?.(obj.id, { locked: !obj.locked })} className="gap-2 font-bold text-xs">
                            {obj.locked ? <Unlock className="h-3.5 w-3.5 text-orange-500" /> : <Lock className="h-3.5 w-3.5" />}
                            {obj.locked ? 'Unlock Element' : 'Lock Element'}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onDeleteObject?.(obj.id)} className="gap-2 font-bold text-xs text-destructive focus:bg-destructive/5 focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Element
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </foreignObject>
          ))}
        </g>
      </svg>
    </div>
  );
}

function PlanObjectRenderer({ object, isSelected, onClick, onDragEnd, zoomScale }: any) {
  const gRef = useRef<SVGGElement>(null);
  
  // DRAGGABLE LOGIC (D3)
  const deltaPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    
    const drag = d3.drag<SVGGElement, unknown>()
      .on("start", () => {
          if (object.locked) return;
          deltaPos.current = { x: 0, y: 0 };
      })
      .on("drag", (event) => {
          if (object.locked) return;
          deltaPos.current.x += event.dx / zoomScale;
          deltaPos.current.y += event.dy / zoomScale;
          g.attr("transform", `translate(${deltaPos.current.x}, ${deltaPos.current.y})`);
      })
      .on("end", () => {
          if (object.locked) return;
          onDragEnd(object.x + deltaPos.current.x, object.y + deltaPos.current.y);
          g.attr("transform", `translate(0,0)`);
      });

    g.call(drag);
    return () => { g.on(".drag", null); };
  }, [object.locked, onDragEnd, zoomScale, object.x, object.y]);

  // DROPPABLE LOGIC (dnd-kit)
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-${object.id}`,
    disabled: object.object_type !== 'table',
    data: {
        type: 'table',
        object
    }
  });

  const commonClass = cn(isSelected && "stroke-[#00C4CC] stroke-[3px]");
  const showCapacity = object.object_type === 'table' && object.capacity !== null;
  const isOverCapacity = showCapacity && (object.table_assignments?.length || 0) > object.capacity;

  return (
    <g 
        ref={(node) => {
            gRef.current = node;
            setDropRef(node as any);
        }}
        onClick={onClick} 
        transform={`translate(0,0)`}
        className={cn(object.locked ? "cursor-default" : "cursor-move")}
    >
      {/* Visual drop indicator */}
      {isOver && (
          <rect 
            width={object.width + 10} 
            height={object.height + 10} 
            x={-5} y={-5}
            rx={8}
            className="fill-primary/20 stroke-primary stroke-2 animate-pulse"
          />
      )}

      {object.object_type === 'table' ? (
          object.width === object.height ? (
            <circle cx={object.width / 2} cy={object.height / 2} r={object.width / 2} className={cn("fill-white stroke-slate-400 stroke-2", commonClass)} />
          ) : (
            <rect width={object.width} height={object.height} rx={4} className={cn("fill-white stroke-slate-400 stroke-2", commonClass)} />
          )
      ) : (
          <rect width={object.width} height={object.height} className={cn("fill-slate-100 stroke-slate-300 stroke-dasharray-4", commonClass)} />
      )}
      
      <g transform={`translate(${object.width / 2}, ${object.height / 2})`} className="pointer-events-none text-center">
          {object.label && (
            <text textAnchor="middle" dominantBaseline="middle" dy={showCapacity ? "-0.6em" : "0"} className={cn("font-black fill-slate-700 text-[10px] select-none uppercase tracking-tighter")}>
                {object.label}
            </text>
          )}
          {showCapacity && (
              <text textAnchor="middle" dominantBaseline="middle" dy={object.label ? "0.8em" : "0"} className={cn("font-black text-[9px] select-none", isOverCapacity ? "fill-destructive" : "fill-primary")}>
                  {object.table_assignments?.length || 0}/{object.capacity}
              </text>
          )}
      </g>
    </g>
  );
}
