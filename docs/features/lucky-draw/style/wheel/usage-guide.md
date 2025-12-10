# Wheel Draw Style - Usage Guide

A beginner-friendly guide to using and customizing the wheel draw style for lucky draws.

## What is the Wheel Draw Style?

The wheel draw style displays participants on a spinning wheel. When you start a draw, the wheel spins and stops on a random participant, who becomes the winner.

## Quick Start

The wheel draw style is already integrated into the lucky draw system. You just need to:

1. **Select the wheel style** in your session configuration
2. **Choose a theme** (wireframe, cartoon, or colorful)
3. **Add participants** to your draw
4. **Click "Draw"** to spin the wheel!

## Available Themes

### 1. Wireframe (Default)
- Simple, minimal design
- Two-tone color scheme (pink and lavender)
- Perfect for clean, professional events

### 2. Cartoon
- Vibrant Material UI colors
- Blue, purple, and green palette
- Great for fun, casual events

### 3. Colorful
- Rich, vibrant 9-color palette
- Decorative border with dots
- Inner shadows for depth
- Includes a wheel stand
- Best for exciting, high-energy events

## Basic Usage

### Using the Default Theme

```tsx
import SpinWheel from "@/components/pages/lucky-draw/session/draw-styles/wheel-draw";

<SpinWheel
  participants={participants}
  onDrawComplete={handleWinner}
  isDrawing={isDrawing}
/>
```

### Switching Themes

```tsx
<SpinWheel
  theme="colorful"  // or "cartoon" or "wireframe"
  participants={participants}
  onDrawComplete={handleWinner}
  isDrawing={isDrawing}
/>
```

## Understanding the Props

### Required Props

- **`participants`**: Array of participants to display on the wheel
- **`onDrawComplete`**: Callback function called when the wheel stops (receives the winner)
- **`isDrawing`**: Boolean that triggers the spin animation when set to `true`

### Example

```tsx
const [isDrawing, setIsDrawing] = useState(false);
const participants = [
  { id: 1, name: "Alice", publicId: "alice-123" },
  { id: 2, name: "Bob", publicId: "bob-456" },
  // ... more participants
];

const handleWinner = (winner: Participant) => {
  console.log("Winner:", winner.name);
  // Show winner notification, update state, etc.
};

const startDraw = () => {
  setIsDrawing(true);
};

<SpinWheel
  participants={participants}
  onDrawComplete={handleWinner}
  isDrawing={isDrawing}
/>
```

## How It Works

1. **Idle State**: The wheel displays all participants in equal slices
2. **Spinning**: When `isDrawing` becomes `true`, the wheel spins for 4 seconds
3. **Winner Selection**: The wheel stops on a random participant
4. **Callback**: `onDrawComplete` is called with the winning participant

## Customization Options

### Creating Your Own Theme

You can create a custom theme by creating a new component file:

```tsx
// src/components/pages/lucky-draw/session/draw-styles/wheel-draw/my-theme.tsx
import { useWheel } from "@/hooks/draw-styles/use-wheel";
import type { DrawProps } from "../type";

const MyCustomTheme: React.FC<DrawProps> = ({
  participants,
  onDrawComplete,
  isDrawing,
}) => {
  // Define your color palette
  const baseColors = ["#FF0000", "#00FF00", "#0000FF"];

  // Use the useWheel hook
  const {
    rotation,
    arcs,
    arcGenerator,
    getSliceColor,
    // ... other properties
  } = useWheel(
    { participants, onDrawComplete, isDrawing },
    {
      baseColors,
      pointerAngle: 0, // 12 o'clock
      // Add optional features here
    }
  );

  // Render your custom wheel design
  return (
    <div>
      {/* Your custom SVG wheel */}
    </div>
  );
};
```

## Common Patterns

### Simple Wheel (Wireframe Style)

```tsx
const { /* ... */ } = useWheel(
  { participants, onDrawComplete, isDrawing },
  { baseColors: ["#FFB6C1", "#E6E6FA"] }
);
```

### Fancy Wheel (Colorful Style)

```tsx
const { /* ... */ } = useWheel(
  { participants, onDrawComplete, isDrawing },
  {
    baseColors: ["#FF4444", "#FF8C42", /* ... */],
    pointerAngle: 90, // 3 o'clock
    enableInnerShadow: true,
    enableBorderRing: true,
    enableDecorativeDots: true,
  }
);
```

## Tips & Best Practices

1. **Participant Count**: The wheel works best with 3-20 participants. Too many participants make slices too small to read.

2. **Color Palettes**: Use 2-3 colors for simple themes, or 8-10 colors for vibrant themes.

3. **Pointer Position**:
   - `0` = Top (12 o'clock) - Classic style
   - `90` = Right (3 o'clock) - Modern style

4. **Performance**: The wheel uses SVG and CSS transforms, so it's smooth even with many participants.

5. **Accessibility**: All themes include proper ARIA labels for screen readers.

## Troubleshooting

### Wheel doesn't spin
- Check that `isDrawing` is set to `true`
- Ensure you have at least one participant

### Winner callback not called
- Make sure `onDrawComplete` is properly defined
- Check browser console for errors

### Colors not showing
- Verify your `baseColors` array has valid hex colors
- Check that the theme is correctly selected

## Next Steps

- See [go-deeper.md](./go-deeper.md) for advanced customization
- Check the source code in `src/hooks/draw-styles/use-wheel.ts`
- Look at theme examples in `src/components/pages/lucky-draw/session/draw-styles/wheel-draw/`
