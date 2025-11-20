export const SCANNER_CONFIG = {
	SCANNER_DIV_ID: "voucher-redemption-scanner",
	FPS: 10,
	QRBOX_SIZE: 250,
	ASPECT_RATIO: 1.0,
	STOP_DELAY_MS: 300,
};

export const SCANNER_STATES = {
	NOT_STARTED: 0,
	SCANNING: 1,
	PAUSED: 2,
};

export const SUCCESS_MESSAGES = {
	CAMERA_ACTIVATED: "Camera Activated",
	CAMERA_READY: "Point your camera at a QR code to scan",
	CAMERA_STOPPED: "Camera Stopped",
	VOUCHER_SCANNED: "Voucher Scanned",
	VISITOR_SCANNED: "Visitor Scanned",
	REDEMPTION_SUCCESS: "Voucher Redeemed Successfully",
};

export const ERROR_MESSAGES = {
	CAMERA_START_FAILED: "Failed to start camera",
	CAMERA_PERMISSION_DENIED: "Camera permission denied",
	CAMERA_PERMISSION_HELP: "Please allow camera access in your browser settings",
	INVALID_QR: "Invalid QR code format",
	REDEMPTION_FAILED: "Failed to redeem voucher",
};

export const STEP_LABELS = {
	voucher: "Scan Voucher QR",
	visitor: "Scan Visitor QR",
	amount: "Enter Amount",
};
