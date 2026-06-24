# Task 4 Report: 应用入口 (app.js)

## Summary

Implemented `js/app.js` — the application entry point, covering Tab switching, itinerary rendering, map lazy initialization, and FAB button binding.

## Files Modified

- `js/app.js` — from placeholder comment to full implementation

## Implementation Details

### DOM References (lines 4-24)
- Tab buttons (`tabBtns`), tab content containers (`tabContents`), FAB buttons (`fabBtns`)
- All Sheet-related DOM elements (for Task 5 consumption)

### State Variables (lines 27-32)
- `currentTab`, `mapsInitialized`, `currentSheetCity`, `currentSheetType`, `selectedPOI`, `searchTimer`

### Itinerary Rendering (lines 35-56) — `renderItinerary()`
- Iterates `ITINERARY` from `data.js`
- Builds timeline HTML: icon, date, route (`from → to`), info (time + label), card-type badge
- Called once on page load

### Tab Switching (lines 59-93) — `switchTab(tabName)`
- Toggles `.active` class on `.tab-btn` elements
- Shows/hides `.tab-content` via `.hidden` class
- Lazily initializes city map on first switch to a city tab

### Map Lazy Initialization (lines 96-114) — `initCityMap(city)`
- Creates `AMap.Map` via `createMap()` with preset city centers
- Stores map reference in `_mapState[city].map`
- Calls `updateHotelCoords()` to geocode hotel name → precise lat/lng, then places hotel marker and re-centers map
- Calls `loadAndShowSpots()` to place saved spot/food markers (expects `_onMarkerClick` from Task 5)

### FAB Button Binding (lines 117-122)
- Binds click events on both FAB buttons to `openAddSheet(city)` (defined in Task 5)

## Dependencies
All variables/functions consumed are global (`var`/`const` in the project scope):
- `ITINERARY`, `HOTELS` — from `data.js`
- `createMap`, `addHotelMarker`, `loadAndShowSpots`, `updateHotelCoords`, `_mapState`, `_onMarkerClick` — from `map.js`
- `openAddSheet` — to be defined in Task 5

## Verification
- All variable declarations use `var` as required
- Tab switching switches active class and toggles visibility
- Map only initializes on first city-tab switch (lazy)
- Hotel marker placed after geocoding completes
- Itinerary renders on page load
- FAB click handlers bound
