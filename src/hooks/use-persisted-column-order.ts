"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

/**
 * Reconciles a persisted column order against the table's current leaf
 * columns, so columns added after the order was saved (e.g. new custom
 * label fields) don't land after sticky-right columns like Actions.
 * - Drops ids that no longer exist.
 * - Appends any current column not yet in the saved order (in column-def
 *   order), right before the sticky-right columns.
 * - Always pins sticky-right columns (meta.sticky === "right") last.
 */
export function reconcileColumnOrder<TData>(
	columnOrder: string[],
	columns: ColumnDef<TData>[],
): string[] {
	const leafIds = columns.map(
		(col) => col.id ?? ("accessorKey" in col ? String(col.accessorKey) : ""),
	);
	const stickyRightIds = columns
		.filter((col) => col.meta?.sticky === "right")
		.map(
			(col) => col.id ?? ("accessorKey" in col ? String(col.accessorKey) : ""),
		);

	if (columnOrder.length === 0) {
		// No saved order — column-def order already ends with Actions.
		return columnOrder;
	}

	const known = new Set(leafIds);
	const ordered = columnOrder.filter(
		(id) => known.has(id) && !stickyRightIds.includes(id),
	);
	const missing = leafIds.filter(
		(id) => id && !ordered.includes(id) && !stickyRightIds.includes(id),
	);

	return [...ordered, ...missing, ...stickyRightIds];
}

/**
 * Column order state persisted to localStorage under `storageKey`.
 * Empty array means "use the table's default (column-def) order".
 */
export function usePersistedColumnOrder(storageKey: string) {
	const [columnOrder, setColumnOrderState] = React.useState<string[]>([]);

	// Hydrate from localStorage after mount — this is a "use client" component
	// but Next.js still server-renders it, where localStorage doesn't exist.
	// Reading in an effect keeps this client-only and avoids a hydration
	// mismatch that would otherwise drop the persisted order.
	React.useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) setColumnOrderState(JSON.parse(raw) as string[]);
		} catch {
			// ignore corrupt/inaccessible storage
		}
	}, [storageKey]);

	const setColumnOrder = React.useCallback(
		(order: string[] | ((prev: string[]) => string[])) => {
			setColumnOrderState((prev) => {
				const next = typeof order === "function" ? order(prev) : order;
				try {
					localStorage.setItem(storageKey, JSON.stringify(next));
				} catch {
					// ignore quota / private-mode errors
				}
				return next;
			});
		},
		[storageKey],
	);

	const resetColumnOrder = React.useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
		} catch {
			// ignore inaccessible storage
		}
		setColumnOrderState([]);
	}, [storageKey]);

	return [columnOrder, setColumnOrder, resetColumnOrder] as const;
}
