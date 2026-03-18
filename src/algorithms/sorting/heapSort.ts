import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateHeapSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;
    const n = bars.length;

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
        bars[i].state = 'default';
        bars[j].state = 'default';
    }

    function heapify(size: number, root: number) {
        let largest = root;
        const left = 2 * root + 1;
        const right = 2 * root + 2;

        if (left < size) {
            comparisons++;
            bars[left].state = 'comparing';
            bars[largest].state = 'selected';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Comparing parent ${bars[largest].value} with left child ${bars[left].value}`,
            });
            if (bars[left].value > bars[largest].value) largest = left;
            bars[left].state = 'default';
            bars[root].state = 'default';
        }

        if (right < size) {
            comparisons++;
            bars[right].state = 'comparing';
            bars[largest].state = 'selected';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Comparing with right child ${bars[right].value}`,
            });
            if (bars[right].value > bars[largest].value) largest = right;
            bars[right].state = 'default';
            bars[largest].state = 'default';
        }

        if (largest !== root) {
            swap(root, largest);
            heapify(size, largest);
        }
    }

    // Build max heap
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Building max-heap from the array',
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Max-heap built. Now extracting elements.',
    });

    // Extract elements
    for (let i = n - 1; i > 0; i--) {
        swap(0, i);
        bars[i].state = 'sorted';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Extracted max ${bars[i].value} to position ${i}`,
        });
        heapify(i, 0);
    }

    bars[0].state = 'sorted';
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Array is fully sorted!',
    });

    return steps;
}