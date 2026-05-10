# Game Over — Complete Feature Specification

## Trigger Conditions
- Player car collides with traffic car
- Player car hits an obstacle on road
- Player car goes off road (past red kerbs)

## Game Over Sequence

### Step 1: Freeze Scene
- Stop animate loop / pause all movement
- Traffic cars freeze in place
- Buildings stop scrolling
- Player car stays visible but stops

### Step 2: Camera Dramatic Pull (1 second)
- `camera.position.y`: current → +8
- `camera.position.z`: back by +6
- Creates cinematic "zoom out" feel

### Step 3: Game Over Overlay
- Full screen dark overlay fades in
- Background: `rgba(5, 0, 20, 0.92)`
- Backdrop-filter: `blur(8px)`
- Opacity animation: 0 → 1 over 0.4s

## Modal Content

```
┌─────────────────────────────────┐
│                                 │
│      NULLBLOCK GOT YOU          │  ← red, glitchy
│                                 │
│         GAME OVER               │  ← huge white
│                                 │
│    ┌─────────────────────┐      │
│    │   YOUR SCORE        │      │
│    │      1,247          │      │  ← teal, large
│    │   DISTANCE: 4.2km   │      │  ← white, small
│    │   COINS: $DASH 12   │      │  ← gold
│    └─────────────────────┘      │
│                                 │
│    ┌──────────┐ ┌────────────┐  │
│    │ TRY AGAIN│ │  MAIN MENU │  │
│    └──────────┘ └────────────┘  │
│                                 │
│    🏆 YOUR BEST: 2,891          │  ← below buttons
│                                 │
└─────────────────────────────────┘
```

## Styling

### Fonts & Text
- **Font:** Bebas Neue (all headings)
- **"NULLBLOCK GOT YOU"**
  - Color: `#ff2244`
  - Font-size: 18px
  - Letter-spacing: 4px
  - Animation: glitch (0.4s, plays on appear)
- **"GAME OVER"**
  - Color: `#ffffff`
  - Font-size: 72px
  - Text-shadow: `0 0 30px rgba(255,34,68,0.8)`

### Score Box
- Background: `rgba(0,229,204,0.08)`
- Border: `1px solid rgba(0,229,204,0.3)`
- Border-radius: 8px
- Padding: 20px 40px
- Score value: `#00E5CC`, 56px, font-weight 800
- Distance/coins: `rgba(255,255,255,0.7)`, 16px

### Buttons
- Both use clip-path: `polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)` (chamfered)

**TRY AGAIN**
- Background: `#00E5CC`
- Text: black

**MAIN MENU**
- Border: `1px solid rgba(255,255,255,0.3)`
- Text: white
- Background: transparent

## Animations

### Glitch Animation
```css
@keyframes glitch {
  0%   { transform: translateX(0) }
  20%  { transform: translateX(-3px) }
  40%  { transform: translateX(3px) }
  60%  { transform: translateX(-2px) }
  80%  { transform: translateX(2px) }
  100% { transform: translateX(0) }
}
.glitch-text {
  animation: glitch 0.4s ease-in-out;
}
```

## Button Actions

- **TRY AGAIN** → reset game scene, restart from score 0, same page (no reload)
- **MAIN MENU** → navigate to `/` (homepage)

## Personal Best Logic

```javascript
const currentBest = localStorage.getItem('dashrunner_best') || 0
if (currentScore > currentBest) {
  localStorage.setItem('dashrunner_best', currentScore)
  // Show "NEW RECORD!" banner above score in gold
}
```

## Implementation Notes

- Camera pull animation runs simultaneously with overlay fade-in
- Glitch animation triggers on modal appearance
- Personal best persists across sessions via localStorage
- All physics/movement stops immediately on trigger
