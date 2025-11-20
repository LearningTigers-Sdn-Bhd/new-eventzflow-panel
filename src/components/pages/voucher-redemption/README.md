# Voucher Redemption Scanner

A complete voucher redemption flow for vendors to scan and redeem vouchers for visitors.

## Features

- **Multi-step scanning process**: Voucher QR → Visitor QR → Amount Entry
- **Real-time QR scanning** using device camera
- **Visual progress tracking** with step indicators
- **Scanned data display** with ability to clear and rescan
- **Redemption result display** with discount details
- **Error handling** with user-friendly messages

## User Flow

1. **Scan Voucher QR**: Vendor scans the voucher QR code
2. **Scan Visitor QR**: Vendor scans the visitor's QR code
3. **Enter Amount**: Vendor enters the gross transaction amount
4. **Redemption**: System processes the redemption and shows results
5. **Reset**: Vendor can scan another voucher

## Components

### `page.tsx`
Main page component that orchestrates the redemption flow.

### `redemption-scanner.tsx`
QR scanner component with step progress indicator.

### `amount-form.tsx`
Form for entering the gross transaction amount.

### `redemption-result.tsx`
Displays redemption success/failure with discount details.

### `scanned-info-card.tsx`
Shows scanned voucher and visitor information with clear options.

### `types.ts`
TypeScript type definitions for the redemption flow.

### `constants.ts`
Configuration constants and messages.

## API Integration

Uses the voucher redemption API:
- Endpoint: `POST /v1/voucher_redemptions`
- Request: `{ voucher_uuid, gross_amount, visitor_id }`
- Response: `{ success, message, netAmount, discountApplied, voucherType }`

## Usage

Navigate to `/event/[event_id]/voucher-redemption` to access the scanner.

## QR Code Format

- **Voucher QR**: Contains the `voucher_uuid`
- **Visitor QR**: Contains the visitor's `public_id`

## Error Handling

- Camera permission denied
- Invalid QR codes
- Redemption failures (expired voucher, limit reached, etc.)
- Network errors

All errors are displayed with toast notifications and user-friendly messages.
