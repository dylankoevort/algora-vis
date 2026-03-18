import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateSelectionSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;
    const n = bars.length;

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        bars[i].state = 'selected';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Looking for minimum in range [${i}, ${n - 1}]`,
        });

        for (let j = i + 1; j < n; j++) {
            bars[j].state = 'comparing';
            comparisons++;
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Comparing ${bars[j].value} with current minimum ${bars[minIdx].value}`,
            });

            if (bars[j].value < bars[minIdx].value) {
                if (minIdx !== i) bars[minIdx].state = 'default';
                minIdx = j;
                bars[minIdx].state = 'selected';
                steps.push({
                    bars: cloneBars(bars),
                    comparisons,
                    swaps,
                    description: `New minimum found: ${bars[minIdx].value} at index ${minIdx}`,
                });
            } else {
                bars[j].state = 'default';
            }
        }

        if (minIdx !== i) {
            bars[i].state = 'swapping';
            bars[minIdx].state = 'swapping';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Swapping ${bars[i].value} and ${bars[minIdx].value}`,
            });
            const tmp = bars[i].value;
            bars[i].value = bars[minIdx].value;
            bars[minIdx].value = tmp;
            swaps++;
        }

        bars[i].state = 'sorted';
        if (minIdx !== i) bars[minIdx].state = 'default';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Placed ${bars[i].value} in its sorted position`,
        });
    }

    bars[n - 1].state = 'sorted';
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Array is fully sorted!',
    });

    return steps;
}