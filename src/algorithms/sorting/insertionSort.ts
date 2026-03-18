import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateInsertionSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;
    const n = bars.length;

    bars[0].state = 'sorted';
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'First element is trivially sorted',
    });

    for (let i = 1; i < n; i++) {
        const key = bars[i].value;
        bars[i].state = 'selected';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Picking element ${key} to insert into sorted portion`,
        });

        let j = i - 1;
        while (j >= 0 && bars[j].value > key) {
            comparisons++;
            bars[j].state = 'comparing';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `${bars[j].value} > ${key}, shifting right`,
            });
            bars[j + 1].value = bars[j].value;
            bars[j + 1].state = 'swapping';
            bars[j].state = 'sorted';
            swaps++;
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Shifted ${bars[j + 1].value} to position ${j + 1}`,
            });
            j--;
        }

        if (j >= 0) {
            comparisons++;
        }

        bars[j + 1].value = key;
        bars[j + 1].state = 'sorted';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Inserted ${key} at position ${j + 1}`,
        });
    }

    bars.forEach((b) => (b.state = 'sorted'));
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Array is fully sorted!',
    });

    return steps;
}