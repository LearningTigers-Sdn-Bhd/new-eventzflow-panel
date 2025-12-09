# Wheel Draw Style - Go Deeper

Advanced technical documentation for the wheel draw style implementation.

## Architecture Overview

The wheel draw system consists of:

1. **`useWheel` Hook** (`src/hooks/draw-styles/use-wheel.ts`) - Core logic and state management
2. **Theme Components** (`src/components/pages/lucky-draw/session/draw-styles/wheel-draw/`) - Visual implementations
3. **D3.js** - For arc generation and pie chart calculations
4. **SVG** - For rendering the wheel graphics

## Core Hook: `useWheel`

### Interface

```typescript
function useWheel(
  props: DrawProps,
  options?: UseWheelOptions
): UseWheelReturn
```

### Input Types

#### `DrawProps`
```typescript
interface DrawProps {
  participants: Participant[];
  onDrawComplete: (winner: Participant) => void;
  isDrawing: boolean;
}
```

#### `UseWheelOptions`
```typescript
interface UseWheelOptions {
  // Color configuration
  baseColors?: string[];

  // Pointer configuration
  pointerAngle?: number; // 0 = 12 o'clock, 90 = 3 o'clock

  // Spacing
  gapBetweenWheelAndOuter?: number; // Default: 10

  // Optional rendering features
  enableInnerShadow?: boolean;
  innerShadowDepth?: number;        // Default: 10
  innerShadowOffset?: number;       // Default: 2

  enableBorderRing?: boolean;
  borderRingInnerRadius?: number;
  borderRingOuterRadius?: number;

  enableDecorativeDots?: boolean;
  decorativeDotsCount?: number;     // Default: 22
  decorativeDotsRadius?: number;
  decorativeDotsStartAngle?: number; // Default: -90
}
```

### Return Type

```typescript
interface UseWheelReturn {
  // Core state
  rotation: number;
  pointerRotation: number;
  pointerTransition: string;
  drawState: DrawState;
  internalParticipants: Participant[];
  isEmpty: boolean;
  isDrawing: boolean;

  // D3.js generators
  arcs: d3.PieArcDatum<string>[];
  arcGenerator: d3.Arc<unknown, d3.PieArcDatum<string>>;

  // Utilities
  getSliceColor: (index: number) => string;
  svgRef: React.RefObject<SVGSVGElement | null>;
  handleTransitionEnd: () => void;

  // Pointer (always available)
  pointerPosition: {
    className: string;
    style: React.CSSProperties;
  };
  pointerPath: string;

  // Optional features (only if enabled)
  innerShadowArcGenerator?: d3.Arc<unknown, d3.PieArcDatum<string>>;
  borderRingGenerator?: d3.Arc<unknown, { startAngle: number; endAngle: number }>;
  borderRingData?: { startAngle: number; endAngle: number };
  decorativeDots?: Array<{ x: number; y: number; angle: number }>;
}
```

## State Management

### Draw States

```typescript
enum DrawState {
  IDLE = "IDLE",      // Wheel is static, ready to spin
  SPINNING = "SPINNING", // Wheel is currently spinning
  WON = "WON"         // Wheel has stopped, winner determined
}
```

### State Flow

1. **IDLE** → User sets `isDrawing = true`
2. **SPINNING** → Wheel animates for 4 seconds
3. **WON** → Animation completes, winner calculated
4. **IDLE** → Reset for next draw (preserves winner display)

## Winner Calculation Algorithm

The winner is determined by calculating which slice aligns with the pointer after rotation:

```typescript
// 1. Normalize rotation to 0-360 degrees
const normalizedRotation = rotationRef.current % 360;

// 2. Calculate effective angle at pointer position
const pointerAngleDeg = options?.pointerAngle ?? 0;
const effectiveAngleDeg = (pointerAngleDeg - normalizedRotation + 360) % 360;
const effectiveRad = (effectiveAngleDeg * Math.PI) / 180;

// 3. Find the arc that contains this angle
const winningArc = arcs.find((d) => {
  // Normalize arc angles to 0-2π
  let startAngle = normalizeAngle(d.startAngle);
  let endAngle = normalizeAngle(d.endAngle);

  // Check if effective angle falls within arc
  return effectiveRad >= startAngle && effectiveRad < endAngle;
});
```

### Coordinate System

- **CSS Transform**: Rotates counter-clockwise for positive values
- **D3 Pie**: Starts at 12 o'clock (0 radians) and goes counter-clockwise
- **Pointer**: Configurable angle (0° = top, 90° = right)

