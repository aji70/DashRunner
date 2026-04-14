# Dash — Endless Runner Game

A minimalist endless runner game built with **Next.js 14**, **Canvas2D**, and **Framer Motion**. Designed for mobile (MiniPay/Celo) with touch controls and smooth 60fps gameplay.

## Features

🏃 **Player Controls**
- Swipe left/right to change lanes
- Swipe up to jump over obstacles
- Swipe down to slide under barriers
- On-screen D-pad buttons as fallback

💎 **Gameplay**
- Collect coins for points
- Dodge obstacles that increase in difficulty
- Score tracking with localStorage high scores
- Smooth lane transitions and physics-based movement

🎨 **Minimalist Design**
- Dark cyan aesthetic (`#010F10` background, `#00F0FF` accents)
- Clean geometric shapes
- No external assets required
- Mobile-optimized viewport

## Quick Start

### Install

```bash
cd /home/ajidokwu/Desktop/DashRunner
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser or mobile device simulator.

### Build & Deploy

```bash
npm run build
npm start
```

## Game Controls

| Action | Control |
|--------|---------|
| Move Left | Swipe left or `←` arrow |
| Move Right | Swipe right or `→` arrow |
| Jump | Swipe up or `↑` arrow |
| Slide | Swipe down or `↓` arrow |

## Game Mechanics

- **Coins**: Worth 1 point each, spawn randomly across lanes
- **Walls**: Tall obstacles that must be jumped over
- **Barriers**: Low obstacles that must be slid under
- **Speed**: Increases logarithmically as you progress
- **Spawn Rate**: Obstacles and coins spawn faster at higher difficulties

## Architecture

```
DashRunner/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Home page (mounts RunnerGame)
├── components/runner/
│   ├── GameCanvas.tsx      # Canvas2D renderer + game loop
│   ├── GameHUD.tsx         # Score overlay
│   ├── GameControls.tsx    # D-pad buttons
│   ├── GameOverlay.tsx     # Start/game-over screens
│   └── RunnerGame.tsx      # Root component + state
├── hooks/
│   ├── useGameLoop.ts      # rAF management
│   └── useSwipeGesture.ts  # Touch + keyboard input
├── types/
│   └── runner.ts           # Game type definitions
└── styles/
    └── globals.css         # Tailwind directives
```

## Technologies

- **Next.js 14** — App Router, SSR, zero-config
- **React 18** — Client-side state and effects
- **Canvas2D** — Hardware-accelerated rendering
- **Framer Motion 12** — UI animations
- **Tailwind CSS v4** — Utility styling
- **TypeScript** — Type safety

## Browser Support

- Chrome/Edge (mobile & desktop)
- Safari (mobile & desktop)
- Firefox (mobile & desktop)
- MiniPay WebView (Celo)

## Performance

- **Frame Rate**: Stable 60fps on mobile devices
- **Bundle Size**: ~180KB (gzipped)
- **Delta-Time Capping**: Prevents physics spiral on tab blur
- **Entity Culling**: Removes off-screen objects automatically

## Customization

### Adjust Game Speed

Edit `BASE_SPEED` and `SPEED_SCALE` in `components/runner/GameCanvas.tsx`:

```ts
const BASE_SPEED = 0.3;        // Starting speed (px/ms)
const SPEED_SCALE = 0.15;      // Difficulty scaling factor
```

### Change Colors

Edit color constants in `components/runner/GameCanvas.tsx`:

```ts
const COLOR_BG = "#010F10";         // Background
const COLOR_COIN = "#00F0FF";       // Coin color
const COLOR_OBSTACLE = "#1a3a3c";   // Obstacle fill
```

### Adjust Physics

```ts
const GRAVITY = 0.0018;             // Falling speed
const JUMP_VELOCITY = -0.7;         // Jump force
const SLIDE_DURATION = 600;         // Slide duration (ms)
```

## License

MIT

---

Built with ❤️ for MiniPay
