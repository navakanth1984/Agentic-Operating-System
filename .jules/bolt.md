## 2025-06-28 - ISO String Comparison Optimization
**Learning:** Parsing ISO string timestamps to Date objects inside a sort comparison is surprisingly slow in JavaScript/TypeScript.
**Action:** Always use lexicographical string comparison (`a > b ? 1 : a < b ? -1 : 0`) for sorting ISO-8601 date strings.