## Animation System

### Rotation Calculation

```typescript
// Minimum 5 full spins + random segment
const minSpins = 5;
const randomDegrees = Math.floor(Math.random() * 360);
const newRotation = rotationRef.current + minSpins * 360 + randomDegrees;
```

### CSS Transition

```typescript
transition: isDrawing
  ? "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)"
  : "none"
```

- **Duration**: 4 seconds
- **Easing**: Custom cubic-bezier for natural deceleration
- **Property**: Only `transform` (GPU-accelerated)

### Pointer Animation

The pointer slightly rotates during spin for visual feedback:

```typescript
// During spin: nudge left (-18 degrees)
setPointerRotation(-18);

// Before spin ends: ease back to 0
setTimeout(() => {
  setPointerRotation(0);
}, 3700); // ~0.3s before spin ends
```

## Color System

### Color Palette Rotation

Colors rotate after each draw to prevent pattern repetition:

```typescript
const offset = colorOffset % baseColors.length;
const colors = baseColors.slice(offset).concat(baseColors.slice(0, offset));
```

### Color Assignment

```typescript
const getSliceColor = (index: number) => {
  return colors[index % colors.length] || "#ffffff";
};
```

## Arc Generation

### D3 Pie Generator

```typescript
const pie = d3
  .pie<string>()
  .value(1)      // Equal size slices
  .sort(null);   // Keep original order

const arcs = pie(participantNames);
```

### Arc Path Generator

```typescript
const arcGenerator = d3
  .arc<d3.PieArcDatum<string>>()
  .innerRadius(20)  // Center hole
  .outerRadius(radius - gapBetweenWheelAndOuter);
```

## Optional Features

### Inner Shadow

Creates depth effect at slice edges:

```typescript
const innerShadowArcGenerator = d3
  .arc<d3.PieArcDatum<string>>()
  .innerRadius(sliceOuterRadius - shadowDepth)
  .outerRadius(sliceOuterRadius - shadowOffset);
```

**Usage:**
```tsx
{innerShadowArcGenerator && (
  <path
    d={innerShadowArcGenerator(d)}
    fill="rgba(0, 0, 0, 0.15)"
  />
)}
```

### Border Ring

Decorative ring around the wheel:

```typescript
const borderRingGenerator = d3
  .arc<{ startAngle: number; endAngle: number }>()
  .innerRadius(borderRingInnerRadius)
  .outerRadius(borderRingOuterRadius);
```

**Usage:**
```tsx
{borderRingGenerator && borderRingData && (
  <path
    d={borderRingGenerator(borderRingData)}
    fill="#FF8C42"
  />
)}
```

### Decorative Dots

Evenly spaced dots around a circle:

```typescript
const decorativeDots = Array.from({ length: count }, (_, i) => {
  const angle = (i * 360) / count + startAngle;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  return { x, y, angle };
});
```

## Pointer Positioning

### Position Calculation

```typescript
const pointerPosition = pointerAngleDeg === 90
  ? {
      // Right side (3 o'clock)
      className: "pointer-events-none absolute top-1/2 right-0 z-20",
      style: {
        transform: `translate(50%, -50%) rotate(${pointerRotation}deg)`,
        transition: pointerTransition,
      },
    }
  : {
      // Top (12 o'clock) - default
      className: "pointer-events-none absolute top-0 left-1/2 z-20",
      style: {
        transform: `translate(-50%, -0.5rem) rotate(${pointerRotation}deg)`,
        transition: pointerTransition,
      },
    };
```

### SVG Paths

```typescript
const pointerPath = pointerAngleDeg === 90
  ? "M0 20 L40 5 L40 35 Z"  // Points right
  : "M20 40 L35 0 L5 0 Z";   // Points up
```

## Text Rendering

### Label Positioning

```typescript
// Get center point of arc
const centroid = arcGenerator.centroid(d);

// Calculate rotation angle
const angle = ((d.startAngle + d.endAngle) / 2) * 180 / Math.PI;

// Transform group
<g transform={`translate(${centroid})`}>
  <g transform={`rotate(${angle})`}>
    <text transform="rotate(-90)">  {/* Orient outward */}
      {participantName}
    </text>
  </g>
</g>
```

### Text Truncation

```typescript
{d.data.length > 15
  ? `${d.data.substring(0, 12)}...`
  : d.data}
```

## Performance Considerations

### Memoization

All generators and computed values are memoized:

