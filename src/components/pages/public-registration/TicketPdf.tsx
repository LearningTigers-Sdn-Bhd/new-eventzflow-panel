"use client";

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
	Svg,
	Line,
	Circle,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { PublicTicketDetails } from "@/lib/api/public-registration/types";
import { API_BASE_URL } from "@/utils/rest-api";

const colors = {
	primary: "#23c460", // EventzFlow Green
	secondary: "#0F172A", // Dark Slate
	textMain: "#1E293B",
	textMuted: "#64748B",
	textLight: "#94A3B8",
	textStrong: "#111827",
	white: "#FFFFFF",
	background: "#F8FAFC",
	border: "#E2E8F0",
};

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#F1F5F9", // Light slate background for the page
		fontFamily: "Helvetica",
		padding: 20, // Add padding so the ticket is centered in the "paper"
	},
	ticketContainer: {
		position: "relative",
		flexDirection: "row",
		width: "100%",
		height: "100%",
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: "#CBD5E1",
		overflow: "hidden",
		// Top accent bar
		borderTopWidth: 4,
		borderTopColor: colors.primary,
	},
	// Left section (Main Info)
	mainSection: {
		flex: 1,
		padding: 24,
		justifyContent: "space-between",
	},
	// Right section (Stub / QR)
	stubSection: {
		width: 170,
		padding: 20,
		backgroundColor: "#F8FAFC",
		alignItems: "center",
		justifyContent: "center",
		borderLeftWidth: 1,
		borderLeftColor: "#CBD5E1",
		borderLeftStyle: "dashed",
	},
	// Decorative notches
	notchTop: {
		position: "absolute",
		top: -14, // Cut deeper into the top accent bar
		left: -11,
		width: 22,
		height: 22,
		borderRadius: 10,
		backgroundColor: "#F1F5F9", // Match page background
		borderWidth: 1,
		borderColor: "#CBD5E1",
		zIndex: 10,
	},
	notchBottom: {
		position: "absolute",
		bottom: -11,
		left: -11,
		width: 22,
		height: 22,
		borderRadius: 10,
		backgroundColor: "#F1F5F9", // Match page background
		borderWidth: 1,
		borderColor: "#CBD5E1",
		zIndex: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 10,
	},
	logo: {
		height: 24,
		width: 80,
		objectFit: "contain",
	},
	ticketLabel: {
		fontSize: 8,
		fontWeight: "bold",
		color: colors.primary,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	eventTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: colors.secondary,
		lineHeight: 1.2,
	},
	ticketType: {
		fontSize: 9,
		color: colors.primary,
		fontWeight: "bold",
		marginTop: 4,
		marginBottom: 12,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	infoGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 6,
	},
	infoItem: {
		width: "50%",
		marginBottom: 6,
	},
	infoLabel: {
		fontSize: 7,
		color: colors.textStrong,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 1,
	},
	infoValue: {
		fontSize: 10,
		color: colors.textStrong,
		fontWeight: "bold",
	},
	attendeeContainer: {
		marginTop: 6,
		marginBottom: 14,
	},
	attendeeName: {
		fontSize: 14,
		fontWeight: "bold",
		color: colors.secondary,
		marginBottom: 2,
		lineHeight: 1.1,
	},
	attendeeEmail: {
		fontSize: 9,
		color: colors.textMuted,
	},
	qrContainer: {
		padding: 4,
		borderWidth: 1.5,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
		marginBottom: 8,
	},
	qrCode: {
		width: 100,
		height: 100,
	},
	qrFallback: {
		width: 100,
		height: 100,
		backgroundColor: "#F1F5F9",
		borderRadius: 6,
	},
	publicId: {
		fontSize: 6,
		fontFamily: "Courier",
		color: colors.textStrong,
		textAlign: "center",
		marginTop: 4,
		width: 130, // Limit width to prevent overflow
	},
	brandFooter: {
		fontSize: 6,
		color: colors.textLight,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginTop: 6,
	},
});

