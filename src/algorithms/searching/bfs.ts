import type { MazeGrid, SearchStep, Cell } from '../../types';
import { cloneGrid, getNeighbours, tracePath } from './mazeGenerator';

export function generateBFSSteps(maze: MazeGrid): SearchStep[] {
    const steps: SearchStep[] = [];
    const cells: Cell[][] = cloneGrid(maze.cells);
    const { start, end } = maze;

    const queue: { row: number; col: number }[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.row},${start.col}`);
    let visitedCount = 0;

    steps.push({
        grid: cloneGrid(cells),
        visitedCount: 0,
        frontierCount: 1,
        description: `BFS starting from (${start.row}, ${start.col}). Queue initialised with start node.`,
    });

    while (queue.length > 0) {
        const { row, col } = queue.shift()!;
        const cell = cells[row][col];

        if (cell.type !== 'start' && cell.type !== 'end') {
            cell.type = 'visited';
        }
        visitedCount++;

        steps.push({
            grid: cloneGrid(cells),
            visitedCount,
            frontierCount: queue.length,
            description: `Visiting (${row}, ${col}). Queue size: ${queue.length}`,
        });

        if (row === end.row && col === end.col) {
            // Trace path
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
                description: `Path found! Length: ${path.length - 1} steps. BFS guarantees the shortest path.`,
                pathFound: true,
                pathLength: path.length - 1,
            });
            return steps;
        }

        for (const neighbour of getNeighbours(cells, row, col)) {
            const key = `${neighbour.row},${neighbour.col}`;
            if (!visited.has(key) && neighbour.type !== 'wall') {
                visited.add(key);
                cells[neighbour.row][neighbour.col].parent = { row, col };
                if (neighbour.type !== 'end') {
                    cells[neighbour.row][neighbour.col].type = 'frontier';
                }
                queue.push({ row: neighbour.row, col: neighbour.col });
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