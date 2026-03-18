# Algora Vis

An interactive algorithm visualiser built with React, TypeScript, Vite, Tailwind CSS v4, and nanostores. Visualise ten classic sorting and pathfinding algorithms step-by-step, with full playback controls, speed settings, and persistent preferences.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works — The Core Architecture](#how-it-works--the-core-architecture)
    - [The Step Pre-computation Model](#the-step-pre-computation-model)
    - [Global State with Nanostores](#global-state-with-nanostores)
    - [The Playback Engine](#the-playback-engine)
- [Algorithms](#algorithms)
    - [Sorting Algorithms](#sorting-algorithms)
    - [Pathfinding Algorithms](#pathfinding-algorithms)
- [The Maze Generator](#the-maze-generator)
- [Component Architecture](#component-architecture)
- [Routing](#routing)
- [Tailwind v4 Notes](#tailwind-v4-notes)
- [Persisted State](#persisted-state)
- [TypeScript Types](#typescript-types)
- [Adding a New Algorithm](#adding-a-new-algorithm)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Type-check without building
pnpm tsc --noEmit

# Production build
pnpm build
```

> **Requires Node 18+** and `pnpm`. The Vite dev server runs on `http://localhost:5173` by default.

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| React | 19 | UI rendering |
| TypeScript | 5.9 | Type safety throughout |
| Vite | 8 | Dev server and bundler |
| Tailwind CSS | 4.2 | Styling (CSS-first config) |
| `@tailwindcss/vite` | bundled | Vite integration for Tailwind v4 |
| nanostores | 1.x | Lightweight global state |
| `@nanostores/react` | 1.x | React bindings for nanostores |
| react-router-dom | 7 | Client-side routing |

---

## Project Structure

```
algora-vis/
├── index.html                        # Entry HTML — loads Google Fonts
├── vite.config.ts                    # Vite + Tailwind v4 plugin setup
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                      # React root mount
    ├── App.tsx                       # BrowserRouter + route tree
    ├── index.css                     # Tailwind v4 @import + @theme + @utility
    │
    ├── types/
    │   └── index.ts                  # All shared TypeScript types and interfaces
    │
    ├── stores/
    │   └── index.ts                  # All nanostores atoms, computed stores, actions
    │
    ├── hooks/
    │   └── usePlayback.ts            # Animation loop hook + play/pause/step actions
    │
    ├── algorithms/
    │   ├── meta.ts                   # Algorithm metadata (complexity, descriptions)
    │   ├── sorting/
    │   │   ├── index.ts              # runSortAlgorithm() dispatcher + generateRandomArray()
    │   │   ├── bubbleSort.ts
    │   │   ├── insertionSort.ts
    │   │   ├── selectionSort.ts
    │   │   ├── mergeSort.ts
    │   │   ├── quickSort.ts
    │   │   └── heapSort.ts
    │   └── searching/
    │       ├── index.ts              # runSearchAlgorithm() dispatcher
    │       ├── mazeGenerator.ts      # Recursive backtracking maze + grid helpers
    │       ├── bfs.ts
    │       ├── dfs.ts
    │       ├── astar.ts
    │       └── dijkstra.ts
    │
    ├── components/
    │   ├── ui/
    │   │   └── index.tsx             # Button, Badge, Select, Divider, Stat primitives
    │   ├── layout/
    │   │   ├── TopBar.tsx            # Sticky header: logo, algorithm dropdowns, play controls
    │   │   ├── PlayControls.tsx      # Play/pause/step buttons, speed pills, progress bar
    │   │   └── InfoPanel.tsx         # Complexity badges + live step stats
    │   ├── sorting/
    │   │   └── SortingVisualiser.tsx # Bar chart visualiser
    │   └── searching/
    │       ├── SearchingVisualiser.tsx # Maze grid visualiser
    │       └── MazeCell.tsx          # Single cell component
    │
    └── pages/
        ├── HomePage.tsx              # Algorithm selection cards
        └── VisualiserPage.tsx        # Visualiser + clickable progress scrubber
```

---

## How It Works — The Core Architecture

### The Step Pre-computation Model

The most important design decision in Algora Vis is that **algorithms do not run in real time**. Instead, when you select an algorithm, the entire algorithm runs immediately to completion, and every intermediate state is captured as a `SortStep` or `SearchStep` object in an array. Playback then just walks through this pre-computed array.

```
Select algorithm
      │
      ▼
runSortAlgorithm(id, values)
      │
      ▼
[SortStep, SortStep, SortStep, ...]   ← stored in $sortSteps
      │
      ▼
$currentStepIndex increments on a timer
      │
      ▼
$currentSortStep = $sortSteps[$currentStepIndex]
      │
      ▼
React renders current bars / grid
```

**Why pre-compute?**

- Play, pause, step forward, and step backward are all instant — there is no algorithm state to save or restore.
- The progress scrubber can jump to any frame without replaying anything.
- Speed changes take effect immediately on the next tick.
- The algorithm logic is completely decoupled from the rendering layer.

**The tradeoff** is memory. A 120-element array with a slow algorithm like Bubble Sort can generate thousands of steps, each holding a full copy of the bar array. In practice this is fine for the sizes used (10–120 elements), but it's worth knowing if you extend it.

---

### Global State with Nanostores

All state lives in `src/stores/index.ts`. Nanostores was chosen over React context or Redux because it is tiny (~1KB), has zero boilerplate, and its atoms can be read and written from outside React components — which matters for the playback action functions.

#### Atoms (mutable state)

| Store | Type | Description |
|---|---|---|
| `$activeCategory` | `'sorting' \| 'searching' \| null` | Which visualiser is showing |
| `$activeSortAlgorithm` | `SortAlgorithmId` | Selected sort algo ID |
| `$activeSearchAlgorithm` | `SearchAlgorithmId` | Selected search algo ID |
| `$playState` | `'idle' \| 'playing' \| 'paused' \| 'finished'` | Current playback state |
| `$speed` | `0.5 \| 1 \| 2 \| 3` | Playback speed multiplier |
| `$currentStepIndex` | `number` | Index into the current steps array |
| `$sortSteps` | `SortStep[]` | All pre-computed sort frames |
| `$searchSteps` | `SearchStep[]` | All pre-computed search frames |
| `$sortArraySize` | `number` | Number of bars (10–120) |
| `$mazeGrid` | `MazeGrid \| null` | The current maze structure |
| `$mazeSize` | `{ rows, cols }` | Maze dimensions |

#### Computed stores (derived, read-only)

| Store | Derived from | Description |
|---|---|---|
| `$activeAlgorithmId` | category + both algorithm IDs | The active algorithm's ID regardless of category |
| `$currentSortStep` | `$sortSteps` + `$currentStepIndex` | The step object currently being rendered |
| `$currentSearchStep` | `$searchSteps` + `$currentStepIndex` | Same for search |
| `$totalSteps` | category + both step arrays | Length of the active steps array |
| `$progress` | `$currentStepIndex` + `$totalSteps` | 0–100 integer for the progress bar |

#### Persisted atoms

Several atoms use a `persistedAtom<T>` helper that wraps a regular atom and synchronises it to `localStorage` on every change, and reads from `localStorage` on initialisation. The following keys are persisted:

```
algora:activeCategory        — last viewed category
algora:activeSortAlgorithm   — last selected sort algorithm
algora:activeSearchAlgorithm — last selected search algorithm
algora:speed                 — playback speed preference
algora:sortArraySize         — array size slider position
algora:mazeSize              — maze dimensions
```

This means your speed preference and last-used algorithm survive a page refresh.

---

### The Playback Engine

The playback engine lives in `src/hooks/usePlayback.ts` and consists of two parts.

**`usePlayback()` hook** — dropped into each visualiser component. It subscribes to `$playState`, `$speed`, `$currentStepIndex`, and `$totalSteps`. Whenever `$playState` is `'playing'`, it schedules a `setTimeout` to increment `$currentStepIndex` after a delay, then cleans up and reschedules on every render. The delay is:

```
delay (ms) = 100 / speed
```

So at 1× speed each frame takes 100ms, at 2× it takes 50ms, at 0.5× it takes 200ms.

When `$currentStepIndex` reaches `$totalSteps - 1`, the hook sets `$playState` to `'finished'` instead of scheduling another tick.

**Action functions** — plain functions that read from and write to stores directly, usable anywhere:

```ts
play()         // start playing; if at end, resets to step 0 first
pause()        // pause without resetting position
stepForward()  // advance one frame; pauses if currently playing
stepBackward() // go back one frame; pauses if currently playing
restart()      // reset to step 0 and set state to idle
```

Because nanostores atoms expose `.get()` and `.set()` without needing to be inside a React component, these functions work identically whether called from a button click handler or from another module.

---

## Algorithms

### Sorting Algorithms

Every sorting algorithm follows the same contract:

```ts
function generateXxxSortSteps(initialValues: number[]): SortStep[]
```

It receives the initial unsorted array, runs the full sort, and returns every intermediate state as a `SortStep`:

```ts
interface SortStep {
  bars: SortBar[];      // full snapshot of all bar values and states
  comparisons: number;  // cumulative comparison count
  swaps: number;        // cumulative swap/write count
  description: string;  // human-readable description of this operation
}

interface SortBar {
  value: number;
  state: SortBarState;  // 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'selected'
}
```

Each step holds a **deep clone** of the bars array at that moment in time. This isolation is what makes scrubbing safe — you can never accidentally mutate a past frame.

#### Bubble Sort — `bubbleSort.ts`

The classic O(n²) algorithm. Steps through the array comparing adjacent pairs and swapping when out of order. After each full pass, the largest unsorted element has bubbled to its final position and is marked `sorted`. The outer loop runs `n-1` times; the inner loop shrinks each pass.

- Stable: yes (only swaps strict `>`, never `>=`)
- Best case O(n): the implementation does not include an early-exit optimisation for already-sorted input, so best case is still O(n²) in this visualiser

#### Insertion Sort — `insertionSort.ts`

Builds a sorted prefix one element at a time. For each element, shifts all larger sorted elements one position right to make room, then inserts the element in its correct position. Uses the `selected` state for the element being inserted and `sorted` for the growing sorted prefix.

- Stable: yes
- Very efficient for small arrays and nearly-sorted data

#### Selection Sort — `selectionSort.ts`

Divides the array into a sorted left partition and an unsorted right partition. Each pass scans the unsorted portion for the minimum, marks it as `selected`, then swaps it into position at the start of the unsorted portion. Only performs one swap per pass, so the swap count is always exactly `n-1`.

- Stable: no (a swap can move an equal element across another)
- Worst-case swap count is better than Bubble Sort

#### Merge Sort — `mergeSort.ts`

Recursively divides the array in half until sub-arrays are length 1, then merges them back in sorted order. The recursive calls are made first (so steps appear bottom-up), and the merge step highlights the range being merged in `comparing`, then writes elements back with `swapping`. The step array captures every individual write during every merge.

- Stable: yes (left sub-array wins on equal elements)
- Space: O(n) — the merge step uses temporary arrays for the left and right halves

#### Quick Sort — `quickSort.ts`

Uses the last element of each sub-array as the pivot (highlighted as `pivot`). Partitions around the pivot by scanning left-to-right and swapping any element ≤ pivot past a running index `i`. After partitioning, the pivot is placed in its final sorted position. Sub-arrays are then recursively sorted. Because the pivot is chosen naively (last element), worst-case is O(n²) on already-sorted input.

- Stable: no
- Space: O(log n) average for the call stack

#### Heap Sort — `heapSort.ts`

Two phases. First, builds a max-heap from the array bottom-up by calling `heapify` on every non-leaf node from right to left. Second, repeatedly extracts the maximum (root) by swapping it to the end of the unsorted portion and calling `heapify` to restore the heap property. Uses `selected` for the parent being compared and `swapping` for elements being exchanged.

- Stable: no
- Guaranteed O(n log n) — unlike Quick Sort, worst case cannot degrade

---

### Pathfinding Algorithms

Every search algorithm follows the same contract:

```ts
function generateXxxSteps(maze: MazeGrid): SearchStep[]
```

It receives the maze, runs the full search, and returns a `SearchStep` for every meaningful state change:

```ts
interface SearchStep {
  grid: Cell[][];        // full snapshot of the maze grid at this moment
  visitedCount: number;  // cells fully explored
  frontierCount: number; // cells queued but not yet explored
  description: string;   // human-readable step description
  pathFound?: boolean;   // set on the final step
  pathLength?: number;   // number of steps in the path (if found)
}
```

Each `Cell` carries:

```ts
interface Cell {
  row: number;
  col: number;
  type: CellType;                         // determines the colour shown
  g: number;                              // cost from start (used by Dijkstra and A*)
  h: number;                              // heuristic estimate to goal (A* only)
  f: number;                              // g + h (A* only)
  parent: { row: number; col: number } | null;  // for path tracing
}
```

Cell colours:

| Type | Colour | Meaning |
|---|---|---|
| `empty` | White | Passable corridor |
| `wall` | Dark grey | Impassable |
| `start` | Green ▶ | Start position |
| `end` | Red ■ | Goal position |
| `visited` | Light blue | Fully explored |
| `frontier` | Amber | Discovered but not yet expanded |
| `path` | Violet | The final path traced back from goal to start |

#### BFS — `bfs.ts`

Uses a FIFO queue. Expands nodes layer by layer, guaranteeing the shortest path in an unweighted grid. When the goal is dequeued, `tracePath` walks the `parent` chain back to the start to highlight the path.

- Optimal: yes (shortest path in unweighted graph)
- Explores in expanding rings — you will see the frontier grow evenly outward

#### DFS — `dfs.ts`

Uses a LIFO stack (last-in, first-out). Follows one path as deep as possible before backtracking. Does not guarantee the shortest path — it finds *a* path, often a winding one. The frontier shrinks and grows unpredictably compared to BFS.

- Optimal: no
- Good for demonstrating why path length varies by strategy

#### A\* — `astar.ts`

Uses a priority queue (sorted array) ordered by `f = g + h`, where:
- `g` = actual cost from the start (steps taken)
- `h` = Manhattan distance heuristic to the goal (`|row_goal - row| + |col_goal - col|`)
- `f` = estimated total cost through this cell

A* always expands the node with the lowest `f`, so it is guided toward the goal. The Manhattan heuristic is *admissible* (never overestimates in a grid with no diagonal moves), guaranteeing optimality. The step description shows the current `f`, `g`, and `h` values.

- Optimal: yes
- Typically explores far fewer nodes than BFS, especially in open mazes

#### Dijkstra's — `dijkstra.ts`

Initialises every walkable cell with distance `∞`, sets the start cell to `0`, then repeatedly extracts the unvisited cell with the smallest `g` (actual distance from start) and relaxes its neighbours. Equivalent to A\* with `h = 0` — it explores all directions equally by cost, not by heuristic guidance.

- Optimal: yes
- Explores more cells than A\* in open space since it has no directional bias

---

## The Maze Generator

`src/algorithms/searching/mazeGenerator.ts` generates a perfect maze using **recursive backtracking** (also called depth-first maze generation):

1. Start with a grid filled entirely with walls.
2. Mark the cell at `(1, 1)` as empty and push it onto a stack.
3. While the stack is not empty:
    - Look at the top cell. Find all unvisited neighbours **2 cells away** (not 1 — this preserves wall cells between corridors).
    - If any exist, pick one at random, carve through the wall between them, and push the neighbour.
    - If none exist, pop the stack (backtrack).

The result is a perfect maze — exactly one path between any two cells, no loops, no isolated regions. This matters for the pathfinding algorithms: every generated maze is guaranteed to have a valid path from start to finish.

**Odd dimensions**: The algorithm requires odd row and column counts to work correctly (corridors sit on odd coordinates, walls on even). If even dimensions are passed in, they are decremented by 1.

**Start and end positions**: Start is always `(1, 1)` (top-left corridor cell), end is always `(rows-2, cols-2)` (bottom-right corridor cell).

**Helper functions** also exported from this file:

```ts
cloneGrid(cells)              // deep clone a Cell[][] for step snapshots
getNeighbours(cells, row, col) // return the 4 orthogonal non-wall neighbours
manhattanDistance(a, b)        // |Δrow| + |Δcol|
tracePath(cells, end)          // walk the parent chain to reconstruct the path
```

---

## Component Architecture

### TopBar

The sticky header always visible at the top. Contains:
- **Logo** (clickable, navigates to `/`)
- **Sort dropdown** — selecting an item calls `selectSortAlgorithm()`, sets category to `'sorting'`, and navigates to `/visualise`
- **Search dropdown** — same for search
- **Active algorithm pill** — shows the display name of whatever is currently active
- **PlayControls** — only rendered when a category is active (i.e., on the visualiser page)

The active dropdown is styled with a filled dark background so you can see at a glance which category is currently showing.

### PlayControls

Lives in the TopBar. Contains, left to right:
- Step backward button
- Play / Pause button (primary, dark background)
- Step forward button
- Restart button
- Speed pill group (0.5× / 1× / 2× / 3×)
- Progress bar (narrow, 80px wide, shows `$progress`)
- Step counter (`currentStep + 1 / totalSteps`)
- Status pill (Idle / Live / Paused / Done)

All buttons call the standalone action functions from `usePlayback.ts` and are correctly disabled based on the current `$playState` and `$currentStepIndex`.

### SortingVisualiser

Renders when `$activeCategory === 'sorting'`. On mount and whenever `algorithmId` or `arraySize` changes, it:
1. Generates a new random array with `generateRandomArray(arraySize)`
2. Calls `runSortAlgorithm(algorithmId, values)` to pre-compute all steps
3. Stores them in `$sortSteps`

The bar chart renders `$currentSortStep.bars` (falling back to `$sortSteps[0]` so bars are visible immediately before play is pressed). Each bar is a flex child with `flex: 1` so bars share the full width equally regardless of count. Bar height is a CSS percentage of the container height based on `value / maxValue`. Colours are set via inline `style` (not Tailwind classes) to avoid the v4 content-scanner limitation.

**Array size slider** sets `$sortArraySize` which is persisted to localStorage. Changing it triggers a re-generation.

### SearchingVisualiser

Renders when `$activeCategory === 'searching'`. On mount:
1. If no maze exists yet (`$mazeGrid` is null), calls `generateMaze()` and immediately runs the algorithm
2. If a maze already exists (e.g., navigated back to the page), just re-runs the algorithm on it

When the algorithm changes after mount, only the algorithm is re-run on the existing maze (no new maze is generated). When "New Maze" is clicked, a fresh maze is generated and the algorithm re-run.

A `ResizeObserver` watches the container and recomputes `cellSize` — the pixel dimension of each grid cell — to be the largest value that fits the maze within the available space (capped at 28px per cell).

The maze is rendered as a CSS grid with `grid-template-columns: repeat(cols, {cellSize}px)`. Each cell is a `MazeCell` component.

### MazeCell

A memoised (`React.memo`) component that renders a single grid cell. Colour is an inline CSS value looked up from a static map. Start and end cells render small SVG icons (a play triangle and a filled square). The `React.memo` wrapper prevents unnecessary re-renders — only cells whose `type` actually changed will re-render on each step.

### InfoPanel

Two variants — `SortInfoPanel` and `SearchInfoPanel` — rendered as a strip below the visualiser. Shows:
- Algorithm description text
- Current step description in a monospace box
- Live counters (comparisons/swaps for sort; visited/frontier/path length for search)
- Complexity badges (time and space)
- Property badges (stable/unstable, optimal/suboptimal, complete)

---

## Routing

Two routes, defined in `App.tsx`:

| Path | Component | Description |
|---|---|---|
| `/` | `HomePage` | Algorithm selection cards |
| `/visualise` | `VisualiserPage` | The active visualiser |
| `*` | Redirect to `/` | Catch-all |

`VisualiserPage` reads `$activeCategory` and renders either `SortingVisualiser` or `SearchingVisualiser`. If `$activeCategory` is null (e.g., navigated directly to `/visualise` without selecting anything), it shows an empty state with a link back to the home page.

The **progress scrubber** — a 4px-tall clickable bar — sits between the TopBar and the visualiser. Clicking anywhere on it jumps `$currentStepIndex` to the corresponding frame. It only renders when `$totalSteps > 0`.

---

## Tailwind v4 Notes

Tailwind v4 changes the configuration model significantly compared to v3:

**No `tailwind.config.js`** — all theme customisation lives in `src/index.css` inside an `@theme` block:

```css
@import "tailwindcss";

@theme {
  --font-sans: "DM Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --font-display: "Syne", sans-serif;
  --animate-fade-in: fadeIn 0.3s ease-out;
  --animate-slide-up: slideUp 0.4s ease-out;

  @keyframes fadeIn { ... }
  @keyframes slideUp { ... }
}

@utility font-700 { font-weight: 700; }
@utility font-800 { font-weight: 800; }
```

Tailwind v4 automatically generates `font-sans`, `font-mono`, `font-display` utilities from the `--font-*` CSS variables, and `animate-fade-in`, `animate-slide-up` from `--animate-*` variables.

**No `postcss.config.js`** — Tailwind is loaded as a Vite plugin directly:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

**Dynamic class limitation**: Tailwind v4 scans source files for complete class name strings at build time. Class names assembled at runtime from lookup maps (like `'bg-' + color`) will not appear in the output CSS. In this project, bar colours and maze cell colours are therefore applied via **inline `style` props with raw CSS hex values**, not Tailwind utility classes.

---

## Persisted State

The following user preferences survive a hard refresh via `localStorage`:

| Key | Default | Description |
|---|---|---|
| `algora:activeCategory` | `null` | Last viewed visualiser |
| `algora:activeSortAlgorithm` | `'bubble-sort'` | Last selected sort algorithm |
| `algora:activeSearchAlgorithm` | `'bfs'` | Last selected search algorithm |
| `algora:speed` | `1` | Playback speed |
| `algora:sortArraySize` | `40` | Number of bars |
| `algora:mazeSize` | `{ rows: 21, cols: 35 }` | Maze dimensions |

Note: step arrays (`$sortSteps`, `$searchSteps`) and the maze grid (`$mazeGrid`) are **not** persisted — they are re-generated fresh on every mount. Only lightweight preference values are saved.

To clear all persisted state:
```js
Object.keys(localStorage).filter(k => k.startsWith('algora:')).forEach(k => localStorage.removeItem(k))
```

---

## TypeScript Types

All types live in `src/types/index.ts`. The key ones:

```ts
// Playback
type PlayState = 'idle' | 'playing' | 'paused' | 'finished';
type Speed = 0.5 | 1 | 2 | 3;

// Sorting
type SortAlgorithmId = 'bubble-sort' | 'merge-sort' | 'quick-sort'
                     | 'insertion-sort' | 'selection-sort' | 'heap-sort';
type SortBarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'selected';

interface SortStep {
  bars: SortBar[];        // full snapshot of all bars
  comparisons: number;
  swaps: number;
  description: string;
}

// Searching
type SearchAlgorithmId = 'bfs' | 'dfs' | 'astar' | 'dijkstra';
type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path';

interface SearchStep {
  grid: Cell[][];         // full snapshot of the maze
  visitedCount: number;
  frontierCount: number;
  description: string;
  pathFound?: boolean;
  pathLength?: number;
}
```

---

## Adding a New Algorithm

### New sorting algorithm

1. Create `src/algorithms/sorting/mySort.ts` and export `generateMySortSteps(values: number[]): SortStep[]`.
2. Add the algorithm ID to `SortAlgorithmId` in `src/types/index.ts`.
3. Add a `case` to `runSortAlgorithm()` in `src/algorithms/sorting/index.ts`.
4. Add a `SortAlgorithmMeta` entry to `SORT_ALGORITHMS` in `src/algorithms/meta.ts`.

That's it — the TopBar dropdown, homepage card, and info panel all populate from the metadata array automatically.

### New pathfinding algorithm

1. Create `src/algorithms/searching/mySearch.ts` and export `generateMySearchSteps(maze: MazeGrid): SearchStep[]`.
2. Add the ID to `SearchAlgorithmId` in `src/types/index.ts`.
3. Add a `case` to `runSearchAlgorithm()` in `src/algorithms/searching/index.ts`.
4. Add a `SearchAlgorithmMeta` entry to `SEARCH_ALGORITHMS` in `src/algorithms/meta.ts`.