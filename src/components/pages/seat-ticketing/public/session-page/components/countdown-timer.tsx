"use client";

import { TimerIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePublicSeatStore } from "../stores/public-seat-store";

interface CountdownTimerProps {
	expiresAt: string | null;
	onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
	const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
	const isWarning = usePublicSeatStore((state) => state.isWarning);
	const hasExpiredRef = useRef(false);

	useEffect(() => {
		if (!expiresAt) {
			setTimeLeftSeconds(null);
			hasExpiredRef.current = false;
			return;
		}

		hasExpiredRef.current = false;

		const updateTimer = () => {
			const now = Date.now();
			const expiry = new Date(expiresAt).getTime();
			const diff = Math.floor((expiry - now) / 1000);

			if (diff <= 0) {
				setTimeLeftSeconds(0);
				if (!hasExpiredRef.current) {
					hasExpiredRef.current = true;
					onExpire?.();
				}
				return;
			}

			setTimeLeftSeconds(diff);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [expiresAt, onExpire]);

	const timeString = useMemo(() => {
		if (timeLeftSeconds === null) return null;
		const minutes = Math.floor(timeLeftSeconds / 60);
		const seconds = timeLeftSeconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}, [timeLeftSeconds]);

	if (!timeString) return null;

	return (
		<div
			className={cn(
				"flex animate-pulse items-center gap-2 rounded-none border px-3 py-1 backdrop-blur-sm",
				isWarning
					? "border-yellow-950/20 bg-yellow-950/10 text-yellow-950"
					: "border-white/30 bg-white/20 text-white",
			)}
		>
			<TimerIcon className="h-4 w-4" />
			<span className="font-bold font-mono text-sm tracking-wider">
				{timeString}
			</span>
		</div>
	);
}
