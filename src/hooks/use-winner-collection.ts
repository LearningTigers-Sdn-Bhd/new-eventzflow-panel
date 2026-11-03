"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	getGifts,
	getInvalidParticipants,
	type UpdateWinnerCollectionRequest,
	updateWinnerCollection,
	type WinnerCollection,
} from "@/lib/api/lucky-draw";
import { parseLegacyCollection } from "@/lib/api/lucky-draw/legacy-collection";

export function useWinnerCollection(
	eventId: string,
	sessionId: number,
	useGifts: boolean,
	open: boolean,
) {
	const client = useQueryClient();
	const key = [
		"lucky-draw",
		useGifts ? "gifts" : "invalid-participants",
		eventId,
		sessionId,
	];
	const giftsQuery = useQuery({
		queryKey: ["lucky-draw", "gifts", eventId, sessionId],
		queryFn: () => getGifts(eventId, sessionId),
		enabled: open && useGifts,
		refetchInterval: open && useGifts ? 5000 : false,
	});
	const winnersQuery = useQuery({
		queryKey: ["lucky-draw", "invalid-participants", eventId, sessionId],
		queryFn: () => getInvalidParticipants(eventId, sessionId),
		enabled: open && !useGifts,
		refetchInterval: open && !useGifts ? 5000 : false,
	});
	const records: Array<
		WinnerCollection & {
			id: number;
			giftId?: number;
			publicId: string;
			voided_at: string | null;
		}
	> = useGifts
		? (giftsQuery.data ?? []).flatMap((gift) =>
				gift.winners.map((winner) => ({
					...winner,
					giftId: gift.id,
					publicId: String(winner.ticket_id ?? winner.visitor_id),
				})),
			)
		: (winnersQuery.data ?? []).map((winner) => ({
				...winner,
				publicId: String(winner.participant.id),
			}));
	const claimed = new Set(
		records
			.filter((record) => !record.voided_at && record.claimed_at)
			.map((record) => record.publicId),
	);
	const takenGifts = Object.fromEntries(
		records
			.filter((record) => !record.voided_at)
			.map((record) => [record.publicId, record.gift_taken ?? ""]),
	);
	const busy = useRef(false);
	const mutation = useMutation({
		mutationFn: ({
			target,
			data,
		}: {
			target: { id: number; giftId?: number };
			data: UpdateWinnerCollectionRequest;
		}) => updateWinnerCollection(eventId, sessionId, target, data),
	});
	const [importing, setImporting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [hasLegacy, setHasLegacy] = useState(false);
	const suffix = `${eventId}:${sessionId}`;
	const receiptKey = `lucky-draw-imported:${suffix}:${useGifts ? "gifts" : "winners"}`;
	useEffect(() => {
		if (!open) return;
		try {
			const legacy = parseLegacyCollection(
				localStorage.getItem(`lucky-draw-claimed:${suffix}`),
				localStorage.getItem(`lucky-draw-gifts:${suffix}`),
			);
			setHasLegacy(legacy.ids.length > 0 && !localStorage.getItem(receiptKey));
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not read browser records",
			);
		}
	}, [open, suffix, receiptKey]);

	const save = async (
		publicId: string,
		data: UpdateWinnerCollectionRequest,
	) => {
		if (busy.current) return false;
		const matches = records.filter(
			(record) => !record.voided_at && record.publicId === publicId,
		);
		if (matches.length !== 1) {
			toast.error(
				"Could not identify a unique winner. Refresh the list before saving.",
			);
			return false;
		}
		busy.current = true;
		setSaving(true);
		try {
			await mutation.mutateAsync({ target: matches[0], data });
			await client.invalidateQueries({ queryKey: key });
			return true;
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Collection details were not saved",
			);
			return false;
		} finally {
			busy.current = false;
			setSaving(false);
		}
	};

	const importLegacy = async () => {
		if (busy.current) return;
		busy.current = true;
		setImporting(true);
		let imported = 0;
		let skipped = 0;
		let unresolved = 0;
		try {
			const legacy = parseLegacyCollection(
				localStorage.getItem(`lucky-draw-claimed:${suffix}`),
				localStorage.getItem(`lucky-draw-gifts:${suffix}`),
			);
			for (const id of legacy.ids) {
				const matches = records.filter(
					(record) => !record.voided_at && record.publicId === id,
				);
				if (matches.length !== 1) {
					skipped++;
					unresolved++;
					continue;
				}
				const result = await mutation.mutateAsync({
					target: matches[0],
					data: {
						claimed: legacy.claimed.has(id),
						gift_taken: legacy.gifts[id] ?? "",
						import_only: true,
					},
				});
				if (result.skipped) skipped++;
				else imported++;
			}
			if (unresolved === 0) {
				localStorage.setItem(receiptKey, "true");
				setHasLegacy(false);
			}
			toast.success(
				`Imported ${imported}. Skipped ${skipped} already edited, missing or ambiguous winners. Browser backup kept.`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Import failed; browser records kept. Retry to continue.",
			);
		} finally {
			await client.invalidateQueries({ queryKey: key });
			busy.current = false;
			setImporting(false);
		}
	};
	return {
		claimed,
		takenGifts,
		toggleClaimed: (id: string) => save(id, { claimed: !claimed.has(id) }),
		setGift: (id: string, value: string) => save(id, { gift_taken: value }),
		isSaving: saving || importing,
		hasLegacy,
		importLegacy,
		isError: useGifts ? giftsQuery.isError : winnersQuery.isError,
	};
}
