"use client";

import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { usePublicDisplay } from "@/hooks/use-event-halls";
import type { PublicDisplay } from "@/lib/api/event/hall";
import styles from "./big-screen.module.css";
import {
	floorLabel,
	formatCount,
	occupancyPercent,
	occupancyTone,
	statusMessage,
} from "./format";
import { useAutoReload, useFullscreen, useWakeLock } from "./use-kiosk";

const STALE_AFTER_MS = 60_000;

function crowdWord(percent: number | null): string {
	if (percent === null) return "Live occupancy";
	if (percent > 100) return "Over capacity · please wait";
	if (percent === 100) return "Full · please wait";
	if (percent >= 70) return "Getting busy";
	return "Space available";
}

function Bar({ percent }: { percent: number | null }) {
	if (percent === null) return null;
	return (
		<div className={styles.bar} role="img" aria-label={`${percent}% full`}>
			<div style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
		</div>
	);
}

function Message({ title, text }: { title: string; text: string }) {
	return (
		<div className={styles.message}>
			<h1>{title}</h1>
			<p>{text}</p>
		</div>
	);
}

const clockText = (ms: number) =>
	new Date(ms).toLocaleTimeString("en-MY", { timeZone: "Asia/Kuching" });

/** Ticks every second: the time to show, and the same moment in ms for age checks. */
function useClock() {
	const [ms, setMs] = useState(0);
	useEffect(() => {
		const tick = () => setMs(Date.now());
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return { text: ms ? clockText(ms) : "", ms };
}

function Hero({ data }: { data: PublicDisplay }) {
	const percent = occupancyPercent(data.insideNow, data.capacity);
	const status = data.hall ? data.halls[0]?.status : "ok";
	const hallProblem = status && status !== "ok" ? statusMessage[status] : null;
	const count = formatCount(data.insideNow);
	return (
		<section
			className={styles.hero}
			data-tone={
				percent !== null && percent >= 100 ? "red" : occupancyTone(percent)
			}
			aria-live="polite"
		>
			<p className={styles.heroLabel}>
				{data.hall ?? data.level ?? "Overall"} · inside now
			</p>
			<div className={styles.heroFigure}>
				<p
					className={styles.count}
					style={{
						fontSize: `min(${Math.min(38, 160 / count.length)}cqw, 34vh)`,
					}}
				>
					{count}
				</p>
				<p className={styles.countLabel}>{hallProblem ?? "people inside"}</p>
			</div>
			<div>
				<p className={styles.crowd}>{crowdWord(percent)}</p>
				<Bar percent={percent} />
				<div className={styles.capacity}>
					<span>
						{data.capacity
							? `Capacity ${formatCount(data.capacity)}`
							: "Capacity not available"}
					</span>
					{percent !== null && <span>{percent}% full</span>}
				</div>
			</div>
		</section>
	);
}

function Places({ data }: { data: PublicDisplay }) {
	return (
		<section className={styles.places} aria-labelledby="places-heading">
			<div className={styles.sectionHeading}>
				<h2 id="places-heading">
					{data.level ? "Halls on this level" : "Levels & halls"}
				</h2>
				<span>Inside / capacity</span>
			</div>
			{data.halls.length === 0 && (
				<p className={styles.empty}>No halls have been set up yet.</p>
			)}
			{data.levels.map((level) => {
				const percent = occupancyPercent(level.insideNow, level.capacity);
				return (
					<div key={level.floor ?? "none"} className={styles.level}>
						{!data.level && (
							<div
								className={styles.levelHeading}
								data-tone={occupancyTone(percent)}
							>
								<h3>{floorLabel(level.floor)}</h3>
								<p>
									{formatCount(level.insideNow)}
									<span>
										{level.capacity ? ` / ${formatCount(level.capacity)}` : ""}
									</span>
								</p>
							</div>
						)}
						<ul className={styles.halls}>
							{data.halls
								.filter((hall) => hall.floor === level.floor)
								.map((hall) => {
									const hallPercent = occupancyPercent(
										hall.insideNow,
										hall.capacity,
									);
									return (
										<li
											key={hall.name}
											className={styles.hall}
											data-tone={
												hall.status === "ok"
													? occupancyTone(hallPercent)
													: "slate"
											}
										>
											<div className={styles.hallHeading}>
												<span className={styles.hallName}>{hall.name}</span>
												{hall.status === "ok" ? (
													<p className={styles.hallCount}>
														{formatCount(hall.insideNow)}
														<span>
															{hall.capacity
																? ` / ${formatCount(hall.capacity)}`
																: ""}
														</span>
													</p>
												) : (
													<span className={styles.hallStatus}>
														{statusMessage[hall.status]}
													</span>
												)}
											</div>
											{hall.status === "ok" && <Bar percent={hallPercent} />}
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

/** Public display, styled to match the RFID arrival screen. */
export function BigScreen({ slug }: { slug: string }) {
	const [level] = useQueryState("level");
	const [hall] = useQueryState("hall");
	const { data, isLoading, isError, error, dataUpdatedAt } = usePublicDisplay(
		slug,
		level || null,
		hall || null,
	);
	const clock = useClock();
	const fullscreen = useFullscreen();
	useWakeLock();
	useAutoReload();
	if (isLoading)
		return <Message title="Loading..." text="Getting the live numbers." />;
	if (!data) {
		const gone =
			(error as { response?: { status?: number } } | null)?.response?.status ===
			404;
		return (
			<Message
				title={gone ? "This screen isn't available" : "Can't load the numbers"}
				text={
					gone
						? "The event or level may not exist, or the event may not be published yet. Check the address with the event organizer."
						: "Check the internet connection. This page will try again by itself."
				}
			/>
		);
	}
	if (!data.configured)
		return (
			<Message
				title={data.eventTitle}
				text="Live numbers aren't available for this event yet."
			/>
		);
	const stale = isError && clock.ms - dataUpdatedAt >= STALE_AFTER_MS;
	return (
		<main className={styles.screen} data-stale={stale}>
			<header className={styles.header}>
				<h1>{data.eventTitle}</h1>
				<p>{data.hall ?? data.level ?? "Live occupancy"}</p>
			</header>
			<div className={styles.content} data-single={Boolean(data.hall)}>
				<Hero data={data} />
				{!data.hall && <Places data={data} />}
			</div>
			<footer className={styles.footer}>
				<div>
					<p
						className={styles.connection}
						data-status={isError ? "offline" : "live"}
						role="status"
					>
						<span aria-hidden="true" />
						{!isError && "Live"}
						{isError && !stale && "Reconnecting · showing the last numbers"}
						{stale && `Offline · numbers from ${clockText(dataUpdatedAt)}`}
					</p>
					{!data.hall && (
						<p>
							{`${data.hallsCounted} of ${data.hallsTotal} ${data.hallsTotal === 1 ? "hall" : "halls"} counting`}
							{data.hallsCounted < data.hallsTotal &&
								" · Working counters only"}
						</p>
					)}
				</div>
				<span className={styles.wordmark}>EventzFlow</span>
				<div className={styles.clock}>
					<p>{clock.text}</p>
					<p>Malaysia time · UTC+8</p>
					{fullscreen.supported && !fullscreen.active && (
						<button
							type="button"
							className={styles.fullscreen}
							onClick={fullscreen.toggle}
						>
							Fullscreen
						</button>
					)}
				</div>
			</footer>
		</main>
	);
}
