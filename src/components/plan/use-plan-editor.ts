"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plan, PlanObject } from "@/lib/api/plan/response";
import { batchUpdatePlanObjects, updatePlan } from "@/lib/api/plan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";

export function usePlanEditor(initialPlan: Plan) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const selectedObject = useMemo(() => 
    plan.plan_objects?.find(o => o.id === selectedObjectId) || null
  , [plan.plan_objects, selectedObjectId]);

  const batchMutation = useMutation({
    mutationFn: (objects: Partial<PlanObject>[]) => batchUpdatePlanObjects(plan.id.toString(), objects),
  });

  const planSettingsMutation = useMutation({
    mutationFn: (updates: Partial<Plan>) => updatePlan(plan.id.toString(), updates),
  });

  // Debounced API update for positions
  const debouncedBatchUpdate = useCallback(
    debounce((updates: Partial<PlanObject>[]) => {
      batchMutation.mutate(updates);
    }, 500),
    [plan.id]
  );

  const debouncedPlanUpdate = useCallback(
    debounce((updates: Partial<Plan>) => {
      planSettingsMutation.mutate(updates);
    }, 500),
    [plan.id]
  );

  const updateObjectPosition = useCallback((id: number, x: number, y: number) => {
    setPlan(prev => ({
      ...prev,
      plan_objects: prev.plan_objects?.map(obj => 
        obj.id === id ? { ...obj, x, y } : obj
      )
    }));

    debouncedBatchUpdate([{ id, x, y }]);
  }, [debouncedBatchUpdate]);

  const updateObject = useCallback((id: number, updates: Partial<PlanObject>) => {
    setPlan(prev => ({
        ...prev,
        plan_objects: prev.plan_objects?.map(obj => 
          obj.id === id ? { ...obj, ...updates } : obj
        )
      }));
  
      batchMutation.mutate([{ id, ...updates }]);
  }, [batchMutation]);

  const updatePlanSettings = useCallback((updates: Partial<Plan>) => {
    setPlan(prev => ({
        ...prev,
        ...updates
    }));

    debouncedPlanUpdate(updates);
  }, [debouncedPlanUpdate]);

  return {
    plan,
    selectedObjectId,
    selectedObject,
    setSelectedObjectId,
    updateObjectPosition,
    updateObject,
    updatePlanSettings,
    isSaving: batchMutation.isPending || planSettingsMutation.isPending
  };
}
