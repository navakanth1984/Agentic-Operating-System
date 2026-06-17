## 2024-05-15 - Unnecessary inline array filtering in render logic
**Learning:** `App.tsx` mapped and filtered tasks inline, causing unnecessary re-evaluations during each render, particularly heavy given the long queue limit.
**Action:** Always memoize arrays before using them in component render mappings via `useMemo` when calculating filtered components based on state.
