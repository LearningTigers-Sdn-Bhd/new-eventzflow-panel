"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface PlanCanvasProps {
  plan: Plan;
  selectedObjectId?: number | null;
  activeTool: 'select' | 'floor' | 'eraser';
  onSelectObject?: (id: number | null) => void;
  onUpdateObjectPosition?: (id: number, x: number, y: number) => void;
  onResizeObject?: (id: number, width: number, height: number, x?: number, y?: number) => void;
  onCreateObject?: (data: { object_type: string, x: number, y: number, width: number, height: number }) => void;
}

export function PlanCanvas({
  plan,
  selectedObjectId,
  activeTool,
  onSelectObject,
  onUpdateObjectPosition,
  onResizeObject,
  onCreateObject,
}: PlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [drawingStart, setDrawingStart] = useState<{x: number, y: number} | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{x: number, y: number} | null>(null);

  const getCanvasCoords = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return {x: 0, y: 0};
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - zoomTransform.x) / zoomTransform.k;
    const y = (e.clientY - rect.top - zoomTransform.y) / zoomTransform.k;
    return { x, y };
  }, [zoomTransform]);

  // Refs for stable access in effects
  const planObjectsRef = useRef(plan.plan_objects);
  const onUpdatePositionRef = useRef(onUpdateObjectPosition);
  
  useEffect(() => {
    planObjectsRef.current = plan.plan_objects;
    onUpdatePositionRef.current = onUpdateObjectPosition;
  }, [plan.plan_objects, onUpdateObjectPosition]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .filter((event) => {
          // Disable zoom/pan when floor tool is active or when eraser is active
          // and the user is clicking on something
          if (activeTool === 'floor') return false;
          if (activeTool === 'eraser' && event.type === 'mousedown') return false;
          return !event.button;
      })
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);
  }, [activeTool]);

  // Keyboard Nudge
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!selectedObjectId) return;
          const obj = planObjectsRef.current?.find(o => o.id === selectedObjectId);
          if (!obj || obj.locked) return;

          const step = e.shiftKey ? 10 : 1;
          let newX = obj.x;
          let newY = obj.y;

          switch (e.key) {
              case "ArrowLeft": newX -= step; break;
              case "ArrowRight": newX += step; break;
              case "ArrowUp": newY -= step; break;
              case "ArrowDown": newY += step; break;
              default: return;
          }

          // Clamp
          newX = Math.max(0, Math.min(plan.canvas_width - obj.width, newX));
          newY = Math.max(0, Math.min(plan.canvas_height - obj.height, newY));

          e.preventDefault();
          onUpdatePositionRef.current?.(obj.id, newX, newY);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, plan.canvas_width, plan.canvas_height]);

  const handleObjectClick = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onSelectObject?.(id);
  }, [onSelectObject]);

  const handleCanvasClick = useCallback(() => {
    onSelectObject?.(null);
  }, [onSelectObject]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'floor') {
        const coords = getCanvasCoords(e);
        setDrawingStart(coords);
        setCurrentMousePos(coords);
    }
  };

  useEffect(() => {
    if (!drawingStart) return;

    const handleMouseMove = (e: MouseEvent) => {
        const coords = getCanvasCoords(e);
        setCurrentMousePos(coords);
    };

    const handleMouseUp = () => {
        if (drawingStart && currentMousePos) {
            const x = Math.min(drawingStart.x, currentMousePos.x);
            const y = Math.min(drawingStart.y, currentMousePos.y);
            const width = Math.abs(drawingStart.x - currentMousePos.x);
            const height = Math.abs(drawingStart.y - currentMousePos.y);

            if (width > 10 && height > 10) {
                onCreateObject?.({
                    object_type: 'floor',
                    x, y, width, height
                });
            }
        }
        setDrawingStart(null);
        setCurrentMousePos(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drawingStart, currentMousePos, getCanvasCoords, onCreateObject]);

  const getPreviewLabel = () => {
      if (!drawingStart || !currentMousePos) return null;
      const width = Math.abs(drawingStart.x - currentMousePos.x);
      const height = Math.abs(drawingStart.y - currentMousePos.y);
      const ppu = plan.pixels_per_unit || 20;
      return `${(width / ppu).toFixed(1)}m x ${(height / ppu).toFixed(1)}m`;
  };

  return (
    <div className={cn(
        "w-full h-full relative overflow-hidden bg-slate-100",
        activeTool === 'floor' ? "cursor-crosshair" : "cursor-default",
        activeTool === 'eraser' ? "cursor-cell" : ""
    )}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
      >
        {/* Transparent catch-all rect for mouse events */}
        <rect width="100%" height="100%" fill="transparent" />
        <g ref={containerRef}>
          {/* Objects */}
          {plan.plan_objects?.sort((a, b) => (a.z_index || 0) - (b.z_index || 0)).map((obj) => (
            <PlanObjectRenderer
              key={obj.id}
              plan={plan}
              object={obj}
              isSelected={selectedObjectId === obj.id}
              onClick={(e) => handleObjectClick(e, obj.id)}
              onDrag={(x, y) => onUpdateObjectPosition?.(obj.id, x, y)}
              onResize={(id, w, h, x, y) => onResizeObject?.(id, w, h, x, y)}
              zoomScale={zoomTransform.k}
            />
          ))}

          {/* Drawing Preview */}
          {drawingStart && currentMousePos && (
              <g className="pointer-events-none">
                  <rect
                    x={Math.min(drawingStart.x, currentMousePos.x)}
                    y={Math.min(drawingStart.y, currentMousePos.y)}
                    width={Math.abs(drawingStart.x - currentMousePos.x)}
                    height={Math.abs(drawingStart.y - currentMousePos.y)}
                    className="fill-primary/10 stroke-primary stroke-2 stroke-dasharray-4"
                  />
                  <rect
                    x={Math.max(drawingStart.x, currentMousePos.x) - 60}
                    y={Math.min(drawingStart.y, currentMousePos.y) - 25}
                    width={80}
                    height={20}
                    rx={4}
                    className="fill-primary shadow-lg"
                  />
                  <text
                    x={Math.max(drawingStart.x, currentMousePos.x) - 20}
                    y={Math.min(drawingStart.y, currentMousePos.y) - 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-primary-foreground text-[10px] font-bold"
                  >
                    {getPreviewLabel()}
                  </text>
              </g>
          )}
        </g>
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background border rounded-md p-1 shadow-sm">
        <button 
            className="p-1 hover:bg-muted rounded" 
            onClick={() => {
                if (svgRef.current) {
                    d3.select(svgRef.current).transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.2);
                }
            }}
        >
            +
        </button>
        <div className="text-[10px] text-center font-mono">
            {Math.round(zoomTransform.k * 100)}%
        </div>
        <button 
            className="p-1 hover:bg-muted rounded"
            onClick={() => {
                if (svgRef.current) {
                    d3.select(svgRef.current).transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
                }
            }}
        >
            -
        </button>
      </div>
    </div>
  );
}

interface PlanObjectRendererProps {
  plan: Plan;
  object: PlanObject;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDrag: (x: number, y: number) => void;
  onResize: (id: number, width: number, height: number, x?: number, y?: number) => void;
  zoomScale: number;
}

function PlanObjectRenderer({
  plan,
  object,
  isSelected,
  onClick,
  onDrag,
  onResize,
  zoomScale,
}: PlanObjectRendererProps) {
  const gRef = useRef<SVGGElement>(null);
  const onDragRef = useRef(onDrag);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onDragRef.current = onDrag;
    onResizeRef.current = onResize;
  }, [onDrag, onResize]);
  
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-${object.id}`,
    disabled: object.object_type !== 'table',
    data: {
        type: 'table',
        object
    }
  });

  const isInsideFloor = useCallback((x: number, y: number, w: number, h: number) => {
    const floors = plan.plan_objects?.filter(o => o.object_type === 'floor') || [];
    if (floors.length === 0) return true;

    return floors.some(floor => {
        // Simple bounding box check for now
        // This can be expanded for rotated floors or paths
        return x >= floor.x && 
               y >= floor.y && 
               (x + w) <= (floor.x + floor.width) && 
               (y + h) <= (floor.y + floor.height);
    });
  }, [plan.plan_objects]);

  useEffect(() => {
    if (!gRef.current || object.locked || (object.object_type === 'floor' && !isSelected)) return;

    const g = d3.select(gRef.current);
    let currentX = object.x;
    let currentY = object.y;

    const drag = d3.drag<SVGGElement, unknown>()
      .on("start", (event) => {
          currentX = object.x;
          currentY = object.y;
      })
      .on("drag", (event) => {
        // Apply deltas
        const nextX = currentX + event.dx / zoomScale;
        const nextY = currentY + event.dy / zoomScale;

        if (object.object_type !== 'floor') {
          // Collision detection: check if within floors
          if (isInsideFloor(nextX, nextY, object.width, object.height)) {
            currentX = nextX;
            currentY = nextY;
          }
        } else {
          // Floors can move freely
          currentX = nextX;
          currentY = nextY;
        }

        onDragRef.current(currentX, currentY);
      });

    g.call(drag);
  }, [object.locked, plan.canvas_width, plan.canvas_height, object.width, object.height, object.object_type, isSelected, isInsideFloor]);

  // Resize Handler
  const handleResize = (e: d3.D3DragEvent<SVGRectElement, unknown, unknown>, type: string) => {
    e.sourceEvent.stopPropagation();
    let newWidth = object.width;
    let newHeight = object.height;
    let newX = object.x;
    let newY = object.y;

    const dx = e.dx / zoomScale;
    const dy = e.dy / zoomScale;

    if (type.includes('e')) newWidth = Math.max(20, object.width + dx);
    if (type.includes('s')) newHeight = Math.max(20, object.height + dy);
    
    // For floors, we also allow resizing from NW
    if (type.includes('w')) {
        const deltaX = Math.min(dx, object.width - 20);
        newX = object.x + deltaX;
        newWidth = object.width - deltaX;
    }
    if (type.includes('n')) {
        const deltaY = Math.min(dy, object.height - 20);
        newY = object.y + deltaY;
        newHeight = object.height - deltaY;
    }

    if (object.object_type !== 'floor') {
        if (!isInsideFloor(newX, newY, newWidth, newHeight)) return;
    }

    onResizeRef.current(object.id, newWidth, newHeight, newX, newY);
  };

  useEffect(() => {
    if (!isSelected || object.locked) return;
    
    let dragType: string | null = null;
    const resizers = d3.select(gRef.current).selectAll<SVGRectElement, unknown>(".resizer");
    
    resizers.call(d3.drag<SVGRectElement, unknown>()
      .on("start", function(event) {
          dragType = d3.select(this).attr("data-type");
      })
      .on("drag", (event) => {
          if (dragType) {
              handleResize(event, dragType);
          }
      })
      .on("end", () => {
          dragType = null;
      })
    );
  }, [isSelected, object.locked, object.width, object.height, object.x, object.y, isInsideFloor]);

  const isOverCapacity = object.object_type === 'table' && 
    object.capacity !== null && 
    (object.table_assignments?.length || 0) > object.capacity;

  const renderShape = () => {
    switch (object.object_type) {
      case "table":
        if (object.width === object.height) {
          // Round Table
          return (
            <circle
              cx={object.width / 2}
              cy={object.height / 2}
              r={object.width / 2}
              className={cn(
                "fill-white stroke-slate-400 stroke-2 transition-colors",
                isSelected && "stroke-primary stroke-[3px]",
                isOverCapacity && "stroke-destructive stroke-[3px]"
              )}
            />
          );
        }
        // Rect Table
        return (
          <rect
            width={object.width}
            height={object.height}
            rx={4}
            className={cn(
              "fill-white stroke-slate-400 stroke-2 transition-colors",
              isSelected && "stroke-primary stroke-[3px]",
              isOverCapacity && "stroke-destructive stroke-[3px]"
            )}
          />
        );
      case "stage":
        return (
            <rect
              width={object.width}
              height={object.height}
              className="fill-slate-200 stroke-slate-400"
            />
          );
      case "wall":
        return (
            <rect
              width={object.width}
              height={object.height}
              className="fill-slate-800"
            />
          );
      case "door":
        return (
            <g>
                <rect
                    width={object.width}
                    height={object.height}
                    className="fill-white stroke-slate-800 stroke-2"
                />
                <path 
                    d={`M 0,0 Q ${object.width},0 ${object.width},${object.height}`}
                    className="fill-none stroke-slate-400 stroke-1 stroke-dasharray-2"
                />
            </g>
        );
      case "floor":
        return (
            <g>
                {object.path ? (
                    <path
                        d={object.path}
                        className={cn(
                            "fill-white stroke-slate-300",
                            isSelected && "stroke-primary stroke-2"
                        )}
                    />
                ) : (
                    <rect
                        width={object.width}
                        height={object.height}
                        className={cn(
                            "fill-white stroke-slate-300",
                            isSelected && "stroke-primary stroke-2"
                        )}
                    />
                )}
                <defs>
                    <pattern id="floor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-100" />
                    </pattern>
                </defs>
                {object.path ? (
                     <path d={object.path} fill="url(#floor-grid)" className="pointer-events-none" />
                ) : (
                     <rect width={object.width} height={object.height} fill="url(#floor-grid)" className="pointer-events-none" />
                )}
            </g>
        );
      case "label":
        return null; // Just show text
      default:
        return (
          <rect
            width={object.width}
            height={object.height}
            className="fill-slate-100 stroke-slate-300 stroke-dasharray-4"
          />
        );
    }
  };

  return (
    <g
      ref={(node) => {
        gRef.current = node;
        setDropRef(node as any);
      }}
      transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation || 0}, ${object.width / 2}, ${object.height / 2})`}
      onClick={onClick}
      className={cn("cursor-move", object.locked && "cursor-default")}
    >
      {renderShape()}
      
      {/* Table Drop Overlay */}
      {object.object_type === 'table' && isOver && (
          <circle
              cx={object.width / 2}
              cy={object.height / 2}
              r={object.width / 2 + 5}
              className="fill-primary/20 stroke-primary stroke-2 animate-pulse pointer-events-none"
          />
      )}
      {/* Label */}
      {object.label && (
        <text
          x={object.width / 2}
          y={object.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={cn(
              "font-medium pointer-events-none fill-slate-600",
              object.object_type === 'label' ? "text-lg font-bold fill-slate-900" : "text-[10px]"
          )}
        >
          {object.label}
        </text>
      )}

      {/* Capacity Badge for Tables */}
      {object.object_type === 'table' && object.capacity !== null && (
          <g transform={`translate(${object.width - 15}, -15)`}>
              <rect 
                width={30} 
                height={16} 
                rx={8} 
                className={cn(
                    "fill-primary transition-colors",
                    isOverCapacity && "fill-destructive animate-pulse"
                )} 
              />
              <text 
                x={15}
                y={8}
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="fill-primary-foreground text-[8px] font-bold pointer-events-none"
              >
                  {object.table_assignments?.length || 0}/{object.capacity}
              </text>
          </g>
      )}

      {/* Resize Handles */}
      {isSelected && !object.locked && (
          <g className="resizers">
              <rect data-type="nw" x={-4} y={-4} width={8} height={8} className="resizer fill-white stroke-primary cursor-nw-resize" />
              <rect data-type="ne" x={object.width - 4} y={-4} width={8} height={8} className="resizer fill-white stroke-primary cursor-ne-resize" />
              <rect data-type="sw" x={-4} y={object.height - 4} width={8} height={8} className="resizer fill-white stroke-primary cursor-sw-resize" />
              <rect data-type="se" x={object.width - 4} y={object.height - 4} width={8} height={8} className="resizer fill-white stroke-primary cursor-se-resize" />
              <rect data-type="n" x={object.width / 2 - 4} y={-4} width={8} height={8} className="resizer fill-white stroke-primary cursor-n-resize" />
              <rect data-type="s" x={object.width / 2 - 4} y={object.height - 4} width={8} height={8} className="resizer fill-white stroke-primary cursor-s-resize" />
              <rect data-type="e" x={object.width - 4} y={object.height / 2 - 4} width={8} height={8} className="resizer fill-white stroke-primary cursor-e-resize" />
              <rect data-type="w" x={-4} y={object.height / 2 - 4} width={8} height={8} className="resizer fill-white stroke-primary cursor-w-resize" />
          </g>
      )}
    </g>
  );
}
