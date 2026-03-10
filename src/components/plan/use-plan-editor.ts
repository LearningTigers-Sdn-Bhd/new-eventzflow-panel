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

  const [selectedObjectIds, setSelectedObjectIds] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const pendingUpdates = useRef<Map<number, Partial<PlanObject>>>(new Map());

  const setPlan = useCallback((newPlan: Plan | ((p: Plan) => Plan)) => {
    setHistory(prevHistory => {
      const currentPlan = prevHistory[historyIndex];
      const nextPlan = typeof newPlan === 'function' ? newPlan(currentPlan) : newPlan;
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(nextPlan);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);
  
  useEffect(() => {
    setHistory(prev => {
      // Only reset history if the plan ID actually changed
      if (prev[0]?.id !== initialPlan.id) {
        setSelectedObjectIds([]);
        setHistoryIndex(0);
        return [initialPlan];
      }
      // If it's the same plan, just update the current state with new data from server
      // to avoid losing local un-saved state, we should ideally merge, but for now
      // let's just update the base. To be safe, we will just replace the history.
      // But we MUST NOT clear the selection.
      return [initialPlan];
    });
    setHistoryIndex(0);
  }, [initialPlan]);

  const selectedObjects = useMemo(() => 
    plan.plan_objects?.filter(o => selectedObjectIds.includes(o.id)) || []
  , [plan.plan_objects, selectedObjectIds]);

  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

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

  const updateObjects = useCallback((updates: { id: number, updates: Partial<PlanObject> }[]) => {
    setPlan(prev => {
      const updatedObjects = prev.plan_objects?.map(obj => {
        const update = updates.find(u => u.id === obj.id);
        return update ? { ...obj, ...update.updates } : obj;
      });

      return {
        ...prev,
        plan_objects: updatedObjects,
      };
    });

    updates.forEach(({ id, updates: u }) => {
      const current = pendingUpdates.current.get(id) || {};
      pendingUpdates.current.set(id, { ...current, ...u });
    });
    debouncedSync();
  }, [setPlan, debouncedSync]);

  const updateObject = useCallback((id: number, updates: Partial<PlanObject>) => {
    updateObjects([{ id, updates }]);
  }, [updateObjects]);

  const addObjects = useCallback((newObjects: PlanObject[]) => {
    setPlan(prev => ({
      ...prev,
      plan_objects: [...(prev.plan_objects || []), ...newObjects]
    }));
  }, [setPlan]);

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
    selectedObjectIds,
    selectedObjects,
    selectedObject,
    setSelectedObjectIds,
    updateObjectPosition,
    updateObject,
    updateObjects,
    addObjects,
    updatePlanSettings,
    savePendingChanges,
    isSaving: batchMutation.isPending || planSettingsMutation.isPending,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
