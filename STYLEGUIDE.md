# Write Aqua - Style Guide

This style guide ensures design consistency across the Write Aqua puzzle game.

## Color Palette

### Primary Colors
- **Sky Blue (Background Top)**: `#87CEEB`
- **Light Blue (Mid)**: `#B8E6F5`
- **Grass Green (Background Bottom)**: `#90C890`

### Accent Colors
- **Golden Yellow (Buttons/Text)**: `#FFD700`
- **Orange Gold (Button Gradient Start)**: `#f0b050`
- **Dark Gold (Button Gradient End)**: `#d4941f`
- **Brown Shadow (Button)**: `#a07520`
- **Wood Brown**: `#8B6914`
- **Dark Brown (Text Shadow)**: `#8B4513`

### UI Colors
- **Success Green**: `#10b981`
- **White Overlay**: `rgba(255, 255, 255, 0.95)`
- **Dark Text**: `#111827`
- **Medium Gray**: `#6b7280`
- **Light Gray**: `#d1d5db`

## Typography

### Font Family
- Primary: System fonts stack
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Font Weights
- **Normal**: 400
- **Semi-Bold**: 600
- **Bold**: 700
- **Extra Bold**: 900 (for button text)

### Font Sizes
- **Button Text (Desktop)**: 2rem (32px)
- **Button Text (Tablet)**: 1.5rem (24px)
- **Button Text (Mobile)**: 1.3rem (20.8px)
- **Title**: 1.5rem (24px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

### Text Styles
- **Button Text**: Uppercase, letter-spacing: 2px
- **Golden Text Shadow**:
  ```css
  text-shadow:
    3px 3px 0 #8B4513,
    -1px -1px 0 #FFA500,
    1px -1px 0 #FFA500,
    -1px 1px 0 #FFA500,
    1px 1px 0 #FFA500,
    0 6px 10px rgba(0, 0, 0, 0.5);
  ```

## Buttons

### Wooden Buttons (Easy/Hard)
- **Background**: `url('/Light Wood-1.png')` or specific variants
- **Size**:
  - Desktop: 100% width × 80px height
  - Tablet: 100% width × 70px height
  - Mobile: 100% width × 60px height
- **Border Radius**: 20px
- **Shadow**:
  ```css
  box-shadow:
    0 8px 0 #8B6914,
    0 10px 25px rgba(0, 0, 0, 0.4);
  ```
- **Hover**: `translateY(-4px)` with enhanced shadow
- **Active**: `translateY(6px)` with reduced shadow
- **Max Width**: 300px (desktop), 280px (tablet), 240px (mobile)

### Icon Buttons (Sound/Settings)
- **Size**: 60px × 60px (50px on mobile)
- **Background**: `linear-gradient(145deg, #f0b050, #d4941f)`
- **Border Radius**: 15px
- **Shadow**:
  ```css
  box-shadow:
    0 6px 0 #a07520,
    0 8px 15px rgba(0, 0, 0, 0.3);
  ```
- **Hover**: `translateY(-2px)` with enhanced shadow
- **Active**: `translateY(4px)` with reduced shadow
- **Font Size**: 32px (26px on mobile)

### Admin Toggle Button
- **Background**: `rgba(255, 255, 255, 0.2)` with `backdrop-filter: blur(10px)`
- **Active State**: `linear-gradient(145deg, #10b981, #059669)`
- **Border Radius**: 12px
- **Padding**: 12px 24px
- **Font Weight**: 700

## Spacing

### Layout Spacing
- **Container Padding**: 20px
- **Content Gap**: 20px (desktop), 15px (mobile)
- **Button Gap**: 15px (desktop), 12px (mobile)
- **Control Gap**: 12px (desktop), 8px (mobile)

### Margins
- **Title Bottom**: 10px
- **Button Container Top**: 0
- **Character Container Top**: 20px
- **Version Badge**: 20px from bottom-left (10px on mobile)
- **Controls**: 20px from edges (10px on mobile)

## Shadows & Effects

### Drop Shadows
- **Character/Images**: `drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))`
- **Wood Overlays**: `drop-shadow(0 6px 15px rgba(0, 0, 0, 0.4))`
- **Title**: `drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3))`

### Box Shadows
- **Cards**:
  ```css
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.5) inset;
  ```
- **Buttons**: See Buttons section above

### Backdrop Blur
- **Glass Effect**: `backdrop-filter: blur(20px) saturate(180%)`
- **Admin Toggle**: `backdrop-filter: blur(10px)`

## Animations

### Title Float
```css
@keyframes titleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
animation: titleFloat 3s ease-in-out infinite;
```

### Wood Overlay Float
```css
@keyframes woodFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}
animation: woodFloat 4s ease-in-out infinite;
```

### Tile Rotation
```css
transition: transform 0.3s linear;
/* Clockwise only: +90deg increments */
```

## Layout Structure

### Homepage
```
┌─────────────────────────────────────┐
│  [Admin Toggle]                     │
│                                     │
│         [Title Image]               │
│                                     │
│          [Easy Button]              │
│          [Hard Button]              │
│                                     │
│     [Character Scene]               │
│    [Wood Overlays on Scene]         │
│                                     │
│  [v0.1]            [Settings][Sound]│
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## Asset References

### Images
- **Title**: `/title.png` (166KB PNG)
- **Home Scene**: `/Home.png` or `/Home-graphic.png` (1.4MB PNG)
- **Easy Button**: `/Light Wood-easy.png` (11KB PNG)
- **Hard Button**: `/Light Wood-hard.png` (11KB PNG)
- **Generic Wood**: `/Light Wood-1.png` (11KB PNG)
- **Settings Icon**: `/setting.png` (6KB PNG)

### Image Sizes
- **Title**: max-width 350px (300px tablet, 250px mobile)
- **Wood Overlays**: 80px width (70px tablet, 60px mobile)
- **Character Scene**: 100% width, max-width varies by screen

## Component Specifications

### Wood Overlay Positioning
- **Left (Easy)**: 18% from left (15% tablet, 12% mobile)
- **Right (Hard)**: 18% from right (15% tablet, 12% mobile)
- **Top Position**: 8% from top (10% tablet, 12% mobile)
- **Z-index**: 10

### Version Badge
- **Position**: Fixed, bottom-left
- **Background**: `rgba(255, 255, 255, 0.3)`
- **Backdrop Filter**: `blur(10px)`
- **Border Radius**: 20px
- **Padding**: 8px 16px
- **Font Weight**: 700
- **Color**: `rgba(0, 0, 0, 0.6)`

### Star Rating (Difficulty)
- **Filled Star**: `#fbbf24` (amber-400)
- **Empty Star**: `#d1d5db` (gray-300)
- **Shadow**: `text-shadow: 0 0 4px rgba(251, 191, 36, 0.3)`
- **Font Size**: 1rem (16px) for display, 2rem (32px) for selector
- **Gap**: 2px for display, 8px for selector

## Transitions

### Standard Duration
- **Fast**: 0.2s ease
- **Medium**: 0.3s linear (rotation)
- **Slow**: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

### Hover Animations
- **Buttons**: `translateY(-2px)` or `translateY(-4px)`
- **Tiles**: Enhanced box-shadow only

### Click Animations
- **Buttons**: `translateY(4px)` or `translateY(6px)`
- **Tiles**: Clockwise rotation +90deg

## Sound Effects

### Interaction Sounds
- **Rotate**: 400Hz → 600Hz sweep (0.1s)
- **Drop**: 300Hz → 150Hz sweep (0.15s)
- **Click**: 800Hz pulse (0.05s)
- **Win**: Ascending chord (C, E, G, C)
- **Success**: Ascending chord (C, E, G)
- **Hover**: 600Hz pulse (0.05s)

### Volume Levels
- **Rotate**: 30% of master volume
- **Drop**: 25% of master volume
- **Click**: 20% of master volume
- **Win/Success**: 20-30% of master volume
- **Hover**: 10% of master volume

## Accessibility

### Focus States
- All interactive elements should have visible focus indicators
- Keyboard navigation supported for all buttons

### Touch Targets
- Minimum touch target: 44px × 44px (44x44 points)
- All buttons exceed this minimum

### Color Contrast
- Text on buttons uses high-contrast golden yellow on dark wood
- All UI text meets WCAG AA standards

## Best Practices

1. **Always use provided assets** from `/public` folder
2. **Maintain consistent spacing** using defined spacing values
3. **Use design tokens** (colors, shadows) defined in this guide
4. **Test on all breakpoints** before considering complete
5. **Keep animations subtle** - max 10px movement for float effects
6. **Sounds are optional** - always check `soundEnabled` state
7. **Rotation is clockwise only** - never counter-clockwise
8. **No rotation during drag** - only on explicit click
9. **Glass morphism** - use backdrop-filter for overlay effects
10. **Wooden textures** - always use appropriate wood asset for each button type

---

**Last Updated**: November 2025
**Version**: 1.0
