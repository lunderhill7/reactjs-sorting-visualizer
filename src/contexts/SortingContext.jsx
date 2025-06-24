import { createContext, useState } from "react";

import { getRandomNumber, getDigit, mostDigits } from "../helpers/math";
import { awaitTimeout } from "../helpers/promises";

export const SortingContext = createContext();
const speedMap = {
    "slow": 1000,
    "normal": 500,
    "fast": 250
}

function SortingProvider({ children }) {
    const [sortingState, setSortingState] = useState({
        array: [],
        delay: speedMap["slow"],
        algorithm: "bubble_sort",
        sorted: false,
        sorting: false
    });

    const changeBar = (index, payload) => {
        setSortingState((prev) => ({
            ...prev,
            array: prev.array.map((item, i) => (i === index ? { ...item, ...payload } : item)),
        }));
    };

    const generateSortingArray = (sorting) => {
        const generatedArray = Array.from({ length: 12 }, () => {
            return {
                value: getRandomNumber(60, 1000),
                state: "idle",
            };
        });

        setSortingState((prev) => ({
            ...prev,
            array: generatedArray,
            sorted: false,
            sorting: sorting || false
        }))
    };

    const bubbleSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                changeBar(j, { state: "selected" });
                changeBar(j + 1, { state: "selected" });
                await awaitTimeout(sortingState.delay);

                if (arr[j] > arr[j + 1]) {
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    changeBar(j, { value: arr[j + 1] });
                    arr[j + 1] = temp;
                    changeBar(j + 1, { value: temp });
                    await awaitTimeout(sortingState.delay);
                }

                changeBar(j, { state: "idle" });
                changeBar(j + 1, { state: "idle" });
            }
        }
    };

    const insertionSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 1; i < arr.length; i++) {
            let current = arr[i];
            let j = i - 1;

            changeBar(i, { value: current, state: "selected" });

            while (j > -1 && current < arr[j]) {
                arr[j + 1] = arr[j];
                changeBar(j + 1, { value: arr[j], state: "selected" });
                j--;
                await awaitTimeout(sortingState.delay);
                changeBar(j + 2, { value: arr[j + 1], state: "idle" });
            }

            arr[j + 1] = current;
            changeBar(j + 1, { value: current, state: "idle" });
        }
    };

    const selectionSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 0; i < arr.length; i++) {
            let min = i;
            changeBar(min, { state: "selected" });

            for (let j = i + 1; j < arr.length; j++) {
                changeBar(j, { state: "selected" });
                await awaitTimeout(sortingState.delay);

                if (arr[j] < arr[min]) {
                    changeBar(min, { state: "idle" });
                    min = j;
                    changeBar(min, { state: "selected" });
                } else {
                    changeBar(j, { state: "idle" });
                }
            }

            if (min !== i) {
                let temp = arr[i];
                arr[i] = arr[min];
                changeBar(i, { value: arr[min], state: "idle" });
                arr[min] = temp;
                changeBar(min, { value: temp, state: "idle" });
            } else {
                changeBar(i, { state: "idle" });
                changeBar(min, { state: "idle" });
            }
        }
    };

    const mergeSort = async () => {
        const arr = sortingState.array.map((item) => item.value);
        mergeSortHelper(arr);
    };
    async function mergeSortHelper(arr, start = 0, end = arr.length - 1) {
        if (start >= end) return;

        const middle = Math.floor((start + end) / 2);
        await mergeSortHelper(arr, start, middle);
        await mergeSortHelper(arr, middle + 1, end);
        await mergeSortMerger(arr, start, middle, end);
    }
    async function mergeSortMerger(arr, start, middle, end) {
        let left = arr.slice(start, middle + 1);
        let right = arr.slice(middle + 1, end + 1);

        let i = 0,
            j = 0,
            k = start;

        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                changeBar(k, { value: left[i], state: "selected" });
                arr[k++] = left[i++];
            } else {
                changeBar(k, { value: right[j], state: "selected" });
                arr[k++] = right[j++];
            }
            await awaitTimeout(sortingState.delay);
        }

        while (i < left.length) {
            changeBar(k, { value: left[i], state: "selected" });
            arr[k++] = left[i++];
            await awaitTimeout(sortingState.delay);
        }

        while (j < right.length) {
            changeBar(k, { value: right[j], state: "selected" });
            arr[k++] = right[j++];
            await awaitTimeout(sortingState.delay);
        }

        for (let i = start; i <= end; i++) {
            changeBar(i, { value: arr[i], state: "idle" });
        }
    }

    const quickSort = async () => {
        const arr = sortingState.array.map((item) => item.value);
        quickSortHelper(arr);
    };
    const quickSortHelper = async (arr, start = 0, end = arr.length - 1) => {
        if (start >= end) {
            return;
        }

        const pivot = arr[Math.floor((start + end) / 2)];
        let i = start;
        let j = end;

        while (i <= j) {
            while (arr[i] < pivot) i++;
            while (arr[j] > pivot) j--;

            if (i <= j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                changeBar(i, { value: arr[i], state: "selected" });
                changeBar(j, { value: arr[j], state: "selected" });

                await awaitTimeout(sortingState.delay);

                changeBar(i, { value: arr[i], state: "idle" });
                changeBar(j, { value: arr[j], state: "idle" });
                i++;
                j--;
            }
        }

        await quickSortHelper(arr, start, j);
        await quickSortHelper(arr, i, end);
    }
    const heapSort = async () => {
        const arr = sortingState.array.map((item) => item.value);
        const n = arr.length;
      
        const heapify = async (arr, n, i) => {
          let largest = i;
          const left = 2 * i + 1;
          const right = 2 * i + 2;
      
          if (left < n && arr[left] > arr[largest]) largest = left;
          if (right < n && arr[right] > arr[largest]) largest = right;
      
          if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            changeBar(i, { value: arr[i], state: "selected" });
            changeBar(largest, { value: arr[largest], state: "selected" });
            await awaitTimeout(sortingState.delay);
            changeBar(i, { value: arr[i], state: "idle" });
            changeBar(largest, { value: arr[largest], state: "idle" });
            await heapify(arr, n, largest);
          }
        };
      
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
          await heapify(arr, n, i);
        }
      
        // Heap sort
        for (let i = n - 1; i > 0; i--) {
          [arr[0], arr[i]] = [arr[i], arr[0]];
          changeBar(0, { value: arr[0], state: "selected" });
          changeBar(i, { value: arr[i], state: "selected" });
          await awaitTimeout(sortingState.delay);
          changeBar(0, { value: arr[0], state: "idle" });
          changeBar(i, { value: arr[i], state: "idle" });
          await heapify(arr, i, 0);
        }
      
        // Final update
        for (let i = 0; i < arr.length; i++) {
          changeBar(i, { value: arr[i], state: "idle" });
        }
      };

      const shellSort = async () => {
        const arr = sortingState.array.map(item => item.value);
        const n = arr.length;
        let gap = Math.floor(n / 2);
      
        while (gap > 0) {
          for (let i = gap; i < n; i++) {
            let temp = arr[i];
            let j = i;
      
            changeBar(i, { value: temp, state: "selected" });
      
            while (j >= gap && arr[j - gap] > temp) {
              arr[j] = arr[j - gap];
              changeBar(j, { value: arr[j], state: "selected" });
              j -= gap;
              await awaitTimeout(sortingState.delay);
            }
      
            arr[j] = temp;
            changeBar(j, { value: temp, state: "selected" });
            await awaitTimeout(sortingState.delay);
            changeBar(j, { value: temp, state: "idle" });
          }
      
          gap = Math.floor(gap / 2);
        }
      
        for (let i = 0; i < arr.length; i++) {
          changeBar(i, { value: arr[i], state: "idle" });
        }
      };
      
      

    const radixSort = async () => {
        let arr = sortingState.array.map((item) => item.value);
        let maxDigitCount = mostDigits(arr);

        for (let k = 0; k < maxDigitCount; k++) {
            let digitBuckets = Array.from({ length: 10 }, () => []);
            for (let i = 0; i < arr.length; i++) {
                let digit = getDigit(arr[i], k);
                digitBuckets[digit].push(arr[i]);
            }

            arr = [].concat(...digitBuckets);

            for (let i = 0; i < arr.length; i++) {
                changeBar(i, { value: arr[i], state: "selected" });
                await awaitTimeout(sortingState.delay);
                changeBar(i, { value: arr[i], state: "idle" });
            }
        }
    };

    const algorithmMap = {
        "bubble_sort": bubbleSort,
        "insertion_sort": insertionSort,
        "selection_sort": selectionSort,
        "merge_sort": mergeSort,
        "quick_sort": quickSort,
        "radix_sort": radixSort,
        "heap_sort": heapSort,
        "shell_sort": shellSort
    }

    const startVisualizing = async () => {
        setSortingState((prev) => ({
            ...prev,
            sorting: true
        }))

        await algorithmMap[sortingState.algorithm]();

        setSortingState((prev) => ({
            ...prev,
            sorted: true,
            sorting: false  
        }))
    }

    const changeSortingSpeed = (e) => {
        setSortingState((prev) => ({
            ...prev,
            delay: speedMap[e.target.value] || 500
        }))
    }

    const changeAlgorithm = (algorithm) => {
        setSortingState((prev) => ({
            ...prev,
            algorithm
        }))
    }

    return (
        <SortingContext.Provider
            value={{
                sortingState,
                generateSortingArray,
                startVisualizing,
                changeSortingSpeed,
                changeAlgorithm
            }}
        >
            {children}
        </SortingContext.Provider>
    );
}

export default SortingProvider;
