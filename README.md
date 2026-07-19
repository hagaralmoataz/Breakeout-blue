# Breakout // Terminal

A polished browser-based Breakout clone with retro terminal styling and responsive gameplay.

## Game features

- Classic paddle-and-ball brick breaker mechanics
- Multiple level layouts with varied brick patterns and spacing
- Dynamic level progression: the ball speeds up on each new level
- Power-ups dropped from broken bricks: wide paddle, slow ball, and 1-UP extra life
- Pause/resume using the `P` key
- Keyboard and mouse paddle control
- Score, lives, level, and active power-up HUD display
- Game over overlay with restart support
- Stylized CRT-inspired visuals and glow effects

## Controls

- `Arrow Left` / `Arrow Right` — move paddle
- Mouse movement — move paddle
- `Space` — launch the ball
- `P` — pause / resume

## Gameplay

Players start with a paddle and a ball that rests on the paddle until launched. The objective is to clear all bricks by bouncing the ball off the paddle and into the bricks. Each cleared level loads a new brick arrangement, and the game continues until the player loses all lives.

Breaking a brick has a chance to drop a falling power-up capsule. Catching one with the paddle triggers its effect:

| Power-up | Effect | Duration |
|---|---|---|
| Wide Paddle | Paddle width increases | 10 seconds |
| Slow Ball | Ball movement slows for the duration | 10 seconds |
| 1-UP | Extra life is granted instantly | Instant |

Timed power-ups display a live countdown in the HUD. Losing a life clears active temporary power-ups and resets the paddle to its normal width.

## Project files

- `index.html` — game UI, canvas, HUD, and overlay elements
- `style.css` — retro visual styling and layout
- `script.js` — game logic, input handling, collisions, power-ups, and rendering