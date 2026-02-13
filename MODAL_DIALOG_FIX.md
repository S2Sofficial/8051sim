# Modal Dialog Fix - Main Branch

## Problem Statement

When the code was modified and the "RUN" button was clicked without pressing "Reset", a modal appeared saying "Code changed. Please Reset simulation." However, if the user closed this modal using the cross button, it would reappear infinitely because:

1. The modal trigger was based on `isModified` state checked in `stepSim()`
2. The modal was rendered conditionally based on a render-time condition instead of controlled state
3. The alert appeared synchronously inside the execution loop, breaking the event-driven flow

## Root Cause

The problematic code was:

```jsx
const stepSim = () => {
  if(isModified) { alert("Code changed. Please Reset simulation."); return; }
  // ... rest of execution
};
```

This placed the modal trigger directly in a state-driven condition check that runs on every step, causing:
- Infinite modal loops when closed
- Inability to dismiss permanently
- Tight coupling between execution and UI logic

## Solution Implemented

### 1. **New State Variables**
- `codeDirty` - Tracks when code has been modified but not reset
- `showResetDialog` - Controls modal visibility independently

### 2. **Event-Driven Logic**
Moved validation from `stepSim()` execution loop to RUN button click handler:

```jsx
<button
  onClick={() => {
    if (codeDirty) {
      setShowResetDialog(true);
      return;
    }
    setIsRunning(!isRunning);
  }}
  // ... className props
>
  {/* button content */}
</button>
```

### 3. **Modal Component**
Created `ResetDialog.jsx` with:
- Explicit state gating: modal only renders when `isOpen` is true
- Dismiss button that sets `showResetDialog` to false
- No automatic re-triggering after close
- Clean, styled overlay with proper z-index management

### 4. **State Lifecycle**
- `codeDirty` → set `true` when code changes
- `showResetDialog` → set `true` only when Run clicked + code is dirty
- Dismissing dialog → sets `showResetDialog` to `false` (stays false)
- Pressing Reset → clears `codeDirty` flag

## Files Modified

### `src/App.jsx`
- Added state: `codeDirty`, `showResetDialog`
- Modified `handleCodeChange()` to set `codeDirty: true`
- Removed `isModified` check from `stepSim()`
- Updated RUN button handler with conditional logic
- Added `ResetDialog` import and render

### `src/components/ResetDialog.jsx` (new)
- Modal component with controlled visibility
- Clear dismiss button that prevents re-triggering
- Matches app theme styling
- Accessible modal overlay with backdrop

## Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Edit code → Click Run | Infinite modal loop | Modal appears once; dismisses cleanly |
| Click Run → Dismiss → Click Run again | Loops infinitely | Modal appears each time code was edited |
| Edit code → Press Reset → Click Run | Loops on any later Run | Works normally after Reset |

## Validation

✅ Build completes successfully: `npm run build` passes
✅ No TypeScript/JSX errors
✅ All state transitions tested conceptually
✅ Modal is properly isolated from execution engine
✅ Main simulator logic remains unchanged

## Deployment Notes

- **Branch**: `main`
- **Commit**: `63d5402`
- **Type**: Bug fix
- **Impact**: Low - UI only, no core logic changes
- **Testing**: Manual testing recommended for modal dismiss flow
