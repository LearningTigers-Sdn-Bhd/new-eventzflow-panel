# Voucher Redemption API

This module provides the frontend API client for voucher redemption functionality.

## Overview

The voucher redemption API allows vendors to redeem vouchers for users or visitors, applying discounts to transactions based on the voucher type and value.

## Backend Endpoint

- **POST** `/v1/voucher_redemptions`
- **Authorization**: Required (Vendor role only)
- **Controller**: `V1::VoucherRedemptionsController`
- **Service**: `VoucherRedemptionService`

## Features

- ✅ Redeem vouchers with automatic discount calculation
- ✅ Support for multiple voucher types (Fixed Amount, Percentage, Free Item)
- ✅ Validation of voucher availability and limits
- ✅ Support for both User and Visitor redemptions
- ✅ Type-safe request/response handling
- ✅ Automatic data transformation between backend and frontend formats

## Usage

### Basic Redemption

```typescript
import { redeemVoucher } from '@/lib/api/voucher-redemption';

// Redeem a voucher for the current user (vendor)
const result = await redeemVoucher({
  voucher_uuid: 'abc123-def456-ghi789',
  gross_amount: 100.00,
});

console.log(result.netAmount); // Amount after discount
console.log(result.discountApplied); // Discount amount
console.log(result.voucherType); // 'fixed_amount' | 'percentage' | 'free_item'
```

### Redeem for Specific User

```typescript
const result = await redeemVoucher({
  voucher_uuid: 'abc123-def456-ghi789',
  gross_amount: 100.00,
  user_id: 42,
});
```

### Redeem for Visitor

```typescript
const result = await redeemVoucher({
  voucher_uuid: 'abc123-def456-ghi789',
  gross_amount: 100.00,
  visitor_id: 'visitor-public-id-123',
});
```

### With React Query

```typescript
import { useMutation } from '@tanstack/react-query';
import { redeemVoucher } from '@/lib/api/voucher-redemption';

function VoucherRedemptionForm() {
  const redemptionMutation = useMutation({
    mutationFn: redeemVoucher,
    onSuccess: (data) => {
      console.log('Voucher redeemed successfully!');
      console.log('Net amount:', data.netAmount);
      console.log('Discount:', data.discountApplied);
    },
    onError: (error) => {
      console.error('Redemption failed:', error.message);
    },
  });

  const handleRedeem = () => {
    redemptionMutation.mutate({
      voucher_uuid: selectedVoucher.voucherUuid,
      gross_amount: totalAmount,
    });
  };

  return (
    <button onClick={handleRedeem} disabled={redemptionMutation.isPending}>
      {redemptionMutation.isPending ? 'Redeeming...' : 'Redeem Voucher'}
    </button>
  );
}
```

## Request Schema

```typescript
type RedeemVoucherRequest = {
  voucher_uuid: string;        // Required: Voucher UUID
  gross_amount: number;         // Required: Transaction amount before discount
  user_id?: number;             // Optional: Specific user ID
  visitor_id?: string;          // Optional: Visitor public ID
};
```

## Response Schema

```typescript
type VoucherRedemptionResponse = {
  success: boolean;
  message: string;
  netAmount: number;            // Final amount after discount
  discountApplied: number;      // Discount amount
  voucherType: 'fixed_amount' | 'percentage' | 'free_item';
};
```

## Voucher Types

### Fixed Amount
- Applies a fixed discount value
- Example: $10 off

### Percentage
- Applies a percentage discount
- Example: 20% off
- Capped at gross amount

### Free Item
- Represents a free item voucher
- Discount recorded as $0.00

## Validation Rules

The backend service validates:
- ✅ Voucher time/date validity
- ✅ Global redemption limit
- ✅ Per-user redemption limit
- ✅ Vendor authorization

## Error Handling

```typescript
try {
  const result = await redeemVoucher({
    voucher_uuid: 'invalid-uuid',
    gross_amount: 100,
  });
} catch (error) {
  // Common errors:
  // - "Voucher not found"
  // - "Voucher has expired or is not yet active"
  // - "Voucher is out of stock (Global limit reached)"
  // - "User has reached their personal redemption limit"
  // - "Only vendors can redeem vouchers"
  console.error(error.message);
}
```

## Files

- `endpoints.ts` - API endpoint functions
- `request.ts` - Request types and validation schemas
- `response.ts` - Response types and transformations
- `index.ts` - Public API exports

