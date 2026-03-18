import type { SortStep, SortBar } from '../../types';

function cloneBars(bars: SortBar[]): SortBar[] {
    return bars.map((b) => ({ ...b }));
}

export function generateMergeSortSteps(initialValues: number[]): SortStep[] {
    const steps: SortStep[] = [];
    const bars: SortBar[] = initialValues.map((v) => ({ value: v, state: 'default' }));
    let comparisons = 0;
    let swaps = 0;

    function merge(left: number, mid: number, right: number) {
        const leftArr = bars.slice(left, mid + 1).map((b) => b.value);
        const rightArr = bars.slice(mid + 1, right + 1).map((b) => b.value);

        // Highlight the merge range
        for (let k = left; k <= right; k++) bars[k].state = 'comparing';
        steps.push({
            bars: cloneBars(bars),
            comparisons,
            swaps,
            description: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
        });

        let i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
            comparisons++;
            if (leftArr[i] <= rightArr[j]) {
                bars[k].value = leftArr[i];
                bars[k].state = 'swapping';
                i++;
            } else {
                bars[k].value = rightArr[j];
                bars[k].state = 'swapping';
                j++;
                swaps++;
            }
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Placing ${bars[k].value} at position ${k}`,
            });
            bars[k].state = 'default';
            k++;
        }

        while (i < leftArr.length) {
            bars[k].value = leftArr[i];
            bars[k].state = 'swapping';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Copying remaining left element ${leftArr[i]}`,
            });
            bars[k].state = 'default';
            i++;
            k++;
        }

        while (j < rightArr.length) {
            bars[k].value = rightArr[j];
            bars[k].state = 'swapping';
            steps.push({
                bars: cloneBars(bars),
                comparisons,
                swaps,
                description: `Copying remaining right element ${rightArr[j]}`,
            });
            bars[k].state = 'default';
            j++;
            k++;
        }
    }

    function mergeSort(left: number, right: number) {
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        mergeSort(left, mid);
        mergeSort(mid + 1, right);
        merge(left, mid, right);
    }

    mergeSort(0, bars.length - 1);

    bars.forEach((b) => (b.state = 'sorted'));
    steps.push({
        bars: cloneBars(bars),
        comparisons,
        swaps,
        description: 'Array is fully sorted!',
    });

    return steps;
}