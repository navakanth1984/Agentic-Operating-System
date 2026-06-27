## 2023-10-27 - [NetworkMesh3D Rendering Jitter]
**Learning:** [The codebase heavily relies on frequent state polling and drag-and-drop actions in `App.tsx` which causes aggressive re-renders of the entire app component tree. Complex visual components like the `NetworkMesh3D` canvas were re-evaluating without any prop changes, leading to unnecessary CPU load.]
**Action:** [Always verify that heavy visual components (like canvases or charts) are wrapped in `React.memo` if they accept primitive props and sit beneath a highly volatile parent component.]
