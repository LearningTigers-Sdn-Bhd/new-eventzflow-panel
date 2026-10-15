import Image from "next/image";
import type { ReactNode } from "react";
import type { RfidDisplayActivity, RfidDisplayMode } from "@/lib/api/rfid";
import styles from "./arrival-display.module.css";

const entryTime = new Intl.DateTimeFormat("en-MY", {
	timeZone: "Asia/Kuching",
	hour: "2-digit",
	minute: "2-digit",
	hour12: true,
});

function Arrival({
	visit,
	rank,
	prominent,
}: {
	visit: RfidDisplayActivity;
	rank: number;
	prominent: boolean;
}) {
	const date = visit.occurred_at ? new Date(visit.occurred_at) : null;
	return (
		<li
			className={prominent ? styles.card : styles.row}
			data-arrival={prominent ? "main" : "previous"}
			data-newest={rank === 1 || undefined}
			data-spotlight={rank === 1 || undefined}
			data-direction={visit.direction}
		>
			<span className={styles.name} data-name>
				{visit.ticket_name?.trim() || "Guest"}
			</span>
			<span className={styles.activityTime}>
				<span className={styles.direction}>
					{visit.direction.toUpperCase()}
				</span>
				<time className={styles.time} dateTime={visit.occurred_at ?? undefined}>
					{date && Number.isFinite(date.getTime())
						? entryTime.format(date).toUpperCase()
						: "—"}
				</time>
			</span>
		</li>
	);
}

export function ArrivalDisplay({
	title,
	logoUrl,
	activity,
	mode = "in",
	status,
	controls,
}: {
	title: string;
	logoUrl?: string | null;
	activity: RfidDisplayActivity[];
	mode?: RfidDisplayMode;
	status: "loading" | "live" | "offline";
	controls?: ReactNode;
}) {
	const latest = activity.slice(0, 10);
	const noun =
		mode === "in" ? "arrivals" : mode === "out" ? "departures" : "activity";
	return (
		<main className={styles.screen} data-mode={mode}>
			<header className={styles.header}>
				<div className={styles.brand}>
					{logoUrl && (
						<Image
							src={logoUrl}
							alt=""
							width={160}
							height={80}
							unoptimized
							className={styles.logo}
						/>
					)}
					<h1>{title}</h1>
				</div>
				<p className={styles.welcome}>
					{mode === "in"
						? "Welcome"
						: mode === "out"
							? "Departures"
							: "Gate activity"}
				</p>
			</header>
			<section className={styles.latest} aria-labelledby="latest-heading">
				<div className={styles.sectionHeading}>
					<h2 id="latest-heading">Latest {noun}</h2>
					<span>
						{mode === "in"
							? "Entry time"
							: mode === "out"
								? "Exit time"
								: "Scan time"}
					</span>
				</div>
				{latest.length ? (
					<ol className={styles.cards}>
						{latest.map((visit, index) => (
							<Arrival
								key={visit.id}
								visit={visit}
								rank={index + 1}
								prominent
							/>
						))}
					</ol>
				) : (
					<div className={styles.empty}>
						<h3>
							{status === "loading"
								? "Connecting to the gate"
								: status === "offline"
									? "Waiting for connection"
									: mode === "in"
										? "Ready to welcome you"
										: "Waiting for gate activity"}
						</h3>
						<p>
							{status === "offline"
								? "Activity will appear when the connection returns."
								: mode === "in"
									? "Your name will appear here as you enter."
									: "Names will appear here when guests pass the gate."}
						</p>
					</div>
				)}
			</section>
			<section className={styles.previous} aria-labelledby="previous-heading">
				<div className={styles.sectionHeading}>
					<h2 id="previous-heading">Earlier {noun}</h2>
				</div>
				<div className={styles.columns}>
					{[0, 1, 2].map((column) => (
						<ol
							key={column}
							className={styles.history}
							start={11 + column * 10}
							aria-label={`Previous ${noun} column ${column + 1}`}
						>
							{activity
								.slice(10 + column * 10, 20 + column * 10)
								.map((visit, index) => (
									<Arrival
										key={visit.id}
										visit={visit}
										rank={11 + column * 10 + index}
										prominent={false}
									/>
								))}
						</ol>
					))}
				</div>
			</section>
			<footer className={styles.footer}>
				<span className={styles.connection} data-status={status} role="status">
					<span />
					{status === "live"
						? "Live"
						: status === "loading"
							? "Connecting"
							: "Reconnecting"}
					{status === "offline" && " · showing last received activity"}
				</span>
				<span>EventzFlow</span>
				<span>Malaysia time · UTC+8</span>
			</footer>
			{controls && (
				<nav className={styles.controls} aria-label="Display controls">
					{controls}
				</nav>
			)}
		</main>
	);
}
