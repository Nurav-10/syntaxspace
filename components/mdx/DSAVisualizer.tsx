"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  PauseIcon,
  ArrowRight01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface VisualizerState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  stepIndex: number;
  log: string;
  isSorting: boolean;
}

const DEFAULT_ARRAY = [29, 10, 14, 37, 13, 22, 8, 45, 18];

const ALGORITHMS = [
  { id: "bubble", name: "Bubble Sort" },
  { id: "insertion", name: "Insertion Sort" },
  { id: "selection", name: "Selection Sort" },
  { id: "heap", name: "Heap Sort" },
  { id: "quick", name: "Quick Sort" },
  { id: "merge", name: "Merge Sort" },
];

const COMPLEXITIES: Record<
  string,
  {
    timeBest: string;
    timeAvg: string;
    timeWorst: string;
    space: string;
    stable: string;
  }
> = {
  bubble: {
    timeBest: "O(N)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    stable: "Yes",
  },
  insertion: {
    timeBest: "O(N)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    stable: "Yes",
  },
  selection: {
    timeBest: "O(N²)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    stable: "No",
  },
  heap: {
    timeBest: "O(N log N)",
    timeAvg: "O(N log N)",
    timeWorst: "O(N log N)",
    space: "O(1)",
    stable: "No",
  },
  quick: {
    timeBest: "O(N log N)",
    timeAvg: "O(N log N)",
    timeWorst: "O(N²)",
    space: "O(log N)",
    stable: "No",
  },
  merge: {
    timeBest: "O(N log N)",
    timeAvg: "O(N log N)",
    timeWorst: "O(N log N)",
    space: "O(N)",
    stable: "Yes",
  },
};

// ----------------------------------------------------
// Step Generators
// ----------------------------------------------------

const generateBubbleSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const tempSorted: number[] = [];

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Bubble Sort initialized. Scan items sequentially.",
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...tempSorted],
        log: `Compare index ${j} (${a[j]}) and index ${j + 1} (${a[j + 1]}).`,
      });

      if (a[j] > a[j + 1]) {
        const temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;

        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapping: [j, j + 1],
          sorted: [...tempSorted],
          log: `Since ${temp} > ${a[j]}, swap them.`,
        });
      }
    }
    tempSorted.unshift(n - i - 1);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [...tempSorted],
      log: `Element at index ${n - i - 1} (${a[n - i - 1]}) is in its final sorted position.`,
    });
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Bubble Sort complete! Array fully sorted.",
  });

  return steps;
};

const generateInsertionSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Insertion Sort initialized. Take key elements one by one.",
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    steps.push({
      array: [...a],
      comparing: [i],
      swapping: [],
      sorted: Array.from({ length: i }, (_, idx) => idx),
      log: `Select key ${key} at index ${i} to insert into sorted prefix.`,
    });

    while (j >= 0 && a[j] > key) {
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [],
        log: `Compare ${a[j]} at index ${j} with key ${key}. Since ${a[j]} > ${key}, shift it right.`,
      });

      a[j + 1] = a[j];
      j--;

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [j + 2],
        sorted: [],
        log: `Shifted element to index ${j + 2}.`,
      });
    }

    a[j + 1] = key;
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [j + 1],
      sorted: [],
      log: `Placed key element ${key} at index ${j + 1}.`,
    });
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Insertion Sort complete! Array fully sorted.",
  });

  return steps;
};

const generateSelectionSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const tempSorted: number[] = [];

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Selection Sort initialized. Locate minimum element iteratively.",
  });

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    steps.push({
      array: [...a],
      comparing: [i],
      swapping: [],
      sorted: [...tempSorted],
      log: `Assume index ${i} (${a[i]}) currently holds the minimum element in unsorted bound.`,
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...a],
        comparing: [j, minIdx],
        swapping: [],
        sorted: [...tempSorted],
        log: `Compare element ${a[j]} with current minimum ${a[minIdx]}.`,
      });

      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...a],
          comparing: [j],
          swapping: [],
          sorted: [...tempSorted],
          log: `Found smaller value ${a[j]}. Set new minimum index to ${j}.`,
        });
      }
    }

    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
      steps.push({
        array: [...a],
        comparing: [i, minIdx],
        swapping: [i, minIdx],
        sorted: [...tempSorted],
        log: `Swap unsorted bounds start at index ${i} (${temp}) with minimum element (${a[i]}).`,
      });
    }
    tempSorted.push(i);
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Selection Sort complete! Array fully sorted.",
  });

  return steps;
};

const generateHeapSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Heap Sort initialized. Transform array into a Max Heap representation.",
  });

  const heapify = (size: number, idx: number, sortedList: number[]) => {
    let largest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;

    if (left < size) {
      steps.push({
        array: [...a],
        comparing: [left, largest],
        swapping: [],
        sorted: [...sortedList],
        log: `Compare parent at index ${idx} with left child at index ${left}.`,
      });
      if (a[left] > a[largest]) largest = left;
    }

    if (right < size) {
      steps.push({
        array: [...a],
        comparing: [right, largest],
        swapping: [],
        sorted: [...sortedList],
        log: `Compare largest so far with right child at index ${right}.`,
      });
      if (a[right] > a[largest]) largest = right;
    }

    if (largest !== idx) {
      const temp = a[idx];
      a[idx] = a[largest];
      a[largest] = temp;
      steps.push({
        array: [...a],
        comparing: [idx, largest],
        swapping: [idx, largest],
        sorted: [...sortedList],
        log: `Heapify: Swap parent ${temp} with child ${a[idx]}.`,
      });
      heapify(size, largest, sortedList);
    }
  };

  // Build Heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, []);
  }

  const sortedList: number[] = [];
  for (let i = n - 1; i > 0; i--) {
    const temp = a[0];
    a[0] = a[i];
    a[i] = temp;
    sortedList.unshift(i);

    steps.push({
      array: [...a],
      comparing: [0, i],
      swapping: [0, i],
      sorted: [...sortedList],
      log: `Heap Extract: Swap max element ${temp} with heap boundary ${a[0]} at index ${i}.`,
    });
    heapify(i, 0, sortedList);
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Heap Sort complete! Array fully sorted.",
  });

  return steps;
};

const generateQuickSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Quick Sort initialized. Partition subarrays recursively using pivot points.",
  });

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const pIdx = partition(low, high);
      quickSort(low, pIdx - 1);
      quickSort(pIdx + 1, high);
    }
  };

  const partition = (low: number, high: number) => {
    const pivot = a[high];
    steps.push({
      array: [...a],
      comparing: [high],
      swapping: [],
      sorted: [],
      log: `Subarray partition: Select pivot ${pivot} at index ${high}.`,
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({
        array: [...a],
        comparing: [j, high],
        swapping: [],
        sorted: [],
        log: `Compare element ${a[j]} with pivot ${pivot}.`,
      });

      if (a[j] < pivot) {
        i++;
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
        steps.push({
          array: [...a],
          comparing: [i, j],
          swapping: [i, j],
          sorted: [],
          log: `Since ${a[i]} < pivot (${pivot}), swap index ${i} and index ${j}.`,
        });
      }
    }

    const temp = a[i + 1];
    a[i + 1] = a[high];
    a[high] = temp;

    steps.push({
      array: [...a],
      comparing: [i + 1, high],
      swapping: [i + 1, high],
      sorted: [],
      log: `Place pivot ${pivot} into its sorted position by swapping with index ${i + 1}.`,
    });

    return i + 1;
  };

  quickSort(0, n - 1);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Quick Sort complete! Array fully sorted.",
  });

  return steps;
};

const generateMergeSortSteps = (arr: number[]) => {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    log: "Merge Sort initialized. Split and merge subarrays divide-and-conquer style.",
  });

  const merge = (l: number, m: number, r: number) => {
    const leftArr = a.slice(l, m + 1);
    const rightArr = a.slice(m + 1, r + 1);

    let i = 0,
      j = 0,
      k = l;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        array: [...a],
        comparing: [l + i, m + 1 + j],
        swapping: [],
        sorted: [],
        log: `Merge Compare: index ${l + i} (${leftArr[i]}) vs index ${m + 1 + j} (${rightArr[j]}).`,
      });

      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i];
        i++;
      } else {
        a[k] = rightArr[j];
        j++;
      }
      k++;

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [k - 1],
        sorted: [],
        log: `Place smaller element ${a[k - 1]} into combined index ${k - 1}.`,
      });
    }

    while (i < leftArr.length) {
      a[k] = leftArr[i];
      i++;
      k++;
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [k - 1],
        sorted: [],
        log: `Copy remaining element ${a[k - 1]} from left side to index ${k - 1}.`,
      });
    }

    while (j < rightArr.length) {
      a[k] = rightArr[j];
      j++;
      k++;
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [k - 1],
        sorted: [],
        log: `Copy remaining element ${a[k - 1]} from right side to index ${k - 1}.`,
      });
    }
  };

  const mergeSort = (l: number, r: number) => {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m);
      mergeSort(m + 1, r);
      merge(l, m, r);
    }
  };

  mergeSort(0, n - 1);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    log: "Merge Sort complete! Array fully sorted.",
  });

  return steps;
};

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------

