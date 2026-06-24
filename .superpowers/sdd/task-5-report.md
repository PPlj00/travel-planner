# Task 5 Report: Sheet 面板 — 添加地点 JS 逻辑

## Summary

Implemented the "添加地点" (Add Place) bottom sheet panel JS logic in `js/app.js`, covering sheet open/close, type switching, debounced POI search, result selection, and save with map refresh.

## Files Modified

- `js/app.js` — appended Sheet panel logic (lines 127–285)

## Implementation Details

### City Name Mapping (lines 129–133)
- `_cityNames` dictionary maps internal city keys (`chongqing`, `wuhan`) to Chinese names for AMap POI search.

### openAddSheet(city) (lines 139–172)
- Sets `currentSheetCity`, updates sheet title with city name.
- Resets all UI state: type to `'spot'`, clears input/note, hides results/selected-info.
- Resets type button active states to "景点".
- Disables the save button (no POI selected yet).
- Shows overlay and sheet.
- Delays focus on search input (350ms) to let CSS animation complete.

### closeAddSheet() (lines 177–192)
- Hides overlay and sheet.
- Clears search debounce timer.
- Resets `currentSheetCity` and `selectedPOI` to null; clears search input.

### Type Selection (lines 194–202)
- Click on `.type-btn` toggles `active` class and updates `currentSheetType` (`'spot'` | `'food'`).

### Debounced POI Search (lines 204–258)
- `input` event listener on `#poi-search-input`.
- Clears previous timer on each keystroke.
- Requires at least 2 characters; otherwise hides results.
- After 300ms idle, calls `searchPOI(keyword, cityName, callback)`.
- Renders results as `<li>` elements inside `#poi-results`.
- Each result item is clickable to select the POI.
- Empty results display a "未找到相关地点" message.

### POI Selection (lines 234–249)
- Sets `selectedPOI` to the clicked POI object.
- Updates `#selected-info` with name and address.
- Shows `selected-info`, hides `poi-results`, clears search input.
- Enables the save button.

### Save Button (lines 261–279)
- Validates `selectedPOI` and `currentSheetCity`.
- Builds spot object: `{ id, name, type, lat, lng, address, note }`.
  - `id` via `generateId()`, `lat`/`lng` from `selectedPOI.location`.
- Calls `saveSpot(currentSheetCity, spot)` to persist to localStorage.
- Calls `refreshSpotMarkers(currentSheetCity)` to update map markers.
- Closes the sheet via `closeAddSheet()`.

### Cancel & Overlay Close (lines 281–285)
- `#btn-cancel` click calls `closeAddSheet()`.
- `#sheet-overlay` click calls `closeAddSheet()`.

## Dependencies

- `searchPOI(keyword, city, callback)` — from `map.js`
- `refreshSpotMarkers(city)` — from `map.js`
- `saveSpot(city, spot)` — from `storage.js`
- `generateId()` — from `storage.js`

## Edge Cases Handled

- **Empty search input**: hides results list.
- **Short keyword (<2 chars)**: aborts search, hides results.
- **No POI results**: shows "未找到相关地点" placeholder.
- **Double-click prevention**: save button disabled until a POI is selected.
- **Timer cleanup**: `searchTimer` cleared on close and on each new input event.
- **State reset**: opening the sheet always resets all form state regardless of previous session.
