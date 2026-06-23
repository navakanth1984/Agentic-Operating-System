## 2024-06-23 - [Stabilizing prop functions in React]
**Learning:** Un-memoized functions passed as props or used inside other useMemo/useEffect hooks can cause unnecessary re-renders or stale closures.
**Action:** Use useCallback for functions like showNotification that are heavily passed around or used in hook dependencies, to ensure referential equality.
