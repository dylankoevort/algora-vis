import type { MazeGrid, Cell, CellType } from '../../types';

function makeCell(row: number, col: number, type: CellType = 'empty'): Cell {
    return { row, col, type, g: Infinity, h: 0, f: Infinity, parent: null };
}

export function generateMaze(rows: number, cols: number): MazeGrid {
    // Ensure odd dimensions for proper maze generation
    const r = rows % 2 === 0 ? rows - 1 : rows;
    const c = cols % 2 === 0 ? cols - 1 : cols;

    // Start with all walls
    const cells: Cell[][] = Array.from({ length: r }, (_, row) =>
        Array.from({ length: c }, (_, col) => makeCell(row, col, 'wall')),
    );

    // Recursive backtracking from a random interior odd-coordinate cell
    const startRow = 1;
    const startCol = 1;
    cells[startRow][startCol].type = 'empty';

    const stack: [number, number][] = [[startRow, startCol]];
    const directions = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2],
    ];

    while (stack.length > 0) {
        const [cr, cc] = stack[stack.length - 1];
        const neighbours: [number, number, number, number][] = [];

        for (const [dr, dc] of directions) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr > 0 && nr < r - 1 && nc > 0 && nc < c - 1 && cells[nr][nc].type === 'wall') {
                neighbours.push([nr, nc, cr + dr / 2, cc + dc / 2]);
            }
        }

        if (neighbours.length > 0) {
            const [nr, nc, wr, wc] = neighbours[Math.floor(Math.random() * neighbours.length)];
            cells[nr][nc].type = 'empty';
            cells[wr][wc].type = 'empty';
            stack.push([nr, nc]);
        } else {
            stack.pop();
        }
    }

    // Pick start (top-left area) and end (bottom-right area)
    const startPos = { row: 1, col: 1 };
    const endPos = { row: r - 2, col: c - 2 };

    cells[startPos.row][startPos.col].type = 'start';
    cells[endPos.row][endPos.col].type = 'end';

    return { cells, rows: r, cols: c, start: startPos, end: endPos };
}

export function cloneGrid(cells: Cell[][]): Cell[][] {
    return cells.map((row) => row.map((cell) => ({ ...cell, parent: cell.parent })));
}

export function getNeighbours(cells: Cell[][], row: number, col: number): Cell[] {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];
    const neighbours: Cell[] = [];
    const rows = cells.length;
    const cols = cells[0].length;

    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            neighbours.push(cells[nr][nc]);
        }
    }

    return neighbours;
}

export function manhattanDistance(
    a: { row: number; col: number },
    b: { row: number; col: number },
): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function tracePath(
    cells: Cell[][],
    end: { row: number; col: number },
): { row: number; col: number }[] {
    const path: { row: number; col: number }[] = [];
    let current: { row: number; col: number } | null = end;

    while (current !== null) {
        path.unshift(current);
        const cell: Cell = cells[current.row][current.col];
        current = cell.parent;
    }

    return path;
}