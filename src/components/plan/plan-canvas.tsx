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

interface AlignmentGuide {
  type: 'h' | 'v';
  pos: number;
}

interface PlanCanvasProps {
  plan: Plan;
  selectedObjectIds?: number[];
  highlightObjectId?: number | null;
  isReadOnly?: boolean;
  hideCapacity?: boolean;
  activeTool?: 'select' | 'floor' | 'eraser';
  isCalibrating?: boolean;
  onSelectObject?: (ids: number[]) => void;
  onUpdateObjectPosition?: (id: number, x: number, y: number) => void;
  onUpdateMultiplePositions?: (updates: { id: number, x: number, y: number }[]) => void;
  onResizeObject?: (id: number, width: number, height: number, x?: number, y?: number) => void;
  onUpdatePlan?: (updates: Partial<Plan>) => void;
  onCreateObject?: (data: { object_type: string, x: number, y: number, width: number, height: number, label?: string, capacity?: number }) => void;
  onDuplicateObjects?: (ids: number[]) => void;
  onDeleteObject?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
  onUpdateObject?: (id: number, updates: Partial<PlanObject>) => void;
}

export function PlanCanvas({
  plan,
  selectedObjectIds = [],
  highlightObjectId,
  isReadOnly,
  hideCapacity,
  activeTool = 'select',
  isCalibrating,
  onSelectObject,
  onUpdateObjectPosition,
  onUpdateMultiplePositions,
  onResizeObject,
  onUpdatePlan,
  onCreateObject,
  onDuplicateObjects,
  onDeleteObject,
  onBulkDelete,
  onUpdateObject,
}: PlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);

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
          if (isReadOnly) return false; // Disable panning/zooming entirely in read-only mode
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

    // Auto-fit to screen logic on first render or when plan size changes
    const svgNode = svgRef.current;
    if (svgNode && plan.canvas_width > 0 && plan.canvas_height > 0) {
      const { width: viewWidth, height: viewHeight } = svgNode.getBoundingClientRect();
      if (viewWidth > 0 && viewHeight > 0) {
        // Less padding in read-only mode to maximize size
        const padding = isReadOnly ? 20 : 60; 
        const scaleX = (viewWidth - padding * 2) / plan.canvas_width;
        const scaleY = (viewHeight - padding * 2) / plan.canvas_height;
        // In read-only mode, allow it to scale up as much as needed to fit the container
        const maxScale = isReadOnly ? Math.min(scaleX, scaleY) : Math.min(scaleX, scaleY, 2);

        const currentTransform = d3.zoomTransform(svgNode);
        if (maxScale > 0 && currentTransform.k === 1 && currentTransform.x === 0 && currentTransform.y === 0) {
          const tx = (viewWidth - plan.canvas_width * maxScale) / 2;
          const ty = (viewHeight - plan.canvas_height * maxScale) / 2;
          svg.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(maxScale));
        }
      }
    }
  }, [activeTool, isCalibrating, isReadOnly, plan.canvas_width, plan.canvas_height]);

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
        "w-full h-full relative overflow-hidden bg-transparent",
        isCalibrating && "bg-slate-950"
    )}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        onClick={() => !isCalibrating && onSelectObject?.([])}
      >
        <defs>
          <filter id="elegant-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.0  0 0 0 0 0.77  0 0 0 0 0.8  0 0 0 1.5 0" result="cyan-glow"/>
            <feMerge>
              <feMergeNode in="cyan-glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="transparent" />
        <g ref={containerRef}>
          {/* Alignment Guides */}
          {activeGuides.map((guide, i) => (
            <line
              key={i}
              x1={guide.type === 'v' ? guide.pos : -5000}
              y1={guide.type === 'h' ? guide.pos : -5000}
              x2={guide.type === 'v' ? guide.pos : 10000}
              y2={guide.type === 'h' ? guide.pos : 10000}
              className="stroke-[#00C4CC] stroke-[1px] stroke-dasharray-4 pointer-events-none"
              style={{ filter: "drop-shadow(0 0 2px rgba(0, 196, 204, 0.5))" }}
            />
          ))}

          {/* Background */}
          <g transform={`translate(${calibState.bgX}, ${calibState.bgY})`} ref={bgRef} className={cn(isCalibrating ? "cursor-move" : "pointer-events-none")}>
              {plan.background_image_url && (
                <image 
                  href={plan.background_image_url} 
                  width={calibState.width} 
                  height={calibState.height} 
                  preserveAspectRatio="xMidYMid meet" 
                  style={{ opacity: isCalibrating ? 0.5 : 0.8 }} 
                />
              )}
              {isCalibrating && <rect width={calibState.width} height={calibState.height} fill="none" className="stroke-[#00C4CC] stroke-2 stroke-dasharray-4" />}
          </g>

          {/* Ghost Table (Reference) */}
          {isCalibrating && (
              <g 
                ref={ghostRef} 
                transform={`translate(${calibState.width / 2 + calibState.bgX + calibState.ghostX}, ${calibState.height / 2 + calibState.bgY + calibState.ghostY})`} 
                className="cursor-grab active:cursor-grabbing group"
              >
                  {/* ENLARGED INVISIBLE DRAG AREA */}
                  <circle r={ghostR * 2} className="fill-transparent pointer-events-all" />
                  
                  {/* Visible Ghost Table UI */}
                  <circle r={ghostR} className="fill-[#00C4CC]/20 stroke-[#00C4CC] stroke-[4px] animate-pulse pointer-events-none group-active:scale-110 transition-transform" />
                  <text y={-ghostR - 20} textAnchor="middle" className="fill-white text-[14px] font-black uppercase tracking-widest pointer-events-none drop-shadow-md">Scale Reference<tspan x="0" dy="1.2em" className="text-[10px] fill-slate-400">1.8m Round</tspan></text>
                  
                  {/* Move Icon center indicator (Removed middle circle per request) */}
                  <g transform="translate(-10, -10)" className="pointer-events-none">
                    <Move className="h-5 w-5 text-white opacity-90 drop-shadow-lg" />
                  </g>
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
                                plan={plan}
                                containerRef={containerRef}
                                isSelected={selectedObjectIds.includes(obj.id)}
                                selectedObjectIds={selectedObjectIds}
                                isHighlighted={highlightObjectId === obj.id}
                                isReadOnly={isReadOnly}
                                hideCapacity={hideCapacity}
                                onClick={(e: any) => { 
                                    if (isReadOnly) return;
                                    e.stopPropagation(); 
                                    
                                    if (e.shiftKey) {
                                      const isAlreadySelected = selectedObjectIds.includes(obj.id);
                                      if (isAlreadySelected) {
                                        onSelectObject?.(selectedObjectIds.filter(id => id !== obj.id));
                                      } else {
                                        onSelectObject?.([...selectedObjectIds, obj.id]);
                                      }
                                    } else {
                                      onSelectObject?.([obj.id]); 
                                    }
                                }}
                                onDragStart={() => setActiveGuides([])}
                                onDragging={(x: number, y: number) => {
                                  const SNAP_THRESHOLD = 5;
                                  const guides: AlignmentGuide[] = [];
                                  let snappedX = x;
                                  let snappedY = y;

                                  // Coordinates of the object being dragged
                                  const dragEdges = {
                                    v: [snappedX, snappedX + obj.width / 2, snappedX + obj.width],
                                    h: [snappedY, snappedY + obj.height / 2, snappedY + obj.height]
                                  };

                                  // Compare with every OTHER object
                                  plan.plan_objects?.forEach(other => {
                                    if (other.id === obj.id || selectedObjectIds.includes(other.id)) return;

                                    const otherEdges = {
                                      v: [other.x, other.x + other.width / 2, other.x + other.width],
                                      h: [other.y, other.y + other.height / 2, other.y + other.height]
                                    };

                                    // Check Vertical Alignment (Aligning X)
                                    dragEdges.v.forEach((dv, dragIdx) => {
                                      otherEdges.v.forEach(ov => {
                                        if (Math.abs(dv - ov) < SNAP_THRESHOLD) {
                                          if (dragIdx === 0) snappedX = ov;
                                          if (dragIdx === 1) snappedX = ov - obj.width / 2;
                                          if (dragIdx === 2) snappedX = ov - obj.width;
                                          guides.push({ type: 'v', pos: ov });
                                        }
                                      });
                                    });

                                    // Check Horizontal Alignment (Aligning Y)
                                    dragEdges.h.forEach((dh, dragIdx) => {
                                      otherEdges.h.forEach(oh => {
                                        if (Math.abs(dh - oh) < SNAP_THRESHOLD) {
                                          if (dragIdx === 0) snappedY = oh;
                                          if (dragIdx === 1) snappedY = oh - obj.height / 2;
                                          if (dragIdx === 2) snappedY = oh - obj.height;
                                          guides.push({ type: 'h', pos: oh });
                                        }
                                      });
                                    });
                                  });

                                  setActiveGuides(guides);
                                  return { x: snappedX, y: snappedY };
                                }}
                                onDragEnd={(x: number, y: number) => {
                                  setActiveGuides([]);
                                  if (selectedObjectIds.length > 1 && selectedObjectIds.includes(obj.id)) {
                                    const dx = x - obj.x;
                                    const dy = y - obj.y;
                                    const updates = plan.plan_objects
                                      ?.filter(o => selectedObjectIds.includes(o.id) && !o.locked)
                                      .map(o => ({
                                        id: o.id,
                                        x: o.x + dx,
                                        y: o.y + dy
                                      })) || [];
                                    onUpdateMultiplePositions?.(updates);
                                  } else {
                                    onUpdateObjectPosition?.(obj.id, x, y);
                                  }
                                }}
                                zoomScale={zoomTransform.k}
                            />
                        </svg>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48 shadow-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                        <ContextMenuItem 
                          onClick={() => {
                            if (selectedObjectIds.includes(obj.id)) {
                              onDuplicateObjects?.(selectedObjectIds);
                            } else {
                              onDuplicateObjects?.([obj.id]);
                            }
                          }} 
                          className="gap-2 font-bold text-xs dark:focus:bg-slate-800"
                        >
                            <Copy className="h-3.5 w-3.5" />
                            {selectedObjectIds.length > 1 && selectedObjectIds.includes(obj.id) ? "Duplicate Selected" : "Duplicate (Cmd+D)"}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onUpdateObject?.(obj.id, { locked: !obj.locked })} className="gap-2 font-bold text-xs dark:focus:bg-slate-800">
                            {obj.locked ? <Unlock className="h-3.5 w-3.5 text-orange-500" /> : <Lock className="h-3.5 w-3.5" />}
                            {obj.locked ? 'Unlock Element' : 'Lock Element'}
                        </ContextMenuItem>
                        <ContextMenuSeparator className="dark:bg-slate-800" />
                        <ContextMenuItem 
                          onClick={() => {
                            if (selectedObjectIds.includes(obj.id)) {
                              onBulkDelete?.(selectedObjectIds);
                            } else {
                              onDeleteObject?.(obj.id);
                            }
                          }} 
                          className="gap-2 font-bold text-xs text-destructive focus:bg-destructive/5 focus:text-destructive dark:focus:bg-destructive/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {selectedObjectIds.length > 1 && selectedObjectIds.includes(obj.id) ? "Delete Selected" : "Delete Element"}
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

function PlanObjectRenderer({ object, plan, containerRef, isSelected, selectedObjectIds, isHighlighted, isReadOnly, hideCapacity, onClick, onDragging, onDragStart, onDragEnd, zoomScale }: any) {
  const gRef = useRef<SVGGElement>(null);
  const deltaPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!gRef.current || isReadOnly) return;
    const g = d3.select(gRef.current);
    
    const drag = d3.drag<SVGGElement, unknown>()
      .on("start", () => {
          if (object.locked) return;
          deltaPos.current = { x: 0, y: 0 };
          onDragStart?.();
      })
      .on("drag", (event) => {
          if (object.locked) return;
          const dx = event.dx / zoomScale;
          const dy = event.dy / zoomScale;
          deltaPos.current.x += dx;
          deltaPos.current.y += dy;
          
          let drawX = deltaPos.current.x;
          let drawY = deltaPos.current.y;

          // Apply Snapping
          if (onDragging) {
            const snapped = onDragging(object.x + drawX, object.y + drawY);
            drawX = snapped.x - object.x;
            drawY = snapped.y - object.y;
            // Update delta to keep the snap sticky
            deltaPos.current.x = drawX;
            deltaPos.current.y = drawY;
          }

          // Move all selected objects together visually
          if (selectedObjectIds.includes(object.id)) {
            d3.select(containerRef.current)
              .selectAll<SVGGElement, any>("g.plan-object-group")
              .filter((d, i, nodes) => {
                const nodeId = d3.select(nodes[i]).attr("data-id");
                return selectedObjectIds.includes(Number(nodeId));
              })
              .attr("transform", `translate(${drawX}, ${drawY})`);
          } else {
            g.attr("transform", `translate(${drawX}, ${drawY})`);
          }
      })
      .on("end", () => {
          if (object.locked) return;
          onDragEnd(object.x + deltaPos.current.x, object.y + deltaPos.current.y);
          
          // Reset all transforms for all plan object groups
          d3.select(containerRef.current)
            .selectAll("g.plan-object-group")
            .attr("transform", "translate(0,0)");
      });

    g.call(drag);
    return () => { g.on(".drag", null); };
  }, [object.locked, onDragEnd, zoomScale, object.x, object.y]);

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-${object.id}`,
    disabled: object.object_type !== 'table',
    data: { type: 'table', object }
  });

  const commonClass = cn(isSelected && "stroke-[#00C4CC] stroke-[3px]");
  const showCapacity = !hideCapacity && object.object_type === 'table' && object.capacity !== null;
  const isOverCapacity = showCapacity && (object.table_assignments?.length || 0) > object.capacity;

  return (
    <g 
        ref={(node) => { gRef.current = node; setDropRef(node as any); }}
        data-id={object.id}
        onClick={onClick} 
        transform={`translate(0,0)`}
        className={cn("plan-object-group", (object.locked || isReadOnly) ? "cursor-default" : "cursor-move")}
    >
      {isOver && <rect width={object.width + 10} height={object.height + 10} x={-5} y={-5} rx={8} className="fill-primary/20 stroke-primary stroke-2 animate-pulse" />}
      {isHighlighted && (
          <g filter="url(#elegant-glow)">
            {object.object_type === 'table' && object.width === object.height ? (
              <circle 
                cx={object.width / 2} cy={object.height / 2} 
                r={(object.width / 2) + 8} 
                className="fill-primary/30 stroke-primary stroke-[4px] animate-pulse" 
              />
            ) : (
              <rect 
                width={object.width + 16} 
                height={object.height + 16} 
                x={-8} y={-8} 
                rx={12} 
                className="fill-primary/30 stroke-primary stroke-[4px] animate-pulse" 
              />
            )}
          </g>
      )}
      {object.object_type === 'table' ? (
          object.width === object.height 
            ? <circle cx={object.width / 2} cy={object.height / 2} r={object.width / 2} className={cn("fill-white stroke-slate-400 stroke-2", commonClass)} /> 
            : <rect width={object.width} height={object.height} rx={4} className={cn("fill-white stroke-slate-400 stroke-2", commonClass)} />
      ) : <rect width={object.width} height={object.height} className={cn("fill-slate-100 stroke-slate-300 stroke-dasharray-4", commonClass)} />}
      
      <g transform={`translate(${object.width / 2}, ${object.height / 2})`} className="pointer-events-none text-center">
          {object.label && <text textAnchor="middle" dominantBaseline="middle" dy={showCapacity ? "-0.6em" : "0"} className={cn("font-black fill-slate-700 text-[10px] select-none uppercase tracking-tighter")}>{object.label}</text>}
          {showCapacity && <text textAnchor="middle" dominantBaseline="middle" dy={object.label ? "0.8em" : "0"} className={cn("font-black text-[9px] select-none", isOverCapacity ? "fill-destructive" : "fill-slate-600")}>{object.table_assignments?.length || 0}/{object.capacity}</text>}
      </g>
    </g>
  );
}
