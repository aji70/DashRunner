# DASH RUNNER 🏁

A minimalist endless runner game built with **Next.js 14**, **Three.js**, and **Celo blockchain**. Designed for mobile (MiniPay/Celo) with touch controls and smooth 60fps gameplay.

## The Story

### "The Celo City Underground"

It's 2047. Celo City is the last free metropolis on Earth — governed not by corporations but by smart contracts. Every transaction, every law, every race result is immutable on-chain. No corruption. No cheating. The score you post is the score that lives forever.

A cartel called **NULLBLOCK** has taken over the city's racing league. They're manipulating leaderboards, front-running transactions, and bribing validators. They want to control which scores get written on-chain — and they'll run anyone off the road who threatens their dominance.

You're **DASH** — an underground racer with a wallet and a grudge. Your brother posted the highest score ever recorded in Celo City. NULLBLOCK wiped it from the chain. You're here to beat it, post it permanently, and expose them.

### 5-Act Story Structure

| Act | District         | Boss              | Unlock                              |
|-----|-----------------|-------------------|-------------------------------------|
| 1   | The Sprawl       | NULLBLOCK Enforcer | Basic car skin NFT                 |
| 2   | Neon Quarter     | Block Phantom      | Turbo boost ability                |
| 3   | The Chain Bridge | Validator Zero     | New car model                      |
| 4   | Dead Node        | The Forger         | $DASH token airdrop                |
| 5   | Genesis Block    | NULLBLOCK CEO      | Legendary car NFT + name on-chain forever |

### Why Blockchain?

Every race result in DASH RUNNER is more than a number — it's a permanent record. Built on **Celo**, optimised for **MiniPay**, DASH RUNNER brings arcade racing to the 3 billion people who access the internet primarily through mobile.

Your score isn't stored on our servers. It isn't controlled by us. It lives on the chain — immutable, uncensorable, yours forever.

**NULLBLOCK can't touch it. Nobody can.**

---

## Features

🏃 **Player Controls**
- Swipe left/right to change lanes
- Swipe up to jump over obstacles
- Swipe down to brake (temporary slowdown)
- Keyboard arrows as fallback

💎 **Gameplay**
- Race through procedurally-generated Celo City districts
- Collect coins and nitro pickups
- Dodge NULLBLOCK traffic agents (AI-controlled cars)
- Score posted on-chain at end of each run
- Earn $DASH tokens for distance, near-misses, and evasion
- Unlock NFT car parts and cosmetics

🎮 **3D Rendering**
- WebGL 3D environment with cyberpunk aesthetic
- Dynamic camera following player movement
- Procedural building and street light recycling
- Parallax background layers
- Speed-based FOV expansion
- Mobile-optimized with DPR scaling

⛓️ **Blockchain Integration**
- Celo-native scoring (immutable race results)
- MiniPay / WalletConnect support
- On-chain NFT minting for achievements
- $DASH token rewards

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
- **Three.js** — WebGL 3D rendering
- **React Three Fiber** — React renderer for Three.js
- **Celo** — Blockchain (EVM compatible)
- **MiniPay** — Mobile wallet integration
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

---

*Your score lives forever. Make it count.*

Built with ❤️ for Celo & MiniPay
