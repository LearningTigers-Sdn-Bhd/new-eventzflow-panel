"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { batchUpdatePlanObjects, updatePlan } from "@/lib/api/plan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";

export function usePlanEditor(initialPlan: Plan) {
  const [history, setHistory] = useState<Plan[]>([initialPlan]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const plan = history[historyIndex];

  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const pendingUpdates = useRef<Map<number, Partial<PlanObject>>>(new Map());

  const setPlan = (newPlan: Plan | ((p: Plan) => Plan)) => {
    const nextPlan = typeof newPlan === 'function' ? newPlan(plan) : newPlan;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextPlan);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  useEffect(() => {
    setHistory([initialPlan]);
    setHistoryIndex(0);
  }, [initialPlan]);

  const selectedObject = useMemo(() => 
    plan.plan_objects?.find(o => o.id === selectedObjectId) || null
  , [plan.plan_objects, selectedObjectId]);

  const batchMutation = useMutation({
    mutationFn: (objects: Partial<PlanObject>[]) => batchUpdatePlanObjects(plan.id.toString(), objects),
    onSuccess: () => {
        pendingUpdates.current.clear();
    }
  });

  const planSettingsMutation = useMutation({
    mutationFn: (updates: Partial<Plan>) => updatePlan(plan.id.toString(), updates),
  });

  const debouncedSync = useMemo(() => 
    debounce(() => {
      if (pendingUpdates.current.size === 0) return;
      
      const updates = Array.from(pendingUpdates.current.entries()).map(([id, update]) => ({
        id,
        ...update
      }));
      
      batchMutation.mutate(updates);
    }, 1000),
    [batchMutation, plan.id]
  );

  const debouncedPlanUpdate = useMemo(() => 
    debounce((updates: Partial<Plan>) => {
      planSettingsMutation.mutate(updates);
    }, 1000),
    [planSettingsMutation, plan.id]
  );

  // New function to force immediate save
  const savePendingChanges = useCallback(async () => {
      if (pendingUpdates.current.size === 0) return;
      debouncedSync.flush();
      // Wait for the mutation to finish if possible
      if (batchMutation.isPending) {
          await new Promise(resolve => setTimeout(resolve, 500));
      }
  }, [debouncedSync, batchMutation.isPending]);

  const updateObject = useCallback((id: number, updates: Partial<PlanObject>) => {
    setPlan(prev => {
        const updatedObjects = prev.plan_objects?.map(obj => 
            obj.id === id ? { ...obj, ...updates } : obj
        );

        let newCanvasWidth = prev.canvas_width;
        let newCanvasHeight = prev.canvas_height;

        const updatedObj = updatedObjects?.find(o => o.id === id);
        if (updatedObj?.object_type === 'floor') {
            const floorObjects = updatedObjects?.filter(o => o.object_type === 'floor') || [];
            newCanvasWidth = Math.max(...floorObjects.map(o => (o.x || 0) + (o.width || 0)), 0);
            newCanvasHeight = Math.max(...floorObjects.map(o => (o.y || 0) + (o.height || 0)), 0);
        }

        if (newCanvasWidth !== prev.canvas_width || newCanvasHeight !== prev.canvas_height) {
            debouncedPlanUpdate({ canvas_width: newCanvasWidth, canvas_height: newCanvasHeight });
        }

        return {
          ...prev,
          plan_objects: updatedObjects,
          canvas_width: newCanvasWidth,
          canvas_height: newCanvasHeight
        };
      });
  
      const current = pendingUpdates.current.get(id) || {};
      pendingUpdates.current.set(id, { ...current, ...updates });
      debouncedSync();
  }, [debouncedSync, debouncedPlanUpdate]);

  const updateObjectPosition = useCallback((id: number, x: number, y: number) => {
    updateObject(id, { x, y });
  }, [updateObject]);

  const updatePlanSettings = useCallback((updates: Partial<Plan>) => {
    setPlan(prev => ({
        ...prev,
        ...updates
    }));

    debouncedPlanUpdate(updates);
  }, [debouncedPlanUpdate]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    plan,
    selectedObjectId,
    selectedObject,
    setSelectedObjectId,
    updateObjectPosition,
    updateObject,
    updatePlanSettings,
    savePendingChanges,
    isSaving: batchMutation.isPending || planSettingsMutation.isPending,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
