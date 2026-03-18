import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateQuickSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;

    function swap(i: number, j: number) {
        bars[i].state = 'swapping';
        bars[j].state = 'swapping';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Swapping ${bars[i].value} and ${bars[j].value}`,
        });
        const tmp = bars[i].value;
        bars[i].value = bars[j].value;
        bars[j].value = tmp;
        swaps++;
    }

    function partition(low: number, high: number): number {
        const pivot = bars[high].value;
        bars[high].state = 'pivot';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Pivot selected: ${pivot} at index ${high}`,
        });

        let i = low - 1;
        for (let j = low; j < high; j++) {
            bars[j].state = 'comparing';
            comparisons++;
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Comparing ${bars[j].value} with pivot ${pivot}`,
            });

            if (bars[j].value <= pivot) {
                i++;
                if (i !== j) {
                    swap(i, j);
                    bars[i].state = 'default';
                    bars[j].state = 'default';
                } else {
                    bars[j].state = 'default';
                }
            } else {
                bars[j].state = 'default';
            }
            bars[high].state = 'pivot';
        }

        swap(i + 1, high);
        const pivotIdx = i + 1;
        bars[pivotIdx].state = 'sorted';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Pivot ${pivot} placed at its final position ${pivotIdx}`,
        });
        return pivotIdx;
    }

    function quickSort(low: number, high: number) {
        if (low >= high) {
            if (low === high) bars[low].state = 'sorted';
            return;
        }
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
    }

    quickSort(0, bars.length - 1);

    bars.forEach((b) => (b.state = 'sorted'));
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Array is fully sorted!',
    });

    return steps;
}