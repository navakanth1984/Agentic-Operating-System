## 2024-05-24 - [Unnecessary array filter rendering in App.tsx]
**Learning:** Found array filtering `sortedTasks.filter(...)` repeatedly inside the return function to handle list UI logic in `App.tsx` which will recalculate the entire queue list heavily upon any slight state changes.
**Action:** Extract array mapping and filtering computation inside component rendering up to `useMemo` hooks so it only recalculates when specific dependencies change.
