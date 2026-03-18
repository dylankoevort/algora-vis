import type { SearchAlgorithmId, SearchStep, MazeGrid } from '../../types';
import { generateBFSSteps } from './bfs';
import { generateDFSSteps } from './dfs';
import { generateAStarSteps } from './astar';
import { generateDijkstraSteps } from './dijkstra';

export function runSearchAlgorithm(id: SearchAlgorithmId, maze: MazeGrid): SearchStep[] {
    switch (id) {
        case 'bfs':
            return generateBFSSteps(maze);
        case 'dfs':
            return generateDFSSteps(maze);
        case 'astar':
            return generateAStarSteps(maze);
        case 'dijkstra':
            return generateDijkstraSteps(maze);
    }
}

export { generateMaze } from './mazeGenerator';