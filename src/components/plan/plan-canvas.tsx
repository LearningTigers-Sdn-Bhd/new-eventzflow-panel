"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface PlanCanvasProps {
  plan: Plan;
  selectedObjectId?: number | null;
  onSelectObject?: (id: number | null) => void;
  onUpdateObjectPosition?: (id: number, x: number, y: number) => void;
}

export function PlanCanvas({
  plan,
  selectedObjectId,
  onSelectObject,
  onUpdateObjectPosition,
}: PlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);
  }, []);

  // Keyboard Nudge
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!selectedObjectId) return;
          const obj = plan.plan_objects?.find(o => o.id === selectedObjectId);
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
          onUpdateObjectPosition?.(obj.id, newX, newY);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, plan.plan_objects, onUpdateObjectPosition]);

  const handleObjectClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onSelectObject?.(id);
  };

  const handleCanvasClick = () => {
    onSelectObject?.(null);
  };

  return (
    <div className="w-full h-full relative cursor-crosshair overflow-hidden bg-slate-100">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
      >
        <g ref={containerRef}>
          {/* Background/Grid */}
          <rect
            x={0}
            y={0}
            width={plan.canvas_width}
            height={plan.canvas_height}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          
          {/* Objects */}
          {plan.plan_objects?.map((obj) => (
            <PlanObjectRenderer
              key={obj.id}
              plan={plan}
              object={obj}
              isSelected={selectedObjectId === obj.id}
              onClick={(e) => handleObjectClick(e, obj.id)}
              onDrag={(x, y) => onUpdateObjectPosition?.(obj.id, x, y)}
              zoomScale={zoomTransform.k}
            />
          ))}
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
  zoomScale: number;
}

function PlanObjectRenderer({
  plan,
  object,
  isSelected,
  onClick,
  onDrag,
  zoomScale,
}: PlanObjectRendererProps) {
  const gRef = useRef<SVGGElement>(null);
  
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-${object.id}`,
    disabled: object.object_type !== 'table',
    data: {
        type: 'table',
        object
    }
  });

  useEffect(() => {
    if (!gRef.current || object.locked) return;

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
        currentX += event.dx;
        currentY += event.dy;

        // Clamp to canvas boundaries
        const minX = 0;
        const minY = 0;
        const maxX = plan.canvas_width - object.width;
        const maxY = plan.canvas_height - object.height;

        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));

        onDrag(currentX, currentY);
      });

    g.call(drag);
  }, [object.locked, object.x, object.y, onDrag]);

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
                isSelected && "stroke-primary stroke-[3px]"
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
              isSelected && "stroke-primary stroke-[3px]"
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
      {object.object_type === 'table' && object.capacity && (
          <g transform={`translate(${object.width - 15}, -15)`}>
              <rect 
                width={30} 
                height={16} 
                rx={8} 
                className={cn(
                    "fill-primary transition-colors",
                    (object.table_assignments?.length || 0) > object.capacity && "fill-destructive animate-pulse"
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
    </g>
  );
}
