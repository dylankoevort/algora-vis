import type { MazeGrid, SearchStep, Cell } from '../../types';
import { cloneGrid, getNeighbours, tracePath } from './mazeGenerator';

export function generateDijkstraSteps(maze: MazeGrid): SearchStep[] {
    const steps: SearchStep[] = [];
    const cells: Cell[][] = cloneGrid(maze.cells);
    const { start, end } = maze;

    const unvisited: { row: number; col: number }[] = [];

    // Initialise all walkable cells with Infinity distance
    for (let r = 0; r < cells.length; r++) {
        for (let c = 0; c < cells[0].length; c++) {
            if (cells[r][c].type !== 'wall') {
                cells[r][c].g = Infinity;
                unvisited.push({ row: r, col: c });
            }
        }
    }

    cells[start.row][start.col].g = 0;
    let visitedCount = 0;

    steps.push({
        grid: cloneGrid(cells),
        visitedCount: 0,
        frontierCount: unvisited.length,
        description: `Dijkstra's starting. All distances set to ∞ except start (distance = 0).`,
    });

    while (unvisited.length > 0) {
        // Pick unvisited node with smallest distance
        unvisited.sort((a, b) => cells[a.row][a.col].g - cells[b.row][b.col].g);
        const current = unvisited.shift()!;
        const { row, col } = current;
        const currentCell = cells[row][col];

        if (currentCell.g === Infinity) {
            steps.push({
                grid: cloneGrid(cells),
                visitedCount,
                frontierCount: 0,
                description: 'Remaining nodes are unreachable (distance = ∞). Stopping.',
                pathFound: false,
            });
            return steps;
        }

        if (currentCell.type !== 'start' && currentCell.type !== 'end') {
            currentCell.type = 'visited';
        }
        visitedCount++;

        steps.push({
            grid: cloneGrid(cells),
            visitedCount,
            frontierCount: unvisited.length,
            description: `Visiting (${row}, ${col}) — distance from start: ${currentCell.g}`,
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
                description: `Path found! Length: ${path.length - 1} steps. Dijkstra's guarantees the shortest path.`,
                pathFound: true,
                pathLength: path.length - 1,
            });
            return steps;
        }

        for (const neighbour of getNeighbours(cells, row, col)) {
            if (neighbour.type === 'wall') continue;
            const isUnvisited = unvisited.some((n) => n.row === neighbour.row && n.col === neighbour.col);
            if (!isUnvisited) continue;

            const alt = currentCell.g + 1;
            const neighbourCell = cells[neighbour.row][neighbour.col];
            if (alt < neighbourCell.g) {
                neighbourCell.g = alt;
                neighbourCell.parent = { row, col };
                if (neighbourCell.type !== 'end') {
                    neighbourCell.type = 'frontier';
                }
            }
        }
    }

    steps.push({
        grid: cloneGrid(cells),
        visitedCount,
        frontierCount: 0,
        description: 'No path found.',
        pathFound: false,
    });

    return steps;
}