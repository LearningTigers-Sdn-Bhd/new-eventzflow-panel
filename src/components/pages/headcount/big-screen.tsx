"use client";

import { useEffect, useState } from "react";
import { usePublicDisplay } from "@/hooks/use-event-halls";
import type { PublicDisplay } from "@/lib/api/event/hall";
import { cn } from "@/lib/utils";
import {
	floorLabel,
	formatCount,
	occupancyPercent,
	occupancyTone,
	statusMessage,
	toneClasses,
} from "./format";

/** The one-word state a visitor at the door cares about. */
function crowdWord(percent: number | null): string {
	if (percent === null) return "";
	if (percent > 100) return "Over capacity";
	if (percent >= 70) return "Getting busy";
	return "Space available";
}

function Bar({
	percent,
	className,
}: {
	percent: number | null;
	className: string;
}) {
	if (percent === null) return null;
	return (
		<div
			className="h-full w-full bg-muted"
			role="img"
			aria-label={`${percent}% full`}
		>
			<div
				className={cn("h-full transition-all", className)}
				style={{ width: `${Math.min(percent, 100)}%` }}
			/>
		</div>
	);
}

function Message({ title, text }: { title: string; text: string }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
			<p className="font-semibold text-2xl">{title}</p>
			<p className="max-w-md text-muted-foreground">{text}</p>
		</div>
	);
}

/** Time of day, ticking, so a frozen screen is obvious. */
function useClock() {
	const [now, setNow] = useState<string>("");
	useEffect(() => {
		const tick = () => setNow(new Date().toLocaleTimeString());
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

function Hero({ data }: { data: PublicDisplay }) {
	const percent = occupancyPercent(data.insideNow, data.capacity);
	const tone = toneClasses[occupancyTone(percent)];

	return (
		<section className="space-y-4" aria-live="polite">
			<p
				className={cn(
					"font-semibold text-2xl uppercase tracking-wide",
					tone.text,
				)}
			>
				{crowdWord(percent) || "People inside now"}
			</p>
			<p
				className={cn(
					"font-bold tabular-nums leading-none",
					"text-[clamp(6rem,24vw,18rem)]",
					tone.text,
				)}
			>
				{formatCount(data.insideNow)}
			</p>
			<p className="text-muted-foreground text-xl">
				inside now
				{data.capacity
					? ` · capacity ${formatCount(data.capacity)}${percent !== null ? ` · ${percent}% full` : ""}`
					: ""}
			</p>
			<div className="h-6">
				<Bar percent={percent} className={tone.bar} />
			</div>
		</section>
	);
}

function Places({ data }: { data: PublicDisplay }) {
	if (data.halls.length === 0) return null;

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{data.levels.map((level) => {
				const halls = data.halls.filter((h) => h.floor === level.floor);
				const levelPercent = occupancyPercent(level.insideNow, level.capacity);

				return (
					<div key={level.floor ?? "none"} className="space-y-3 border p-5">
						<div className="flex items-baseline justify-between gap-3">
							<h2 className="font-semibold text-xl">
								{floorLabel(level.floor)}
							</h2>
							<p className="text-muted-foreground tabular-nums">
								{formatCount(level.insideNow)}
								{level.capacity ? ` / ${formatCount(level.capacity)}` : ""}
							</p>
						</div>
						<div className="h-3">
							<Bar
								percent={levelPercent}
								className={toneClasses[occupancyTone(levelPercent)].bar}
							/>
						</div>
						<ul className="space-y-3 pt-1">
							{halls.map((hall) => {
								const percent = occupancyPercent(hall.insideNow, hall.capacity);
								const tone =
									toneClasses[
										hall.status === "ok" ? occupancyTone(percent) : "slate"
									];
								return (
									<li key={hall.name} className="space-y-1.5">
										<div className="flex items-baseline justify-between gap-3">
											<span className="font-medium">{hall.name}</span>
											{hall.status === "ok" ? (
												<span
													className={cn(
														"font-semibold text-2xl tabular-nums",
														tone.text,
													)}
												>
													{formatCount(hall.insideNow)}
													{hall.capacity ? (
														<span className="font-normal text-base text-muted-foreground">
															{" "}
															/ {formatCount(hall.capacity)}
														</span>
													) : null}
												</span>
											) : (
												<span className="text-muted-foreground text-sm">
													{
														statusMessage[
															hall.status as keyof typeof statusMessage
														]
													}
												</span>
											)}
										</div>
										{hall.status === "ok" && (
											<div className="h-2">
												<Bar percent={percent} className={tone.bar} />
											</div>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</section>
	);
}

/** The door screen: one big number, then each level and hall. Refreshes itself; keeps the last numbers if a refresh fails. */
export function BigScreen({ slug }: { slug: string }) {
	const { data, isLoading, isError, error } = usePublicDisplay(slug);
	const clock = useClock();

	if (isLoading) {
		return <Message title="Loading..." text="Getting the live numbers." />;
	}

	if (!data) {
		const gone =
			(error as { response?: { status?: number } } | null)?.response?.status ===
			404;
		return (
			<Message
				title={gone ? "This screen isn't available" : "Can't load the numbers"}
				text={
					gone
						? "The event may not exist or may not be published yet. Check the address with the event organizer."
						: "Check the internet connection. This page will try again by itself."
				}
			/>
		);
	}

	if (!data.configured) {
		return (
			<Message
				title={data.eventTitle}
				text="Live numbers aren't available for this event yet."
			/>
		);
	}

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 p-6 sm:p-10">
			<header className="flex flex-wrap items-baseline justify-between gap-3">
				<h1 className="font-semibold text-2xl sm:text-3xl">
					{data.eventTitle}
				</h1>
				<p className="flex items-center gap-2 text-muted-foreground tabular-nums">
					<span
						className={cn(
							"size-2.5",
							isError ? "bg-amber-500" : "bg-emerald-500",
						)}
						aria-hidden="true"
					/>
					{isError
						? "Reconnecting… showing the last numbers"
						: `Live · ${clock}`}
				</p>
			</header>
			<Hero data={data} />
			<Places data={data} />
		</main>
	);
}
