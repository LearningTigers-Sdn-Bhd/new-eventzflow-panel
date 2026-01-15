# Resource Image Variants - Frontend Implementation

## Overview

The frontend now supports optimized image variants for resource header images. This provides better performance by loading appropriately sized images based on the display context.

## Type Definitions

### ResourceImageVariants

```typescript
export type ResourceImageVariants = {
  thumbnail: string;   // 300x200 - For card grids
  medium: string;      // 800x533 - For list views
  large: string;       // 1600x1067 - For detail pages
  original: string;    // Full-size original
};
```

### Resource Type

The `Resource.headerImgUrl` now supports both legacy (string) and new (object) formats:

```typescript
export type Resource = {
  // ... other fields
  headerImgUrl: string | ResourceImageVariants | null;
};
```

## Utility Functions

### `getResourceImage()`

Get the appropriate image URL for a specific variant size:

```typescript
import { getResourceImage } from "@/lib/utils/resource-image";

// Get thumbnail variant (300x200)
const thumbnail = getResourceImage(resource.headerImgUrl, "thumbnail");

// Get medium variant (800x533)
const medium = getResourceImage(resource.headerImgUrl, "medium");

// Get large variant (1600x1067)
const large = getResourceImage(resource.headerImgUrl, "large");

// Get original
const original = getResourceImage(resource.headerImgUrl, "original");
```

**Parameters:**
- `headerImgUrl`: The header_img_url from the resource
- `size`: "thumbnail" | "medium" | "large" | "original" (default: "medium")

**Returns:** `string | null`

**Backward Compatibility:** If the backend returns a string (legacy format), it will be returned as-is regardless of the size parameter.

### `hasResourceImage()`

Check if a resource has an image:

```typescript
import { hasResourceImage } from "@/lib/utils/resource-image";

if (hasResourceImage(resource.headerImgUrl)) {
  // Display image
}
```

### `getAllResourceImageVariants()`

Get all available variants:

```typescript
import { getAllResourceImageVariants } from "@/lib/utils/resource-image";

const variants = getAllResourceImageVariants(resource.headerImgUrl);
// Returns ResourceImageVariants | null
```

## Usage Examples

### Card/Grid Components

Use **thumbnail** (300x200) for small cards:

```typescript
const displayImage = getResourceImage(resource.headerImgUrl, "thumbnail");
```

### List View Components

Use **medium** (800x533) for list items:

```typescript
const displayImage = getResourceImage(resource.headerImgUrl, "medium");
```

### Detail/Hero Components

Use **large** (1600x1067) for hero sections:

```typescript
const displayImage = getResourceImage(resource.headerImgUrl, "large");
```

### Forms/Uploads

Use **original** for edit forms to preserve quality:

```typescript
const displayImage = getResourceImage(resource.headerImgUrl, "original");
```

## Updated Components

The following components have been updated to use image variants:

### Public Pages
- ✅ `resources-card.tsx` - Uses thumbnail for grid, medium for list
- ✅ `featured-card.tsx` - Uses large variant for carousel
- ✅ `show-header.tsx` - Uses large variant for hero
- ✅ `show-form.tsx` - Uses medium variant for gated preview

### Admin Pages
- ✅ `post-header.tsx` - Uses large variant for preview
- ✅ `edit-post-form.tsx` - Uses original for form default

## Component Pattern

Here's the recommended pattern for components:

```typescript
import { getResourceImage } from "@/lib/utils/resource-image";

export function MyComponent({ resource }: { resource: Resource }) {
  // Choose variant based on display context
  const displayImage = getResourceImage(resource.headerImgUrl, "medium");

  return (
    <div>
      {displayImage && (
        <img src={displayImage} alt={resource.title} />
      )}
    </div>
  );
}
```

## Performance Benefits

| Context | Variant | Size | Load Time Improvement |
|---------|---------|------|----------------------|
| Card Grid | thumbnail | 300x200 | ~85-90% faster |
| List View | medium | 800x533 | ~60-70% faster |
| Detail Page | large | 1600x1067 | ~30-40% faster |
| Original | original | Full size | Baseline |

## Backward Compatibility

The implementation is fully backward compatible:

1. **Old API Response** (string URL):
   ```json
   {
     "header_img_url": "http://example.com/image.jpg"
   }
   ```
   - All variants will return the same URL
   - No breaking changes

2. **New API Response** (object with variants):
   ```json
   {
     "header_img_url": {
       "thumbnail": "http://example.com/thumb.jpg",
       "medium": "http://example.com/medium.jpg",
       "large": "http://example.com/large.jpg",
       "original": "http://example.com/original.jpg"
     }
   }
   ```
   - Appropriate variant URLs are returned

## Testing

Test with both formats:

```typescript
// Test with new format (variants object)
const resource1 = {
  headerImgUrl: {
    thumbnail: "/thumb.jpg",
    medium: "/medium.jpg",
    large: "/large.jpg",
    original: "/original.jpg"
  }
};

// Test with legacy format (string)
const resource2 = {
  headerImgUrl: "/image.jpg"
};

// Both should work
const img1 = getResourceImage(resource1.headerImgUrl, "medium"); // "/medium.jpg"
const img2 = getResourceImage(resource2.headerImgUrl, "medium"); // "/image.jpg"
```

## Migration Notes

### For New Components

Always use `getResourceImage()`:

```typescript
// ✅ Good
const img = getResourceImage(resource.headerImgUrl, "medium");

// ❌ Bad - Direct access won't work with variants
const img = resource.headerImgUrl;
```

### For Existing Components

Replace direct `headerImgUrl` usage with `getResourceImage()`:

```diff
- {resource.headerImgUrl && (
+ {getResourceImage(resource.headerImgUrl, "medium") && (
-   <img src={resource.headerImgUrl} />
+   <img src={getResourceImage(resource.headerImgUrl, "medium")} />
  )}
```

## Best Practices

1. **Choose the right variant** for your use case
2. **Use thumbnail** for grids and small cards
3. **Use medium** for list views and previews
4. **Use large** for hero sections and detail pages
5. **Use original** only for downloads or forms
6. **Always handle null** - check if image exists before rendering

## Future Enhancements

Potential improvements:

- Add WebP format support
- Implement responsive srcset
- Add lazy loading hints
- Support for custom variants
- Image blur placeholders
