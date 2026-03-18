import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateBubbleSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;
    const n = bars.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Mark comparing
            bars[j].state = 'comparing';
            bars[j + 1].state = 'comparing';
            comparisons++;
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Comparing indices ${j} (${bars[j].value}) and ${j + 1} (${bars[j + 1].value})`,
            });

            if (bars[j].value > bars[j + 1].value) {
                bars[j].state = 'swapping';
                bars[j + 1].state = 'swapping';
                steps.push({
                    bars: cloneBars(bars),
                    comparisons,
                    swaps,
                    description: `Swapping ${bars[j].value} and ${bars[j + 1].value}`,
                });
                const tmp = bars[j].value;
                bars[j].value = bars[j + 1].value;
                bars[j + 1].value = tmp;
                swaps++;
            }

            bars[j].state = 'default';
            bars[j + 1].state = 'default';
        }
        bars[n - 1 - i].state = 'sorted';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Element ${bars[n - 1 - i].value} is in its final position`,
        });
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