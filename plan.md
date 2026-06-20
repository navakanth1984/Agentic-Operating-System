1. **Optimize redundant array iterations in `App.tsx`**:
   - Move the `priorityWeight` mapping outside the component to avoid object allocation on every `useMemo` evaluation.
   - Introduce a `useMemo` hook to calculate `filteredTasks` and `taskCounts` in a single pass. Currently, `App.tsx` runs `sortedTasks.filter(...)` inline 5 separate times during every render (once for each tab count, once for empty check, and once for `.map`).
   - Replace the inline `.filter()` calls in the JSX with the newly memoized `filteredTasks` and `taskCounts`.
   - Add comments explaining the optimization and expected performance impact (Reduces iterations from O(5N) to O(N) per dependency change, eliminating redundant allocations).

2. **Complete pre-commit steps**:
   - Run `npm run lint` and any required tests to verify code stability and correctness.
   - Ensure a performance journal entry is added to `.jules/bolt.md` if this represents a critical learning.

3. **Submit the PR**:
   - Use the designated PR format: "⚡ Bolt: [performance improvement]".
   - Detail What, Why, Impact, and Measurement in the description.