export const TicketPdf = ({ tickets }: { tickets: PublicTicketDetails[] }) => (
	<Document>
		{tickets.filter(Boolean).map((ticket, index) => {
			const event = ticket?.event;
			const publicId = ticket?.public_id || `ticket-${index + 1}`;
			const normalizedRole = ticket?.role?.trim();
			const roleDisplay = normalizedRole
				? `${normalizedRole.charAt(0).toUpperCase()}${normalizedRole.slice(1).toLowerCase()}`
				: "";
			const hasStartDate = Boolean(event?.start_date);
			const hasEndDate = Boolean(event?.end_date);
			const eventDate =
				hasStartDate && hasEndDate
					? format(new Date(event.start_date as string), "d MMMM yyyy") ===
						format(new Date(event.end_date as string), "d MMMM yyyy")
						? format(new Date(event.start_date as string), "d MMMM yyyy")
						: `${format(new Date(event.start_date as string), "d MMMM yyyy")} until\n${format(new Date(event.end_date as string), "d MMMM yyyy")}`
					: hasStartDate
						? format(new Date(event.start_date as string), "d MMMM yyyy")
						: "TBA";
			const logoSrc = event?.logo_url
				? event.logo_url.startsWith("http")
					? event.logo_url
					: `${API_BASE_URL}${event.logo_url}`
				: null;
			const qrSrc = ticket?.qr_code_base64
				? ticket.qr_code_base64.startsWith("data:image")
					? ticket.qr_code_base64
					: `data:image/png;base64,${ticket.qr_code_base64}`
				: null;

			return (
				<Page key={publicId} size={[640, 280]} style={styles.page}>
					<View style={styles.ticketContainer}>
						{/* Main Section */}
						<View style={styles.mainSection}>
							<View>
								<View style={styles.header}>
									{logoSrc ? (
										<Image src={logoSrc} style={styles.logo} />
									) : (
										<Text style={styles.ticketLabel}>EVENT TICKET</Text>
									)}
									<Text
										style={[styles.ticketLabel, { color: colors.primary }]}
									>
										{roleDisplay}
									</Text>
								</View>

								<View>
									<Text style={styles.eventTitle}>
										{event?.title || "Event Name"}
									</Text>
									<Text style={styles.ticketType}>
										{ticket?.ticket_type || "Standard Admission"}
									</Text>
								</View>

								<View style={styles.attendeeContainer}>
									<Text style={styles.infoLabel}>Attendee</Text>
									<Text style={styles.attendeeName}>
										{ticket?.attendee_name || "Guest Attendee"}
									</Text>
									<Text style={styles.attendeeEmail}>
										{ticket.attendee_email}
									</Text>
								</View>
							</View>

							<View>
								<View style={styles.infoGrid}>
									<View style={styles.infoItem}>
										<Text style={styles.infoLabel}>Date</Text>
										<Text style={styles.infoValue}>{eventDate}</Text>
									</View>
									<View style={styles.infoItem}>
										<Text style={styles.infoLabel}>Venue</Text>
										<Text style={styles.infoValue}>
											{event?.venue_name || "TBA"}
										</Text>
									</View>
								</View>
								<Text style={styles.brandFooter}>Powered by EventzFlow</Text>
							</View>
						</View>

						{/* Stub Section */}
						<View style={styles.stubSection}>
							{/* Notches positioned relative to stubSection */}
							<View style={styles.notchTop} />
							<View style={styles.notchBottom} />

							<View style={styles.qrContainer}>
								{qrSrc ? (
									<Image src={qrSrc} style={styles.qrCode} />
								) : (
									<View style={styles.qrFallback} />
								)}
							</View>
							<Text style={styles.publicId}>{publicId}</Text>
							<Text
								style={[
									styles.ticketLabel,
									{ fontSize: 6, marginTop: 8, color: colors.textStrong },
								]}
							>
								Scan at Entrance
							</Text>
						</View>
					</View>
				</Page>
			);
		})}
	</Document>
);
