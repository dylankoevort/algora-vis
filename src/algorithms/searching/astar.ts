import type { MazeGrid, SearchStep, Cell } from '../../types';
import { cloneGrid, getNeighbours, manhattanDistance, tracePath } from './mazeGenerator';

export function generateAStarSteps(maze: MazeGrid): SearchStep[] {
    const steps: SearchStep[] = [];
    const cells: Cell[][] = cloneGrid(maze.cells);
    const { start, end } = maze;

    // Min-heap simulation via sorted array (fine for maze sizes)
    const openSet: { row: number; col: number }[] = [start];
    const closedSet = new Set<string>();

    cells[start.row][start.col].g = 0;
    cells[start.row][start.col].h = manhattanDistance(start, end);
    cells[start.row][start.col].f = cells[start.row][start.col].h;

    let visitedCount = 0;

    steps.push({
        grid: cloneGrid(cells),
        visitedCount: 0,
        frontierCount: 1,
        description: `A* starting. Start heuristic h=${cells[start.row][start.col].h} (Manhattan distance to end).`,
    });

    while (openSet.length > 0) {
        // Pick node with lowest f
        openSet.sort(
            (a, b) => cells[a.row][a.col].f - cells[b.row][b.col].f,
        );
        const current = openSet.shift()!;
        const { row, col } = current;
        const currentCell = cells[row][col];

        closedSet.add(`${row},${col}`);

        if (currentCell.type !== 'start' && currentCell.type !== 'end') {
            currentCell.type = 'visited';
        }
        visitedCount++;

        steps.push({
            grid: cloneGrid(cells),
            visitedCount,
            frontierCount: openSet.length,
            description: `Expanding (${row}, ${col}) — f=${currentCell.f.toFixed(0)}, g=${currentCell.g.toFixed(0)}, h=${currentCell.h.toFixed(0)}`,
        });

        if (row === end.row && col === end.col) {
            const path = tracePath(cells, end);
            for (const p of path) {
                if (cells[p.row][p.col].type !== 'start' && cells[p.row][p.col].type !== 'end') {
                    cells[p.row][p.col].type = 'path';
                }
            }
            steps.push({
                grid: cloneGrid(cells),
                visitedCount,
                frontierCount: 0,
                description: `Path found! Length: ${path.length - 1} steps. A* guarantees optimal path with an admissible heuristic.`,
                pathFound: true,
                pathLength: path.length - 1,
            });
            return steps;
        }

        for (const neighbour of getNeighbours(cells, row, col)) {
            const key = `${neighbour.row},${neighbour.col}`;
            if (closedSet.has(key) || neighbour.type === 'wall') continue;

            const tentativeG = currentCell.g + 1;
            const neighbourCell = cells[neighbour.row][neighbour.col];

            if (tentativeG < neighbourCell.g) {
                neighbourCell.parent = { row, col };
                neighbourCell.g = tentativeG;
                neighbourCell.h = manhattanDistance(neighbour, end);
                neighbourCell.f = neighbourCell.g + neighbourCell.h;

                if (!openSet.some((n) => n.row === neighbour.row && n.col === neighbour.col)) {
                    if (neighbourCell.type !== 'end') {
                        neighbourCell.type = 'frontier';
                    }
                    openSet.push({ row: neighbour.row, col: neighbour.col });
                }
            }
        }
    }

    steps.push({
        grid: cloneGrid(cells),
        visitedCount,
        frontierCount: 0,
        description: 'No path found — the end is unreachable from the start.',
        pathFound: false,
    });

    return steps;
}