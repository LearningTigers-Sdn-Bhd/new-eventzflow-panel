import { StyleSheet } from "@react-pdf/renderer";

/**
 * Swiss International Design Style
 * - Clean, grid-based layout
 * - Strong typographic hierarchy
 * - Minimal color usage (monochrome with accent for emphasis)
 * - Maximum readability and clarity
 */

// Brand colors - matching system design
export const colors = {
	// Brand identity
	brandGreen: "#23c460",
	brandBlue: "#2766ec",

	// Functional colors (used sparingly)
	accent: "#23c460", // Brand green for progress bars and key metrics
	success: "#22c55e",
	warning: "#f59e0b",
	danger: "#ef4444",

	// Typography and structure (Swiss design: primarily monochrome)
	text: "#0f172a", // Near black for primary text
	textSecondary: "#475569", // Slate for secondary text
	textMuted: "#94a3b8", // Light gray for metadata
	border: "#e2e8f0",
	borderLight: "#f1f5f9",
	background: "#f8fafc",
	white: "#ffffff",
};

// Shared styles for all PDF reports
export const styles = StyleSheet.create({
	// Page layout
	page: {
		padding: 48,
		fontFamily: "Helvetica",
		fontSize: 10,
		color: colors.text,
		backgroundColor: colors.white,
	},

	// Header section - Stacked layout for long titles
	header: {
		marginBottom: 32,
		paddingBottom: 24,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	headerMeta: {
		alignItems: "flex-end",
	},
	eventName: {
		fontSize: 18,
		fontWeight: "bold",
		color: colors.text,
		marginTop: 12,
		lineHeight: 1.3,
	},
	reportType: {
		fontSize: 11,
		fontWeight: "bold",
		color: colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 1.5,
		marginTop: 4,
	},
	reportMeta: {
		fontSize: 9,
		color: colors.textMuted,
		marginTop: 2,
	},

	// Legacy styles (for backward compatibility)
	headerLeft: {
		flexDirection: "column",
	},
	headerRight: {
		alignItems: "flex-end",
	},
	reportTitle: {
		fontSize: 11,
		fontWeight: "bold",
		color: colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 1.5,
	},
	reportSubtitle: {
		fontSize: 9,
		color: colors.textMuted,
		marginTop: 2,
	},
	reportDate: {
		fontSize: 9,
		color: colors.textMuted,
		marginTop: 2,
	},
	logo: {
		width: 120,
		height: 40,
		objectFit: "contain",
	},

	// Section styles
	section: {
		marginBottom: 28,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "bold",
		color: colors.text,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginBottom: 16,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},

	// Stats cards grid - Clean grid layout
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginBottom: 24,
	},
	statsCard: {
		width: "48%",
		padding: 16,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.border,
	},
	statsCardFull: {
		width: "100%",
		padding: 16,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.border,
	},
	statsLabel: {
		fontSize: 8,
		color: colors.textMuted,
		marginBottom: 6,
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	statsValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.text,
	},
	statsValueSmall: {
		fontSize: 16,
		fontWeight: "bold",
		color: colors.text,
	},

	// Table styles - Clean, minimal
	table: {
		width: "100%",
		marginTop: 8,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: colors.text,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	tableHeaderCell: {
		color: colors.white,
		fontSize: 8,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	tableRowAlt: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
		backgroundColor: colors.background,
	},
	tableCell: {
		fontSize: 9,
		color: colors.text,
	},
	tableCellMuted: {
		fontSize: 9,
		color: colors.textSecondary,
	},

	// Time series data
	timeSeriesSection: {
		marginTop: 20,
	},
	timeSeriesTitle: {
		fontSize: 10,
		fontWeight: "bold",
		color: colors.text,
		marginBottom: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	timeSeriesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	timeSeriesItem: {
		width: "23%",
		padding: 10,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.borderLight,
		marginBottom: 4,
	},
	timeSeriesPeriod: {
		fontSize: 7,
		color: colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
	timeSeriesValue: {
		fontSize: 12,
		fontWeight: "bold",
		color: colors.text,
		marginTop: 2,
	},

	// Footer - Minimal
	footer: {
		position: "absolute",
		bottom: 32,
		left: 48,
		right: 48,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	footerText: {
		fontSize: 7,
		color: colors.textMuted,
	},
	footerBrand: {
		fontSize: 8,
		color: colors.textSecondary,
		fontWeight: "bold",
	},
	pageNumber: {
		fontSize: 7,
		color: colors.textMuted,
	},

	// Summary box - Clean with subtle accent
	summaryBox: {
		padding: 16,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.border,
		borderLeftWidth: 3,
		borderLeftColor: colors.accent,
		marginBottom: 24,
	},
	summaryTitle: {
		fontSize: 10,
		fontWeight: "bold",
		color: colors.text,
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	summaryText: {
		fontSize: 10,
		color: colors.textSecondary,
		lineHeight: 1.6,
	},

	// List styles
	list: {
		marginTop: 8,
	},
	listItem: {
		flexDirection: "row",
		marginBottom: 6,
	},
	listBullet: {
		width: 16,
		fontSize: 10,
		color: colors.textMuted,
	},
	listText: {
		flex: 1,
		fontSize: 10,
		color: colors.text,
	},

	// Progress/Rate indicator - Uses accent color
	rateContainer: {
		marginTop: 12,
	},
	rateBar: {
		height: 6,
		backgroundColor: colors.borderLight,
		overflow: "hidden",
	},
	rateFill: {
		height: "100%",
		backgroundColor: colors.accent,
	},
	rateLabel: {
		fontSize: 9,
		color: colors.textSecondary,
		marginTop: 6,
	},

	// Empty state
	emptyState: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyStateText: {
		fontSize: 10,
		color: colors.textMuted,
		fontStyle: "italic",
	},

	// Key metric highlight (for check-in rate, etc.)
	metricHighlight: {
		padding: 20,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		marginBottom: 24,
	},
	metricValue: {
		fontSize: 36,
		fontWeight: "bold",
		color: colors.text,
	},
	metricLabel: {
		fontSize: 9,
		color: colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginTop: 4,
	},
});