export function DSAVisualizer() {
  const [activeAlgo, setActiveAlgo] = React.useState("bubble");

  const [state, setState] = React.useState<VisualizerState>({
    array: [...DEFAULT_ARRAY],
    comparing: [],
    swapping: [],
    sorted: [],
    stepIndex: 0,
    log: "Select a sorting technique to begin.",
    isSorting: false,
  });

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Stably memoize step list depending on algorithm selection
  const steps = React.useMemo(() => {
    switch (activeAlgo) {
      case "bubble":
        return generateBubbleSortSteps(DEFAULT_ARRAY);
      case "insertion":
        return generateInsertionSortSteps(DEFAULT_ARRAY);
      case "selection":
        return generateSelectionSortSteps(DEFAULT_ARRAY);
      case "heap":
        return generateHeapSortSteps(DEFAULT_ARRAY);
      case "quick":
        return generateQuickSortSteps(DEFAULT_ARRAY);
      case "merge":
        return generateMergeSortSteps(DEFAULT_ARRAY);
      default:
        return [];
    }
  }, [activeAlgo]);

  // Synchronize state when switching algorithms
  React.useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState({
      array: [...DEFAULT_ARRAY],
      comparing: [],
      swapping: [],
      sorted: [],
      stepIndex: 0,
      log: `Initialized ${ALGORITHMS.find((a) => a.id === activeAlgo)?.name}. Click 'Play' or 'Step' to begin.`,
      isSorting: false,
    });
  }, [activeAlgo]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState({
      array: [...DEFAULT_ARRAY],
      comparing: [],
      swapping: [],
      sorted: [],
      stepIndex: 0,
      log: `${ALGORITHMS.find((a) => a.id === activeAlgo)?.name} visualizer reset. Click 'Play' to start.`,
      isSorting: false,
    });
  };

  const handleStepForward = () => {
    if (steps.length === 0) return;
    const nextIdx = state.stepIndex + 1;
    if (nextIdx < steps.length) {
      const nextStep = steps[nextIdx];
      setState((prev) => ({
        ...prev,
        ...nextStep,
        stepIndex: nextIdx,
      }));
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setState((prev) => ({ ...prev, isSorting: false }));
    }
  };

  const handlePlay = () => {
    if (state.isSorting) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState((prev) => ({ ...prev, isSorting: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSorting: true }));

    timerRef.current = setInterval(() => {
      setState((prev) => {
        const nextIdx = prev.stepIndex + 1;
        if (nextIdx < steps.length) {
          return {
            ...prev,
            ...steps[nextIdx],
            stepIndex: nextIdx,
          };
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, isSorting: false };
        }
      });
    }, 600);
  };

  const getBarColor = (index: number) => {
    if (state.swapping.includes(index)) {
      return "bg-rose-500 border-rose-600 dark:bg-rose-400 dark:border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    }
    if (state.comparing.includes(index)) {
      return "bg-amber-400 border-amber-500 dark:bg-amber-300 dark:border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    }
    if (state.sorted.includes(index)) {
      return "bg-emerald-500 border-emerald-600 dark:bg-emerald-400 dark:border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]";
    }
    return "bg-muted-foreground/10 border-border hover:bg-muted-foreground/20 transition-all duration-150";
  };

  const activeComplexity = COMPLEXITIES[activeAlgo];

  return (
    <div className="my-8 border border-border rounded-xl bg-card overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none">
      {/* Selector Tabs Grid */}
      <div className="bg-muted/30 border-b border-border p-3">
        <span className="text-sm font-black text-muted-foreground uppercase block mb-3 select-none">
          Select Sorting Algorithm to Analyze
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 select-none">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setActiveAlgo(algo.id)}
              className={cn(
                "py-1.5 px-2 rounded text-[11px] font-semibold text-center transition-all duration-150 cursor-pointer",
                activeAlgo === algo.id
                  ? "bg-foreground text-background font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
              )}
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithmic Complexity Information cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 border-b border-border bg-muted/10 select-none divide-x divide-y md:divide-y-0 divide-border">
        <div className="p-3 text-center">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Best Time
          </span>
          <span className="text-xs font-bold font-mono text-violet-600 dark:text-violet-400 mt-1 block">
            {activeComplexity.timeBest}
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Average Time
          </span>
          <span className="text-xs font-bold font-mono text-violet-600 dark:text-violet-400 mt-1 block">
            {activeComplexity.timeAvg}
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Worst Time
          </span>
          <span className="text-xs font-bold font-mono text-rose-500 mt-1 block">
            {activeComplexity.timeWorst}
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Space Complexity
          </span>
          <span className="text-xs font-bold font-mono text-[#10b981] mt-1 block">
            {activeComplexity.space}
          </span>
        </div>
        <div className="p-3 text-center col-span-2 md:col-span-1">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Stability Status
          </span>
          <span
            className={cn(
              "text-xs font-bold mt-1 block uppercase tracking-wider",
              activeComplexity.stable === "Yes"
                ? "text-emerald-500"
                : "text-amber-500",
            )}
          >
            {activeComplexity.stable === "Yes" ? "Stable" : "Unstable"}
          </span>
        </div>
      </div>

      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-3 border-b border-border bg-muted/5 gap-3">
        <div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Visual Interactive Sandbox
          </span>
          <h4 className="text-xs font-bold text-foreground mt-0.5">
            {ALGORITHMS.find((a) => a.id === activeAlgo)?.name} Execution Trace
          </h4>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 select-none">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8 rounded-md hover:bg-accent/40 active:scale-95"
            title="Reset Array"
          >
            <HugeiconsIcon icon={RefreshIcon} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleStepForward}
            disabled={state.stepIndex >= steps.length - 1}
            className="h-8 w-8 rounded-md hover:bg-accent/40 active:scale-95 disabled:opacity-50"
            title="Step Forward"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePlay}
            className="h-8 rounded-md px-3 flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
          >
            {state.isSorting ? (
              <>
                <HugeiconsIcon icon={PauseIcon} className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={PlayIcon} className="h-3.5 w-3.5" />
                <span>Play Trace</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Array Bars Container */}
      <div className="h-56 flex items-end justify-center gap-1.5 sm:gap-2 px-6 pb-6 pt-10 border-b border-border relative bg-muted/5">
        {/* Step Progress Tracker */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded border border-border/80">
          Step {state.stepIndex} / {steps.length - 1}
        </div>

        {state.array.map((value, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center flex-1 max-w-[36px] group"
          >
            {/* Value Label */}
            <span className="text-[9px] font-black font-mono text-foreground mb-1.5 select-none">
              {value}
            </span>
            {/* Visual Bar */}
            <div
              style={{ height: `${value * 3.3}px` }}
              className={cn(
                "w-full rounded-t-sm border-t border-x transition-all duration-150",
                getBarColor(idx),
              )}
            />
            {/* Index label */}
            <span className="text-[9px] font-mono text-muted-foreground mt-1 select-none">
              {idx}
            </span>
          </div>
        ))}
      </div>

      {/* Terminal Log Output */}
      <div className="p-4 bg-zinc-950 dark:bg-black font-mono text-xs text-zinc-300 flex items-start gap-2.5 min-h-[50px] border-t border-border">
        <span className="text-emerald-500 shrink-0 select-none">$</span>
        <p className="flex-1 text-zinc-200">{state.log}</p>
      </div>

      {/* Color Code Legend */}
      <div className="flex flex-wrap gap-4 px-5 py-2.5 border-t border-border bg-muted/10 text-[9px] text-muted-foreground font-black uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-muted-foreground/10 border border-border" />
          <span>Unsorted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-amber-400 border border-amber-500" />
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-rose-500 border border-rose-600" />
          <span>Swapping/Overwriting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-emerald-500 border border-emerald-600" />
          <span>Sorted bounds</span>
        </div>
      </div>
    </div>
  );
}