```typescript
const arcs = useMemo(() => pie(participantNames), [participantNames]);
const colors = useMemo(() => rotateColors(baseColors, offset), [baseColors, offset]);
```

### SVG Optimization

- Uses `transform` for rotation (GPU-accelerated)
- Single SVG element with grouped transforms
- Minimal re-renders through proper React patterns

### Animation Performance

- CSS transitions (not JavaScript animations)
- `will-change: transform` handled by browser
- Single `transform` property for smooth 60fps

## Custom Theme Implementation

### Step-by-Step Guide

1. **Create theme file:**
   ```tsx
   // src/components/pages/lucky-draw/session/draw-styles/wheel-draw/my-theme.tsx
   ```

2. **Import dependencies:**
   ```tsx
   import { useWheel } from "@/hooks/draw-styles/use-wheel";
   import type { DrawProps } from "../type";
   import type * as d3 from "d3";
   ```

3. **Define colors:**
   ```tsx
   const baseColors = useMemo(() => [
     "#color1", "#color2", /* ... */
   ], []);
   ```

4. **Use the hook:**
   ```tsx
   const {
     rotation,
     arcs,
     arcGenerator,
     getSliceColor,
     // ... destructure needed properties
   } = useWheel(
     { participants, onDrawComplete, isDrawing },
     {
       baseColors,
       pointerAngle: 0,
       // Enable optional features
       enableInnerShadow: true,
       // ...
     }
   );
   ```

5. **Render SVG:**
   ```tsx
   return (
     <svg ref={svgRef} viewBox="0 0 500 500">
       <g transform="translate(250, 250)">
         {/* Border */}
         <circle r={245} stroke="black" strokeWidth="4" />

         {/* Slices */}
         {arcs.map((d, i) => (
           <path
             key={i}
             d={arcGenerator(d)}
             fill={getSliceColor(i)}
           />
         ))}

         {/* Center */}
         <circle r="15" fill="black" />
       </g>
     </svg>
   );
   ```

6. **Add to index:**
   ```tsx
   // src/components/pages/lucky-draw/session/draw-styles/wheel-draw/index.tsx
   import SpinWheelMyTheme from "./my-theme";

   case "my-theme":
     return <SpinWheelMyTheme {...rest} />;
   ```

## Testing Considerations

### Unit Tests

Test winner calculation:
```typescript
// Mock rotation and pointer angle
// Verify correct participant is selected
```

### Integration Tests

Test animation flow:
```typescript
// Set isDrawing = true
// Wait for animation
// Verify onDrawComplete called with correct winner
```

### Visual Regression

Test theme rendering:
```typescript
// Snapshot test for each theme
// Verify colors, spacing, etc.
```

## Common Pitfalls

1. **Forgetting to check optional features:**
   ```tsx
   // ❌ Wrong
   <path d={innerShadowArcGenerator(d)} />

   // ✅ Correct
   {innerShadowArcGenerator && (
     <path d={innerShadowArcGenerator(d)} />
   )}
   ```

2. **Not handling empty state:**
   ```tsx
   if (isEmpty) {
     return <EmptyState />;
   }
   ```

3. **Incorrect pointer angle:**
   - Use `0` for top (12 o'clock)
   - Use `90` for right (3 o'clock)
   - Other angles may cause calculation issues

4. **ViewBox padding:**
   - Calculate padding for decorative elements
   - Ensure dots/borders don't get clipped

## Advanced Customization

### Custom Animation Timing

Modify the transition duration in your component:
```tsx
style={{
  transform: `rotate(${rotation}deg)`,
  transition: isDrawing
    ? "transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)"  // 6 seconds
    : "none",
}}
```

### Custom Easing Functions

Experiment with different cubic-bezier values:
```typescript
// Fast start, slow end
"cubic-bezier(0.4, 0, 0.2, 1)"

// Bounce effect
"cubic-bezier(0.68, -0.55, 0.265, 1.55)"
```

### Dynamic Color Schemes

Generate colors based on participant count:
```typescript
const baseColors = useMemo(() => {
  if (participants.length <= 3) {
    return ["#FF0000", "#00FF00", "#0000FF"];
  }
  // Generate gradient colors
  return generateGradientColors(participants.length);
}, [participants.length]);
```

## References

- **D3.js Pie Documentation**: https://github.com/d3/d3-shape#pie
- **D3.js Arc Documentation**: https://github.com/d3/d3-shape#arc
- **SVG Transform**: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
- **CSS Transitions**: https://developer.mozilla.org/en-US/docs/Web/CSS/transition
