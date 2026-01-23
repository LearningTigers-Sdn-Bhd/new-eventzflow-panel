import { StyleSheet } from "@react-pdf/renderer";

// STYLE: Corporate Professional (Financial/Enterprise)
// - Clean, sharp lines (0px radius per request, but elegant)
// - Navy Blue & Slate Gray palette (Trustworthy)
// - Clear data hierarchy
// - Standard business terminology

export const colors = {
	// Brand / Primary
	brandPrimary: "#1e3a8a", // Navy Blue
	brandSecondary: "#3b82f6", // Royal Blue
	brandGreen: "#23c460", // EventzFlow Green
	brandBlue: "#2766ec", // EventzFlow Blue

	// Functional
	success: "#059669", // Emerald
	warning: "#d97706", // Amber
	danger: "#dc2626", // Red

	// Grayscale
	textMain: "#111827", // Gray 900
	textSecondary: "#4b5563", // Gray 600
	textMuted: "#6b7280", // Gray 500 (Darkened from 400)

	border: "#9ca3af", // Gray 400 - Clearly visible
	borderDark: "#4b5563", // Gray 600 - Stronger structural borders
	background: "#f9fafb", // Gray 50
	backgroundHeader: "#f3f4f6", // Gray 100
	white: "#ffffff",
};

export const styles = StyleSheet.create({
	// Page Layout
	page: {
		paddingTop: 40,
		paddingLeft: 40,
		paddingRight: 40,
		paddingBottom: 60, // Extra space for fixed footer
		fontFamily: "Helvetica",
		fontSize: 10,
		color: colors.textMain,
		backgroundColor: colors.white,
	},

	// Typography
	h1: {
		fontSize: 22,
		fontFamily: "Helvetica-Bold",
		color: colors.brandPrimary,
		marginBottom: 6,
	},
	h2: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		color: colors.textMain,
		marginBottom: 12,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	h3: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		color: colors.textMain,
		marginBottom: 8,
		textTransform: "uppercase",
	},
	label: {
		fontSize: 8,
		color: colors.textSecondary,
		textTransform: "uppercase",
		marginBottom: 4,
		letterSpacing: 0.5,
	},
	value: {
		fontSize: 18,
		fontFamily: "Helvetica-Bold",
		color: colors.textMain,
	},
	valueLarge: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		color: colors.brandPrimary,
	},
	text: {
		fontSize: 10,
		lineHeight: 1.5,
		color: colors.textSecondary,
	},
	textSmall: {
		fontSize: 9,
		color: colors.textSecondary,
	},

	// Layout Helpers
	row: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginHorizontal: -10,
	},
	col: {
		paddingHorizontal: 10,
	},
	col6: { width: "50%", paddingHorizontal: 10 },
	col4: { width: "33.33%", paddingHorizontal: 10 },
	col12: { width: "100%", paddingHorizontal: 10 },
	mt4: { marginTop: 16 },
	mb4: { marginBottom: 16 },

	// Header
	header: {
		marginBottom: 32,
		borderBottomWidth: 2,
		borderBottomColor: colors.brandPrimary,
		paddingBottom: 20,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	headerMeta: {
		flexDirection: "row",
		gap: 24,
	},

	// Stats Grid
	statsContainer: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.white,
		marginBottom: 24,
	},
	statItem: {
		flex: 1,
		padding: 16,
		borderRightWidth: 1,
		borderRightColor: colors.border,
	},
	statItemLast: {
		borderRightWidth: 0,
	},

	// Summary Section
	summaryBox: {
		backgroundColor: colors.background,
		padding: 16,
		borderLeftWidth: 4,
		borderLeftColor: colors.brandSecondary,
		marginBottom: 24,
	},

	// Table
	table: {
		width: "100%",
		marginTop: 8,
		borderWidth: 1,
		borderColor: colors.border,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: colors.backgroundHeader,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderDark,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	tableCell: {
		fontSize: 9,
		color: colors.textMain,
	},
	tableHeaderCell: {
		fontSize: 8,
		fontFamily: "Helvetica-Bold",
		color: colors.textMain,
		textTransform: "uppercase",
	},

	// Footer
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		paddingTop: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
