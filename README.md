## 🍄 Super Mario Game JS

A browser-based Super Mario-style platformer built with **vanilla JavaScript, HTML, and CSS** — no frameworks, no canvas, just DOM manipulation and a tight game loop.

---

### 📸 Preview
<img src="images/game-screenshot.png" alt="Gameplay Screenshot" width="600">
<img src="images/game-screenshot2.png" alt="Gameplay Screenshot" width="600">


---

### 🕹️ Controls

| Key | Action |
|---|---|
| `← / →` or `A / D` | Move left / right |
| `Space` or `↑` or `W` | Jump |
| `↓` or `S` (on pipe) | Enter pipe → advance to next level |

---

### ⚙️ How It Works

#### Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                    Game Loop                      │
│         requestAnimationFrame → update()          │
└──────────┬──────────────┬────────────────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────────┐
    │  Game State  │ │   Player   │ │  Game Objects   │
    │ score, level │ │  x, y, vel │ │ platforms,coins │
    │ lives, keys  │ │ big, hitbox│ │ enemies, pipes  │
    └──────┬───────┘ └─────┬──────┘ └────────┬────────┘
           │              │                  │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
    │Level System │ │  Collision  │ │  Input Handler  │
    │5 lvls, load │ │ AABB detect │ │ keydown/keyup   │
    └──────┬───────┘ └─────┬──────┘ └────────┬────────┘
           │              │                  │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
    │   Physics   │ │   Items    │ │    UI Display   │
    │ gravity,vel │ │mushroom,🪙 │ │ score/lives/HUD │
    └─────────────┘ └────────────┘ └─────────────────┘
```

#### Game Constants (`app.js`)

| Constant | Value | Purpose |
|---|---|---|
| `GRAVITY` | `0.5` | Downward acceleration per frame |
| `JUMP_FORCE` | `-10` | Upward velocity on jump |
| `MOVE_SPEED` | `2.5` | Horizontal pixels per frame |
| `ENEMY_SPEED` | `0.8` | Enemy horizontal patrol speed |


### 🎯 Game Mechanics

#### Physics

Every frame, `update()` runs the full physics pass:

1. **Horizontal input** — Arrow/WASD keys set `velocityX`; releasing any key applies friction (`velocityX *= 0.8`)
2. **Jumping** — Space/↑/W fires a jump only when `grounded: true`, preventing double jumps
3. **Gravity** — `velocityY += GRAVITY` every frame while not grounded
4. **Platform collision (AABB)** — The `checkCollision()` function computes axis-aligned bounding box overlap. On a downward collision with a platform or pipe, Mario's `y` is snapped to the platform surface and `grounded` is set true


#### Enemy Behaviour

Each enemy:
1. Moves horizontally at `ENEMY_SPEED` in its current direction
2. Checks whether it still has ground beneath it; reverses direction at platform edges or the arena walls
3. On collision with Mario:
   - **Stomp** (Mario falling, feet above enemy midpoint) → enemy removed, Mario bounces, +100 score
   - **Side / bottom hit** → if Mario is big, he shrinks; if already small, he loses a life

#### Surprise Blocks

When Mario hits a surprise block from below (`velocityY < 0`):
- The block's CSS class changes to `hit` (visually emptied)
- A **mushroom** block spawns a physics-driven mushroom that falls to the nearest platform and grants Big Mario mode for ~10 seconds
- A **coin** block spawns a coin that floats upward for 3 seconds then disappears, awarding +50 score

#### Pipes & Level Progression

<h6>Pressing `↓` / `S` while standing on top of a pipe triggers `nextLevel()`. If `level > 5`, the win screen is shown instead.</h6>
---

### 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/mario-game-js.git
cd mario-game-js

# Open in browser (no server needed)
open index.html
# or just double-click index.html
```
---

### 📋 Scoring

| Action | Points |
|---|---|
| Collect a coin | +50 |
| Stomp an enemy | +100 |
| Hit a surprise block (coin) | +50 |
| Hit a surprise block (mushroom) | +100 |

---

### 🛠️ Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires no polyfills. Uses:
- `requestAnimationFrame` for the game loop
- `addEventListener` for keyboard input
- CSS `transform: rotateY()` for the coin spin animation (requires `perspective` on the parent, already set in CSS)

---

### 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

