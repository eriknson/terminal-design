# Terminal Design

Interactive design prototype for the Cursor Agent terminal experience. Built with Next.js, Tailwind CSS, and ASCII art animations.

## Overview

A collection of animated scenarios exploring the look and feel of the Cursor Agent CLI — from authentication screens to the full agent loop with tool calls, subagents, and cloud handoff.

## Scenarios

| Scenario | Description |
|---|---|
| **Full Loop** | End-to-end agent session: prompt → thinking → tool calls → questions → subagents → cloud |
| **Auth** | Centered auth screen with high-FPS interpolated cube animation |
| **Auth (left-aligned)** | Left-aligned variant with cube, info panel, and external links |
| **Auth (wordmark)** | Horizontal lockup with matrix-style scramble decode entrance |
| **Idle** | Resting state with input prompt |
| **Typing** | User typing animation |
| **Questions** | Interactive question selection flow |
| **Multi-Agent** | Subagent spawning and parallel task execution |

## Key Components

- **`AnimatedAgentCLIPanel`** — Main agent loop with phased animation, tool calls, questions, subagents, and cloud migration
- **`AuthPanel`** / **`AuthPanelHighFps`** — Authentication screens with ASCII cube animation (8-frame and 17-frame interpolated variants)
- **`AuthAltPanel`** — Horizontal logo lockup with staggered typewriter entrance and matrix-style character decode
- **`DemoDesktop`** — Window chrome wrapper with draggable, resizable framing

## Cube Animation

The ASCII cube uses hand-crafted keyframes with interpolated in-between frames for smooth rotation. Animation timing uses eased delays (slower at start/end, faster in the middle) with a rest pause between cycles.

## Running

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use the tab bar to switch between scenarios.
