## 2024-05-24 - High-Frequency Re-Renders
**Learning:** Frequent state updates in root components (like App.tsx auto-refresh intervals or drag-and-drop state) can cascade down and needlessly re-render computationally heavy visual components (canvas rendering in NetworkMesh3D or charting in SystemResourcesView).
**Action:** Always wrap components containing `<canvas>` loops or complex `<LineChart>` libraries with `React.memo` and ensure the callbacks they receive are wrapped in `React.useCallback`.
