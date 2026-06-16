## 2026-06-16 - [SystemResourcesView Optimization]
**Learning:** Found an opportunity to replace multiple O(n) array traversals (reduce/reduce/Math.max) for `avgCpu`, `avgMem`, and `maxCpu` in `src/components/SystemResourcesView.tsx` with a single O(n) pass using `useMemo` caching. Replaced `Math.max(...array)` which risks exceeding the call stack limit on large arrays.
**Action:** Always check loop aggregations on larger array arrays for consolidation into a single `for` loop pass to prevent excessive redundant iterations.
