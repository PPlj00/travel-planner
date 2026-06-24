# 旅游行程规划手机网页 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个手机端旅游行程网页，包含行程时间线 + 重庆/武汉两张高德地图（标注住宿/景点/美食/地铁），支持手机上直接搜索 POI 添加地点。

**Architecture:** 纯静态 HTML/CSS/JS，无构建工具。index.html 加载高德地图 SDK 和 4 个 JS 模块（data / storage / map / app），通过底部 Tab 切换三个视图。用户数据存 localStorage，高德 PlaceSearch 做 POI 搜索。

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6+), 高德地图 JS API 2.0, localStorage

## Global Constraints

- API Key: `232b574120ffd77a50ae4664bcc3a507`
- 移动端适配：viewport width=device-width, max-width: 480px 居中
- 底部 Tab Bar 固定，触摸目标 ≥ 44px
- 无后端、无框架、无构建工具
- 部署目标：GitHub Pages

---

### Task 1: 项目骨架 — index.html + 基础 CSS

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/data.js`（空文件占位）
- Create: `js/storage.js`（空文件占位）
- Create: `js/map.js`（空文件占位）
- Create: `js/app.js`（空文件占位）

**Interfaces:**
- Produces: HTML DOM 结构（三个 Tab 容器、底部导航栏、添加 Sheet 骨架、地图容器），CSS 变量和基础样式

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p css js
```

- [ ] **Step 2: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>我的旅游行程</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <!-- 内容区域 -->
    <main id="content">
      <!-- 行程 Tab -->
      <section id="tab-itinerary" class="tab-content">
        <div class="page-header">
          <h1>🗺️ 我的行程</h1>
          <p class="page-subtitle">6.29 — 7.5</p>
        </div>
        <div id="timeline" class="timeline"></div>
      </section>

      <!-- 重庆地图 Tab -->
      <section id="tab-chongqing" class="tab-content hidden">
        <div id="map-chongqing" class="map-container"></div>
        <button id="fab-chongqing" class="fab" title="添加地点">＋</button>
      </section>

      <!-- 武汉地图 Tab -->
      <section id="tab-wuhan" class="tab-content hidden">
        <div id="map-wuhan" class="map-container"></div>
        <button id="fab-wuhan" class="fab" title="添加地点">＋</button>
      </section>
    </main>

    <!-- 底部导航栏 -->
    <nav id="tab-bar">
      <button class="tab-btn active" data-tab="itinerary">
        <span class="tab-icon">📋</span>
        <span class="tab-label">行程</span>
      </button>
      <button class="tab-btn" data-tab="chongqing">
        <span class="tab-icon">🏙️</span>
        <span class="tab-label">重庆</span>
      </button>
      <button class="tab-btn" data-tab="wuhan">
        <span class="tab-icon">🌆</span>
        <span class="tab-label">武汉</span>
      </button>
    </nav>
  </div>

  <!-- 添加地点 Sheet 遮罩 -->
  <div id="sheet-overlay" class="sheet-overlay hidden"></div>

  <!-- 添加地点底部 Sheet -->
  <div id="add-sheet" class="bottom-sheet">
    <div class="sheet-handle"></div>
    <h2 id="sheet-title">添加地点</h2>

    <!-- 类型选择 -->
    <div class="sheet-types">
      <button class="type-btn active" data-type="spot">🏔️ 景点</button>
      <button class="type-btn" data-type="food">🍜 美食</button>
    </div>

    <!-- 搜索输入 -->
    <div class="sheet-search">
      <input type="text" id="poi-search-input" placeholder="输入地点名称搜索…" autocomplete="off">
      <ul id="poi-results" class="poi-results hidden"></ul>
    </div>

    <!-- 已选中的地点信息 -->
    <div id="selected-info" class="selected-info hidden">
      <p class="selected-name"></p>
      <p class="selected-address"></p>
    </div>

    <!-- 备注 -->
    <textarea id="note-input" placeholder="备注（可选）" rows="2" maxlength="200"></textarea>

    <!-- 操作按钮 -->
    <div class="sheet-actions">
      <button id="btn-cancel" class="btn btn-cancel">取消</button>
      <button id="btn-save" class="btn btn-save" disabled>保存</button>
    </div>
  </div>

  <!-- 高德地图 JS API -->
  <script src="https://webapi.amap.com/maps?v=2.0&key=232b574120ffd77a50ae4664bcc3a507"></script>
  <script src="js/data.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/map.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 css/style.css 基础样式**

```css
/* === CSS 变量 === */
:root {
  --color-primary: #4A90D9;
  --color-spot: #E74C3C;
  --color-food: #F39C12;
  --color-hotel: #3498DB;
  --color-bg: #F5F6FA;
  --color-surface: #FFFFFF;
  --color-text: #2C3E50;
  --color-text-secondary: #7F8C8D;
  --color-border: #E8ECF1;
  --tab-height: 64px;
  --header-height: 80px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --radius: 12px;
}

/* === Reset === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}

/* === App 容器 === */
#app {
  max-width: 480px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

/* === 内容区域 === */
#content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: var(--tab-height);
  -webkit-overflow-scrolling: touch;
}

/* === Tab 内容 === */
.tab-content {
  min-height: 100%;
}

.tab-content.hidden {
  display: none;
}

/* === 页面头部 === */
.page-header {
  padding: 24px 20px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}

/* === 地图容器 === */
.map-container {
  width: 100%;
  height: calc(100vh - var(--tab-height));
  max-height: calc(100vh - var(--tab-height));
}

/* === 底部导航栏 === */
#tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: var(--tab-height);
  padding-bottom: var(--safe-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  cursor: pointer;
  min-height: 48px;
  transition: color 0.2s;
}

.tab-btn .tab-icon {
  font-size: 22px;
}

.tab-btn.active {
  color: var(--color-primary);
}
```

- [ ] **Step 4: 创建空的 JS 占位文件**

```bash
touch js/data.js js/storage.js js/map.js js/app.js
# 或者直接创建一个带注释的空文件
echo "// 固定数据" > js/data.js
echo "// localStorage 操作" > js/storage.js
echo "// 高德地图封装" > js/map.js
echo "// 应用入口" > js/app.js
```

- [ ] **Step 5: 验证** — 在浏览器中打开 `index.html`，确认页面能加载，底部 Tab 栏可见

---

### Task 2: 固定数据 + localStorage 模块

**Files:**
- Modify: `js/data.js`
- Modify: `js/storage.js`

**Interfaces:**
- Produces:
  - `ITINERARY` (全局数组) — 5 条行程记录
  - `HOTELS` (全局对象) — 两个酒店的 name/lat/lng
  - `loadSpots(city: string): Spot[]`
  - `saveSpot(city: string, spot: Spot): void`
  - `deleteSpot(city: string, id: string): void`
  - `generateId(): string`

- [ ] **Step 1: 编写 js/data.js**

```js
// 固定数据：行程 & 住宿

// 行程时间线
const ITINERARY = [
  {
    date: "6月29日",
    time: "晚上",
    from: "延吉",
    to: "长春",
    type: "train",
    icon: "🚄",
    label: "高铁"
  },
  {
    date: "6月30日",
    time: "早上",
    from: "长春",
    to: "重庆",
    type: "flight",
    icon: "✈️",
    label: "飞机"
  },
  {
    date: "7月2日",
    time: "",
    from: "重庆",
    to: "武汉",
    type: "train",
    icon: "🚄",
    label: "高铁"
  },
  {
    date: "7月5日",
    time: "12:45",
    from: "武汉",
    to: "长春",
    type: "flight",
    icon: "✈️",
    label: "飞机"
  },
  {
    date: "7月5日",
    time: "",
    from: "长春",
    to: "延吉",
    type: "train",
    icon: "🚄",
    label: "高铁"
  }
];

// 住宿（坐标将在初始化时通过高德 Geocoder 精确获取）
const HOTELS = {
  chongqing: {
    name: "Asiam亚美丽晶江景酒店（重庆观音桥店）",
    lat: 29.5750,
    lng: 106.5330
  },
  wuhan: {
    name: "汉庭武汉梦时代街道口地铁站酒店",
    lat: 30.5270,
    lng: 114.3530
  }
};
```

- [ ] **Step 2: 编写 js/storage.js**

```js
// localStorage 操作：用户添加的景点和美食

const STORAGE_KEYS = {
  chongqing: "chongqing_spots",
  wuhan: "wuhan_spots"
};

/**
 * 从 localStorage 加载指定城市的地点列表
 * @param {string} city - "chongqing" | "wuhan"
 * @returns {Array} 地点数组
 */
function loadSpots(city) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[city]);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("加载数据失败:", e);
    return [];
  }
}

/**
 * 保存一个地点到指定城市
 * @param {string} city
 * @param {object} spot - { id, name, type, lat, lng, address, note }
 */
function saveSpot(city, spot) {
  const spots = loadSpots(city);
  spots.push(spot);
  localStorage.setItem(STORAGE_KEYS[city], JSON.stringify(spots));
}

/**
 * 从指定城市删除一个地点
 * @param {string} city
 * @param {string} id
 */
function deleteSpot(city, id) {
  const spots = loadSpots(city);
  const filtered = spots.filter(function(s) { return s.id !== id; });
  localStorage.setItem(STORAGE_KEYS[city], JSON.stringify(filtered));
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
```

- [ ] **Step 3: 验证** — 在浏览器控制台中执行：
```js
saveSpot("chongqing", { id: generateId(), name: "测试", type: "spot", lat: 29.5, lng: 106.5, address: "", note: "" });
console.log(loadSpots("chongqing")); // 应该输出包含"测试"的数组
deleteSpot("chongqing", "刚才的id");
console.log(loadSpots("chongqing")); // 应该输出空数组
```

---

### Task 3: 完整 CSS 样式

**Files:**
- Modify: `css/style.css`

**Interfaces:**
- Consumes: HTML DOM 结构（来自 Task 1）
- Produces: 所有视觉样式（时间线、地图全屏、FAB 按钮、底部 Sheet、信息窗口）

- [ ] **Step 1: 追加时间线样式到 style.css**

```css
/* === 行程时间线 === */
.timeline {
  padding: 20px;
  position: relative;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 36px;
  top: 24px;
  bottom: 24px;
  width: 3px;
  background: linear-gradient(to bottom, var(--color-primary), #764ba2);
  border-radius: 2px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  position: relative;
}

.timeline-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1;
  border: 3px solid var(--color-primary);
}

.timeline-card {
  flex: 1;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.timeline-card .card-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.timeline-card .card-route {
  font-size: 17px;
  font-weight: 600;
}

.timeline-card .card-route .arrow {
  margin: 0 8px;
  color: var(--color-text-secondary);
}

.timeline-card .card-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.timeline-card .card-type {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: #EEF2FF;
  color: var(--color-primary);
  margin-top: 6px;
}
```

- [ ] **Step 2: 追加 FAB 按钮、Sheet、信息窗口样式**

```css
/* === FAB 浮动按钮 === */
.fab {
  position: absolute;
  bottom: 24px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.4);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

/* === Sheet 遮罩 === */
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  transition: opacity 0.3s;
}

.sheet-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

/* === 底部 Sheet === */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  z-index: 201;
  padding: 12px 20px 24px;
  padding-bottom: calc(24px + var(--safe-bottom));
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
}

.bottom-sheet.hidden {
  transform: translateX(-50%) translateY(100%);
}

.sheet-handle {
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: #D0D5DD;
  margin: 0 auto 16px;
}

.bottom-sheet h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}

/* === 类型选择按钮 === */
.sheet-types {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  min-height: 48px;
}

.type-btn.active[data-type="spot"] {
  border-color: var(--color-spot);
  background: #FEF0EF;
  color: var(--color-spot);
}

.type-btn.active[data-type="food"] {
  border-color: var(--color-food);
  background: #FFF8EE;
  color: var(--color-food);
}

/* === 搜索输入 === */
.sheet-search {
  position: relative;
  margin-bottom: 12px;
}

.sheet-search input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.sheet-search input:focus {
  border-color: var(--color-primary);
}

.poi-results {
  list-style: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius) var(--radius);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.poi-results.hidden {
  display: none;
}

.poi-results li {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 14px;
}

.poi-results li:last-child {
  border-bottom: none;
}

.poi-results li:active {
  background: #F5F6FA;
}

.poi-results .poi-name {
  font-weight: 500;
}

.poi-results .poi-addr {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* === 已选地点信息 === */
.selected-info {
  padding: 12px;
  background: #F0F7FF;
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.selected-info.hidden {
  display: none;
}

.selected-info .selected-name {
  font-weight: 600;
  font-size: 15px;
}

.selected-info .selected-address {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* === 备注输入 === */
#note-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 15px;
  resize: none;
  outline: none;
  font-family: inherit;
  margin-bottom: 16px;
}

#note-input:focus {
  border-color: var(--color-primary);
}

/* === Sheet 操作按钮 === */
.sheet-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-height: 48px;
}

.btn-cancel {
  background: #F0F0F0;
  color: var(--color-text-secondary);
}

.btn-save {
  background: var(--color-primary);
  color: white;
  transition: opacity 0.2s;
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* === 自定义信息窗口样式（通过高德 InfoWindow 的 content 属性注入）=== */
/* 这些类在高德 InfoWindow 内部使用 */
.info-window-content {
  padding: 8px 4px;
  min-width: 180px;
}

.info-window-content .iw-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-window-content .iw-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin-right: 6px;
}

.info-window-content .iw-badge.spot {
  background: #FEF0EF;
  color: var(--color-spot);
}

.info-window-content .iw-badge.food {
  background: #FFF8EE;
  color: var(--color-food);
}

.info-window-content .iw-address {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.info-window-content .iw-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

.info-window-content .iw-delete {
  display: block;
  margin-top: 10px;
  padding: 6px 0;
  width: 100%;
  border: none;
  background: none;
  color: var(--color-spot);
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  border-top: 1px solid var(--color-border);
}
```

- [ ] **Step 3: 验证** — 在浏览器中打开 `index.html`，确认页面样式正常，导航栏在底部

---

### Task 4: 地图模块 (map.js)

**Files:**
- Modify: `js/map.js`

**Interfaces:**
- Consumes: 全局 `AMap`（高德 SDK）、`HOTELS`（来自 data.js）、`loadSpots`（来自 storage.js）
- Produces:
  - `createMap(containerId, center, zoom): AMap.Map`
  - `addHotelMarker(map, hotel): AMap.Marker`
  - `addSpotMarker(map, spot, onClick): AMap.Marker`
  - `loadAndShowSpots(map, city): AMap.Marker[]`
  - `searchPOI(keyword, city, callback): void`
  - `geocodeAddress(address, city, callback): void`
  - `SPOT_MARKERS` (全局 WeakMap 或通过闭包管理 city→markers 映射)

- [ ] **Step 1: 编写地图初始化、标记管理、POI 搜索函数**

```js
// 高德地图封装

// 存储每个地图上的景点/美食 markers 和对应的数据
// 结构: { "chongqing": { markers: [...], spots: [...], map: null }, "wuhan": {...} }
var _mapState = {
  chongqing: { markers: [], spots: [], map: null, hotelMarker: null },
  wuhan:     { markers: [], spots: [], map: null, hotelMarker: null }
};

// 当前打开的 InfoWindow 引用
var _currentInfoWindow = null;

/**
 * 创建高德地图实例
 * @param {string} containerId - 地图容器 DOM ID
 * @param {Array} center - [lng, lat]
 * @param {number} zoom
 * @returns {object} AMap.Map 实例
 */
function createMap(containerId, center, zoom) {
  var map = new AMap.Map(containerId, {
    zoom: zoom,
    center: center,
    resizeEnable: true,
    // 显示地铁线路图层（需要高德支持）
    features: ['bg', 'road', 'building', 'point'],
    mapStyle: 'amap://styles/light'
  });
  return map;
}

/**
 * 在地图上添加住宿标记（蓝色）
 * @param {object} map - AMap.Map 实例
 * @param {object} hotel - { name, lat, lng }
 * @returns {object} AMap.Marker
 */
function addHotelMarker(map, hotel) {
  var marker = new AMap.Marker({
    position: [hotel.lng, hotel.lat],
    title: hotel.name,
    icon: new AMap.Icon({
      size: new AMap.Size(32, 40),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(32, 40),
      imageOffset: new AMap.Pixel(0, 0)
    }),
    label: {
      content: '<div style="background:#3498DB;color:#fff;padding:3px 8px;border-radius:10px;font-size:12px;white-space:nowrap;">🏨 ' + hotel.name + '</div>',
      direction: 'top',
      offset: new AMap.Pixel(0, -8)
    },
    zIndex: 100
  });
  marker.setMap(map);
  return marker;
}

/**
 * 在地图上添加一个景点/美食标记
 * @param {object} map - AMap.Map 实例
 * @param {object} spot - { id, name, type, lat, lng, address, note }
 * @param {function} onClick - 点击回调 (spot, marker) => void
 * @returns {object} AMap.Marker
 */
function addSpotMarker(map, spot, onClick) {
  var color = spot.type === 'spot' ? '#E74C3C' : '#F39C12';
  var emoji = spot.type === 'spot' ? '🏔️' : '🍜';
  var labelText = spot.name;
  if (labelText.length > 8) {
    labelText = labelText.slice(0, 7) + '…';
  }

  var content = '<div style="background:' + color + ';color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">' + emoji + '</div>';

  var marker = new AMap.Marker({
    position: [spot.lng, spot.lat],
    content: content,
    offset: new AMap.Pixel(-14, -14),
    zIndex: 90
  });

  marker.on('click', function() {
    if (onClick) onClick(spot, marker);
  });

  marker.setMap(map);
  return marker;
}

/**
 * 从 localStorage 加载并显示该城市所有地点标记
 * @param {object} map
 * @param {string} city - "chongqing" | "wuhan"
 * @param {function} onMarkerClick - 点击回调
 * @returns {Array} markers
 */
function loadAndShowSpots(map, city, onMarkerClick) {
  var state = _mapState[city];
  var spots = loadSpots(city);
  state.spots = spots;

  // 清除旧标记
  state.markers.forEach(function(m) { m.setMap(null); });
  state.markers = [];

  spots.forEach(function(spot) {
    var marker = addSpotMarker(map, spot, onMarkerClick);
    state.markers.push(marker);
  });

  return state.markers;
}

/**
 * 刷新当前城市的所有标记（增删后调用）
 * @param {string} city
 */
function refreshSpotMarkers(city) {
  var state = _mapState[city];
  if (!state.map) return;

  loadAndShowSpots(state.map, city, _onMarkerClick);
}

/**
 * POI 搜索
 * @param {string} keyword - 搜索关键词
 * @param {string} city - 城市名（中文）
 * @param {function} callback - (results) => void
 *   results: [{ name, address, location: { lng, lat } }]
 */
function searchPOI(keyword, city, callback) {
  AMap.plugin('AMap.PlaceSearch', function() {
    var placeSearch = new AMap.PlaceSearch({
      city: city,
      pageSize: 5,
      pageIndex: 1,
      citylimit: true
    });

    placeSearch.search(keyword, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        var pois = (result.poiList && result.poiList.pois) || [];
        var simplified = pois.map(function(poi) {
          return {
            name: poi.name,
            address: poi.address || '',
            location: poi.location
          };
        });
        callback(simplified);
      } else {
        callback([]);
      }
    });
  });
}

/**
 * 地理编码：地址 → 坐标
 * @param {string} address
 * @param {string} city
 * @param {function} callback - ([lng, lat]) => void
 */
function geocodeAddress(address, city, callback) {
  AMap.plugin('AMap.Geocoder', function() {
    var geocoder = new AMap.Geocoder({ city: city });
    geocoder.getLocation(address, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        var geocodes = result.geocodes || [];
        if (geocodes.length > 0) {
          var lnglat = geocodes[0].location;
          callback([lnglat.lng, lnglat.lat]);
          return;
        }
      }
      callback(null);
    });
  });
}

/**
 * 更新酒店坐标为精确值（通过 Geocoder 获取）
 * @param {string} city
 * @param {function} callback
 */
function updateHotelCoords(city, callback) {
  var hotel = HOTELS[city];
  geocodeAddress(hotel.name, city === 'chongqing' ? '重庆' : '武汉', function(coords) {
    if (coords) {
      hotel.lat = coords[1];
      hotel.lng = coords[0];
    }
    if (callback) callback();
  });
}
```

- [ ] **Step 2: 验证** — 在浏览器控制台中确认 `createMap`, `searchPOI` 等函数为 undefined 即表示文件加载成功。等后续任务连接地图容器后再做地图级验证

---

### Task 5: 应用入口 — Tab 切换 + 地图懒初始化

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `createMap`, `addHotelMarker`, `loadAndShowSpots`, `searchPOI`, `updateHotelCoords` (map.js), `ITINERARY`, `HOTELS` (data.js), `loadSpots`, `saveSpot`, `deleteSpot`, `generateId` (storage.js)
- Produces: Tab 切换逻辑、地图懒初始化、FAB 事件绑定

- [ ] **Step 1: 编写 js/app.js（Tab 切换 + 地图初始化）**

```js
// 应用入口：Tab 切换、地图初始化、事件绑定

// === DOM 引用 ===
var tabBtns = document.querySelectorAll('.tab-btn');
var tabContents = {
  itinerary: document.getElementById('tab-itinerary'),
  chongqing: document.getElementById('tab-chongqing'),
  wuhan: document.getElementById('tab-wuhan')
};
var fabBtns = {
  chongqing: document.getElementById('fab-chongqing'),
  wuhan: document.getElementById('fab-wuhan')
};

// Sheet 相关 DOM
var sheetOverlay = document.getElementById('sheet-overlay');
var addSheet = document.getElementById('add-sheet');
var poiInput = document.getElementById('poi-search-input');
var poiResults = document.getElementById('poi-results');
var selectedInfo = document.getElementById('selected-info');
var noteInput = document.getElementById('note-input');
var btnSave = document.getElementById('btn-save');
var btnCancel = document.getElementById('btn-cancel');
var typeBtns = document.querySelectorAll('.type-btn');

// === 状态 ===
var currentTab = 'itinerary';
var mapsInitialized = { chongqing: false, wuhan: false };
var currentSheetCity = null;    // 当前 Sheet 是针对哪个城市
var currentSheetType = 'spot';   // 'spot' | 'food'
var selectedPOI = null;          // 用户选中的 POI 搜索结果
var searchTimer = null;

// === Tab 切换 ===
function switchTab(tabName) {
  currentTab = tabName;

  // 更新 Tab 按钮激活状态
  tabBtns.forEach(function(btn) {
    var t = btn.getAttribute('data-tab');
    if (t === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 切换内容
  Object.keys(tabContents).forEach(function(key) {
    if (key === tabName) {
      tabContents[key].classList.remove('hidden');
    } else {
      tabContents[key].classList.add('hidden');
    }
  });

  // 懒初始化地图
  if ((tabName === 'chongqing' || tabName === 'wuhan') && !mapsInitialized[tabName]) {
    initCityMap(tabName);
  }
}

// 绑定 Tab 按钮点击
tabBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    var tab = btn.getAttribute('data-tab');
    switchTab(tab);
  });
});

// === 地图初始化 ===
function initCityMap(city) {
  var containerId = 'map-' + city;
  var center = city === 'chongqing' ? [106.5330, 29.5750] : [114.3530, 30.5270];

  var map = createMap(containerId, center, city === 'chongqing' ? 13 : 13);
  _mapState[city].map = map;
  mapsInitialized[city] = true;

  // 用高德 Geocoder 修正酒店坐标，然后标注
  updateHotelCoords(city, function() {
    var hotel = HOTELS[city];
    var hotelMarker = addHotelMarker(map, hotel);
    _mapState[city].hotelMarker = hotelMarker;
    map.setCenter([hotel.lng, hotel.lat]);
  });

  // 加载之前保存的景点/美食
  loadAndShowSpots(map, city, _onMarkerClick);
}

// === FAB 按钮 ===
fabBtns.chongqing.addEventListener('click', function() {
  openAddSheet('chongqing');
});
fabBtns.wuhan.addEventListener('click', function() {
  openAddSheet('wuhan');
});
```

- [ ] **Step 2: 验证** — 在浏览器中点击底部 "重庆" Tab 按钮，确认地图容器可见，高德地图能正常加载显示

---

### Task 6: 行程时间线渲染

**Files:**
- Modify: `js/app.js`（追加渲染逻辑）

- [ ] **Step 1: 在 app.js 中追加行程渲染函数**

```js
// === 行程时间线渲染 ===
function renderItinerary() {
  var timeline = document.getElementById('timeline');
  var html = '';

  ITINERARY.forEach(function(item) {
    html += '<div class="timeline-item">';
    html += '  <div class="timeline-icon">' + item.icon + '</div>';
    html += '  <div class="timeline-card">';
    html += '    <div class="card-date">' + item.date + (item.time ? ' · ' + item.time : '') + '</div>';
    html += '    <div class="card-route">' + item.from + ' <span class="arrow">→</span> ' + item.to + '</div>';
    html += '    <div class="card-info">' + item.label + '</div>';
    html += '  </div>';
    html += '</div>';
  });

  timeline.innerHTML = html;
}

// 页面加载时渲染行程
renderItinerary();
```

- [ ] **Step 2: 验证** — 刷新页面，在"行程" Tab 确认时间线正确显示 5 段行程

---

### Task 7: 添加地点 Sheet — 搜索 + 保存

**Files:**
- Modify: `js/app.js`（追加 Sheet 逻辑）

- [ ] **Step 1: 在 app.js 中追加 Sheet 打开/关闭、POI 搜索、保存逻辑**

```js
// === Sheet 面板逻辑 ===

// 内部点击回调（供 map.js 使用）
function _onMarkerClick(spot, marker) {
  showMarkerInfo(spot, marker);
}

// 打开 Sheet
function openAddSheet(city) {
  currentSheetCity = city;
  currentSheetType = 'spot';
  selectedPOI = null;

  // 重置 UI
  poiInput.value = '';
  noteInput.value = '';
  poiResults.classList.add('hidden');
  poiResults.innerHTML = '';
  selectedInfo.classList.add('hidden');
  btnSave.disabled = true;

  // 重置类型按钮
  typeBtns.forEach(function(btn) {
    if (btn.getAttribute('data-type') === 'spot') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  sheetOverlay.classList.remove('hidden');
  addSheet.classList.remove('hidden');

  // 聚焦搜索框
  setTimeout(function() { poiInput.focus(); }, 300);
}

// 关闭 Sheet
function closeAddSheet() {
  sheetOverlay.classList.add('hidden');
  addSheet.classList.add('hidden');
  currentSheetCity = null;
  selectedPOI = null;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
}

// 类型切换
typeBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    currentSheetType = btn.getAttribute('data-type');
    typeBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    updateSaveButton();
  });
});

// 搜索输入 → 防抖 POI 搜索
poiInput.addEventListener('input', function() {
  var keyword = poiInput.value.trim();

  if (searchTimer) clearTimeout(searchTimer);

  if (keyword.length < 1) {
    poiResults.classList.add('hidden');
    poiResults.innerHTML = '';
    return;
  }

  searchTimer = setTimeout(function() {
    var cityName = currentSheetCity === 'chongqing' ? '重庆' : '武汉';
    searchPOI(keyword, cityName, function(results) {
      renderPOIResults(results);
    });
  }, 300);
});

// 渲染 POI 搜索结果
function renderPOIResults(results) {
  poiResults.innerHTML = '';

  if (results.length === 0) {
    poiResults.innerHTML = '<li style="color:#999;text-align:center;">未找到结果</li>';
    poiResults.classList.remove('hidden');
    return;
  }

  results.forEach(function(poi) {
    var li = document.createElement('li');
    li.innerHTML = '<div class="poi-name">' + poi.name + '</div>' +
                   '<div class="poi-addr">' + poi.address + '</div>';
    li.addEventListener('click', function() {
      selectPOI(poi);
    });
    poiResults.appendChild(li);
  });

  poiResults.classList.remove('hidden');
}

// 选中 POI
function selectPOI(poi) {
  selectedPOI = poi;
  poiInput.value = poi.name;
  poiResults.classList.add('hidden');

  var info = selectedInfo;
  info.classList.remove('hidden');
  info.querySelector('.selected-name').textContent = poi.name;
  info.querySelector('.selected-address').textContent = poi.address || '';

  updateSaveButton();
}

// 更新保存按钮状态
function updateSaveButton() {
  btnSave.disabled = !selectedPOI;
}

// 保存地点
btnSave.addEventListener('click', function() {
  if (!selectedPOI || !currentSheetCity) return;

  var spot = {
    id: generateId(),
    name: selectedPOI.name,
    type: currentSheetType,
    lat: selectedPOI.location.lat,
    lng: selectedPOI.location.lng,
    address: selectedPOI.address || '',
    note: noteInput.value.trim()
  };

  saveSpot(currentSheetCity, spot);

  // 刷新地图标记
  refreshSpotMarkers(currentSheetCity);

  // 关闭 Sheet
  closeAddSheet();
});

// 取消
btnCancel.addEventListener('click', closeAddSheet);
sheetOverlay.addEventListener('click', closeAddSheet);

// 点击搜索结果以外区域关闭列表
document.addEventListener('click', function(e) {
  if (!e.target.closest('.sheet-search')) {
    poiResults.classList.add('hidden');
  }
});
```

- [ ] **Step 2: 验证** — 在重庆或武汉 Tab 点击 "+" → Sheet 弹出 → 输入地名 → 出现搜索结果 → 选中 → 保存 → 地图上出现标记。刷新页面后标记依然存在。

---

### Task 8: 标记信息窗口 + 删除

**Files:**
- Modify: `js/app.js`（追加信息窗口和删除逻辑）

- [ ] **Step 1: 在 app.js 中追加信息窗口和删除逻辑**

```js
// === 标记信息窗口 ===

/**
 * 点击标记时显示信息窗口
 * @param {object} spot - 地点数据
 * @param {object} marker - AMap.Marker
 */
function showMarkerInfo(spot, marker) {
  var map = _mapState[currentTab].map;
  if (!map) return;

  // 关闭之前的 InfoWindow
  if (_currentInfoWindow) {
    _currentInfoWindow.close();
    _currentInfoWindow = null;
  }

  var typeLabel = spot.type === 'spot' ? '景点' : '美食';
  var typeClass = spot.type;

  var content = '<div class="info-window-content">';
  content += '<div class="iw-name">' + spot.name + '</div>';
  content += '<span class="iw-badge ' + typeClass + '">' + typeLabel + '</span>';
  content += '<div class="iw-address">📍 ' + (spot.address || '未知地址') + '</div>';
  if (spot.note) {
    content += '<div class="iw-note">💬 ' + spot.note + '</div>';
  }
  content += '<button class="iw-delete" data-spot-id="' + spot.id + '">🗑️ 删除</button>';
  content += '</div>';

  var infoWindow = new AMap.InfoWindow({
    content: content,
    offset: new AMap.Pixel(0, -35),
    closeWhenClickMap: true
  });

  infoWindow.open(map, marker.getPosition());

  // 删除按钮事件绑定（延迟绑定，等 DOM 渲染完毕）
  setTimeout(function() {
    var deleteBtn = document.querySelector('.iw-delete[data-spot-id="' + spot.id + '"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteSpotAndMarker(spot.id);
        infoWindow.close();
      });
    }
  }, 100);

  // 信息窗口关闭时清除引用
  infoWindow.on('close', function() {
    _currentInfoWindow = null;
  });

  _currentInfoWindow = infoWindow;
}

/**
 * 删除地点：从 localStorage 移除并刷新地图
 * @param {string} spotId
 */
function deleteSpotAndMarker(spotId) {
  // 找到该 spot 属于哪个城市（遍历两个城市）
  ['chongqing', 'wuhan'].forEach(function(city) {
    var spots = loadSpots(city);
    var found = spots.some(function(s) { return s.id === spotId; });
    if (found) {
      deleteSpot(city, spotId);
      refreshSpotMarkers(city);
    }
  });
}
```

- [ ] **Step 2: 验证** — 在地图上点击标记 → 弹出信息窗口显示名称、类型、地址 → 点击"删除" → 标记消失，刷新后也不存在

---

### Task 9: 兜底修复 + 最终验证 + 部署说明

**Files:**
- Modify: `index.html`（可能需要）
- Modify: `css/style.css`（可能需要）
- Modify: `js/app.js`（可能需要）

- [ ] **Step 1: 处理地图容器高度问题**

当地图 Tab 初次显示时，需要触发地图 resize：

```js
// 在 switchTab 函数中，切换地图 Tab 后触发 resize
function switchTab(tabName) {
  // ... 前述代码 ...

  if ((tabName === 'chongqing' || tabName === 'wuhan') && mapsInitialized[tabName]) {
    // 切换回已初始化的地图时，触发 resize
    setTimeout(function() {
      var m = _mapState[tabName].map;
      if (m) m.resize();
    }, 100);
  }
}
```

- [ ] **Step 2: 处理 input 聚焦时 Sheet 不被键盘顶起的问题（iOS）**

在 `openAddSheet` 中不做额外处理，因为 `bottom: 0` 定位的 Sheet 在 iOS Safari 中不会被键盘顶起——它的位置是相对于视口的，键盘弹起时视口缩小，Sheet 会自动跟随。如果遇到问题，可以加：

```css
/* 在 style.css 中确保 */
.bottom-sheet {
  /* 不设置 bottom，而是用 transform */
  /* 当前已经设置 bottom: 0，在大部分手机上表现正常 */
}
```

- [ ] **Step 3: 确保高德安全配置（如果需要）**

如果 POI 搜索遇到权限问题，在 index.html 的 `<head>` 中添加：
```html
<script>
  window._AMapSecurityConfig = {
    securityJsCode: ''  // 如有需要填入安全密钥
  };
</script>
```
注：该配置必须放在高德 API script 标签之前。

- [ ] **Step 4: 全流程手动测试**

在手机上（或 Chrome DevTools 移动模拟）：
1. ✅ 打开页面 → 看到行程时间线，5 段行程完整
2. ✅ 点击"重庆"Tab → 高德地图加载，酒店标记出现
3. ✅ 点击"+"→ Sheet 弹出 → 选择"景点"→ 输入"洪崖洞"→ 出现 POI 建议 → 点击选中 → 保存
4. ✅ 地图上出现红色标记，点击标记 → 弹出详情 + 删除按钮
5. ✅ 点击删除 → 标记消失
6. ✅ 同样的流程在"美食"类型下再操作一遍
7. ✅ 切换到"武汉"Tab，重复步骤 3-6
8. ✅ 刷新页面 → 之前添加的地点仍然显示
9. ✅ 点击"行程"Tab 回到时间线

- [ ] **Step 5: GitHub Pages 部署**

```bash
# 在旅游目录下初始化 git 并推送
git init
git add -A
git commit -m "feat: 旅游行程规划手机网页"

# 在 GitHub 上创建仓库（例如 travel-planner）
# 然后推送
git remote add origin https://github.com/<你的用户名>/travel-planner.git
git branch -M main
git push -u origin main

# 在 GitHub 仓库 Settings → Pages 中：
# Source: Deploy from a branch
# Branch: main, / (root)
# 等待几分钟后获得 URL: https://<用户名>.github.io/travel-planner/
```

- [ ] **Step 6: 最终确认** — 在手机浏览器中打开 GitHub Pages URL，完成一次完整的添加/删除地点操作
```

- [ ] **Step 2: 验证** — 在浏览器中打开 `index.html`，确认页面样式正常，导航栏在底部<｜end▁of▁thinking｜>现在开始编写实施计划。

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="Write">
<｜｜DSML｜｜parameter name="content" string="true"># 旅游行程规划手机网页 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个手机端旅游行程网页，包含行程时间线 + 重庆/武汉两张高德地图（标注住宿/景点/美食），支持手机上搜索 POI 添加/删除地点。

**Architecture:** 纯静态 HTML/CSS/JS，无构建工具。index.html 加载高德地图 SDK 和 4 个 JS 模块，通过底部 Tab 切换三个视图。用户数据存 localStorage，高德 PlaceSearch 做 POI 搜索。

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6+), 高德地图 JS API 2.0, localStorage

**文件结构:**
```
旅游/
├── index.html          # HTML 骨架 + 三个 Tab + Sheet
├── css/
│   └── style.css       # 全部样式
├── js/
│   ├── data.js         # 固定数据（行程、酒店）
│   ├── storage.js      # localStorage CRUD
│   ├── map.js          # 高德地图封装
│   └── app.js          # 入口：Tab切换、Sheet逻辑、信息窗口
└── docs/
    └── superpowers/
        ├── specs/2026-06-25-travel-planner-design.md
        └── plans/<this-file>.md
```

## Global Constraints

- API Key: `232b574120ffd77a50ae4664bcc3a507`
- 移动端适配：viewport width=device-width, max-width: 480px 居中
- 底部 Tab Bar 固定，触摸目标 ≥ 44px
- 无后端、无框架、无构建工具、无测试框架（手动浏览器验证）
- 部署目标：GitHub Pages

---

### Task 1: 项目骨架 — index.html + 基础 CSS

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/data.js`, `js/storage.js`, `js/map.js`, `js/app.js`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p css js
```

- [ ] **Step 2: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>我的旅游行程</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <main id="content">
      <!-- 行程 Tab -->
      <section id="tab-itinerary" class="tab-content">
        <div class="page-header">
          <h1>🗺️ 我的行程</h1>
          <p class="page-subtitle">6.29 — 7.5</p>
        </div>
        <div id="timeline" class="timeline"></div>
      </section>

      <!-- 重庆地图 Tab -->
      <section id="tab-chongqing" class="tab-content hidden">
        <div id="map-chongqing" class="map-container"></div>
        <button id="fab-chongqing" class="fab" title="添加地点">＋</button>
      </section>

      <!-- 武汉地图 Tab -->
      <section id="tab-wuhan" class="tab-content hidden">
        <div id="map-wuhan" class="map-container"></div>
        <button id="fab-wuhan" class="fab" title="添加地点">＋</button>
      </section>
    </main>

    <!-- 底部导航栏 -->
    <nav id="tab-bar">
      <button class="tab-btn active" data-tab="itinerary">
        <span class="tab-icon">📋</span><span class="tab-label">行程</span>
      </button>
      <button class="tab-btn" data-tab="chongqing">
        <span class="tab-icon">🏙️</span><span class="tab-label">重庆</span>
      </button>
      <button class="tab-btn" data-tab="wuhan">
        <span class="tab-icon">🌆</span><span class="tab-label">武汉</span>
      </button>
    </nav>
  </div>

  <!-- 添加地点 Sheet 遮罩 -->
  <div id="sheet-overlay" class="sheet-overlay hidden"></div>

  <!-- 添加地点底部 Sheet -->
  <div id="add-sheet" class="bottom-sheet hidden">
    <div class="sheet-handle"></div>
    <h2 id="sheet-title">添加地点</h2>
    <div class="sheet-types">
      <button class="type-btn active" data-type="spot">🏔️ 景点</button>
      <button class="type-btn" data-type="food">🍜 美食</button>
    </div>
    <div class="sheet-search">
      <input type="text" id="poi-search-input" placeholder="输入地点名称搜索…" autocomplete="off">
      <ul id="poi-results" class="poi-results hidden"></ul>
    </div>
    <div id="selected-info" class="selected-info hidden">
      <p class="selected-name"></p>
      <p class="selected-address"></p>
    </div>
    <textarea id="note-input" placeholder="备注（可选）" rows="2" maxlength="200"></textarea>
    <div class="sheet-actions">
      <button id="btn-cancel" class="btn btn-cancel">取消</button>
      <button id="btn-save" class="btn btn-save" disabled>保存</button>
    </div>
  </div>

  <!-- 高德地图 JS API -->
  <script src="https://webapi.amap.com/maps?v=2.0&key=232b574120ffd77a50ae4664bcc3a507"></script>
  <script src="js/data.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/map.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 css/style.css（基础样式 + 完整视觉）**

```css
/* === CSS 变量 === */
:root {
  --color-primary: #4A90D9;
  --color-spot: #E74C3C;
  --color-food: #F39C12;
  --color-hotel: #3498DB;
  --color-bg: #F5F6FA;
  --color-surface: #FFFFFF;
  --color-text: #2C3E50;
  --color-text-secondary: #7F8C8D;
  --color-border: #E8ECF1;
  --tab-height: 64px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --radius: 12px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%; overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 15px; color: var(--color-text); background: var(--color-bg);
  -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased;
}

#app {
  max-width: 480px; margin: 0 auto; height: 100%;
  display: flex; flex-direction: column; background: var(--color-bg);
  position: relative; overflow: hidden;
}

#content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding-bottom: var(--tab-height); -webkit-overflow-scrolling: touch;
}

.tab-content { min-height: 100%; }
.tab-content.hidden { display: none; }

/* 页面头部 */
.page-header {
  padding: 24px 20px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;
}
.page-header h1 { font-size: 22px; font-weight: 700; }
.page-subtitle { font-size: 13px; opacity: 0.85; margin-top: 4px; }

/* 地图容器 */
.map-container { width: 100%; height: calc(100vh - var(--tab-height)); }

/* 底部导航栏 */
#tab-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; height: var(--tab-height);
  padding-bottom: var(--safe-bottom); background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: space-around; align-items: center; z-index: 100;
}
.tab-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 3px; padding: 8px 0;
  border: none; background: none; color: var(--color-text-secondary);
  font-size: 11px; cursor: pointer; min-height: 48px; transition: color 0.2s;
}
.tab-btn .tab-icon { font-size: 22px; }
.tab-btn.active { color: var(--color-primary); }

/* 行程时间线 */
.timeline { padding: 20px; position: relative; }
.timeline::before {
  content: ""; position: absolute; left: 36px; top: 24px; bottom: 24px;
  width: 3px; background: linear-gradient(to bottom, var(--color-primary), #764ba2);
  border-radius: 2px;
}
.timeline-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; position: relative; }
.timeline-icon {
  width: 48px; height: 48px; min-width: 48px; border-radius: 50%;
  background: var(--color-surface); display: flex; align-items: center;
  justify-content: center; font-size: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1;
  border: 3px solid var(--color-primary);
}
.timeline-card {
  flex: 1; background: var(--color-surface); border-radius: var(--radius);
  padding: 14px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.timeline-card .card-date { font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; }
.timeline-card .card-route { font-size: 17px; font-weight: 600; }
.timeline-card .card-route .arrow { margin: 0 8px; color: var(--color-text-secondary); }
.timeline-card .card-info { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }

/* FAB 浮动按钮 */
.fab {
  position: absolute; bottom: 24px; right: 20px;
  width: 56px; height: 56px; border-radius: 50%;
  border: none; background: var(--color-primary); color: white;
  font-size: 28px; cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.4);
  z-index: 50; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.fab:active { transform: scale(0.92); }

/* Sheet 遮罩 */
.sheet-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  z-index: 200; transition: opacity 0.3s;
}
.sheet-overlay.hidden { opacity: 0; pointer-events: none; }

/* 底部 Sheet */
.bottom-sheet {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(0);
  width: 100%; max-width: 480px; max-height: 80vh;
  background: var(--color-surface); border-radius: 20px 20px 0 0;
  z-index: 201; padding: 12px 20px 24px;
  padding-bottom: calc(24px + var(--safe-bottom));
  overflow-y: auto; transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
}
.bottom-sheet.hidden { transform: translateX(-50%) translateY(100%); }
.sheet-handle { width: 36px; height: 5px; border-radius: 3px; background: #D0D5DD; margin: 0 auto 16px; }
.bottom-sheet h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; text-align: center; }

/* 类型选择 */
.sheet-types { display: flex; gap: 12px; margin-bottom: 16px; }
.type-btn {
  flex: 1; padding: 12px; border: 2px solid var(--color-border);
  border-radius: var(--radius); background: var(--color-surface);
  font-size: 15px; cursor: pointer; text-align: center; min-height: 48px;
}
.type-btn.active[data-type="spot"] { border-color: var(--color-spot); background: #FEF0EF; color: var(--color-spot); }
.type-btn.active[data-type="food"] { border-color: var(--color-food); background: #FFF8EE; color: var(--color-food); }

/* 搜索 */
.sheet-search { position: relative; margin-bottom: 12px; }
.sheet-search input {
  width: 100%; padding: 12px 14px; border: 2px solid var(--color-border);
  border-radius: var(--radius); font-size: 15px; outline: none;
}
.sheet-search input:focus { border-color: var(--color-primary); }
.poi-results {
  list-style: none; position: absolute; top: 100%; left: 0; right: 0;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius) var(--radius);
  max-height: 200px; overflow-y: auto; z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.poi-results.hidden { display: none; }
.poi-results li {
  padding: 12px 14px; border-bottom: 1px solid var(--color-border);
  cursor: pointer; font-size: 14px;
}
.poi-results li:active { background: #F5F6FA; }
.poi-results .poi-name { font-weight: 500; }
.poi-results .poi-addr { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }

/* 已选信息 */
.selected-info { padding: 12px; background: #F0F7FF; border-radius: var(--radius); margin-bottom: 12px; }
.selected-info.hidden { display: none; }
.selected-name { font-weight: 600; font-size: 15px; }
.selected-address { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }

/* 备注 + 按钮 */
#note-input {
  width: 100%; padding: 12px 14px; border: 2px solid var(--color-border);
  border-radius: var(--radius); font-size: 15px; resize: none;
  outline: none; font-family: inherit; margin-bottom: 16px;
}
#note-input:focus { border-color: var(--color-primary); }
.sheet-actions { display: flex; gap: 12px; }
.btn {
  flex: 1; padding: 14px; border: none; border-radius: var(--radius);
  font-size: 16px; font-weight: 600; cursor: pointer; min-height: 48px;
}
.btn-cancel { background: #F0F0F0; color: var(--color-text-secondary); }
.btn-save { background: var(--color-primary); color: white; }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

/* 信息窗口（高德 InfoWindow 内部使用） */
.info-window-content { padding: 8px 4px; min-width: 180px; }
.iw-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.iw-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-right: 6px; }
.iw-badge.spot { background: #FEF0EF; color: var(--color-spot); }
.iw-badge.food { background: #FFF8EE; color: var(--color-food); }
.iw-address { font-size: 12px; color: var(--color-text-secondary); margin-top: 6px; }
.iw-note { font-size: 12px; color: #666; margin-top: 4px; font-style: italic; }
.iw-delete {
  display: block; margin-top: 10px; padding: 6px 0; width: 100%;
  border: none; background: none; color: var(--color-spot);
  font-size: 13px; text-align: center; cursor: pointer;
  border-top: 1px solid var(--color-border);
}
```

- [ ] **Step 4: 创建 JS 占位文件**

```bash
echo "// 固定数据" > js/data.js
echo "// localStorage 操作" > js/storage.js
echo "// 高德地图封装" > js/map.js
echo "// 应用入口" > js/app.js
```

- [ ] **Step 5: 验证** — 浏览器打开 `index.html`，确认页面骨架可见

---

### Task 2: 固定数据 + localStorage 模块

**Files:**
- Modify: `js/data.js`
- Modify: `js/storage.js`

**Produces:**
- `ITINERARY` (全局数组) — 5 条行程
- `HOTELS` (全局对象) — 酒店 name/lat/lng
- `loadSpots(city)`, `saveSpot(city, spot)`, `deleteSpot(city, id)`, `generateId()`

- [ ] **Step 1: 编写 js/data.js**

```js
// 固定数据：行程 & 住宿

var ITINERARY = [
  { date: "6月29日", time: "晚上", from: "延吉", to: "长春", type: "train", icon: "🚄", label: "高铁" },
  { date: "6月30日", time: "早上", from: "长春", to: "重庆", type: "flight", icon: "✈️", label: "飞机" },
  { date: "7月2日",  time: "",     from: "重庆", to: "武汉", type: "train", icon: "🚄", label: "高铁" },
  { date: "7月5日",  time: "12:45",from: "武汉", to: "长春", type: "flight", icon: "✈️", label: "飞机" },
  { date: "7月5日",  time: "",     from: "长春", to: "延吉", type: "train", icon: "🚄", label: "高铁" }
];

// 坐标将在初始化时通过高德 Geocoder 精确获取
var HOTELS = {
  chongqing: { name: "Asiam亚美丽晶江景酒店（重庆观音桥店）", lat: 29.5750, lng: 106.5330 },
  wuhan:     { name: "汉庭武汉梦时代街道口地铁站酒店",       lat: 30.5270, lng: 114.3530 }
};
```

- [ ] **Step 2: 编写 js/storage.js**

```js
// localStorage 操作

var STORAGE_KEYS = { chongqing: "chongqing_spots", wuhan: "wuhan_spots" };

function loadSpots(city) {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS[city]);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveSpot(city, spot) {
  var spots = loadSpots(city);
  spots.push(spot);
  localStorage.setItem(STORAGE_KEYS[city], JSON.stringify(spots));
}

function deleteSpot(city, id) {
  var spots = loadSpots(city);
  var filtered = spots.filter(function(s) { return s.id !== id; });
  localStorage.setItem(STORAGE_KEYS[city], JSON.stringify(filtered));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
```

- [ ] **Step 3: 验证** — 浏览器控制台：
```js
saveSpot("chongqing", {id:generateId(),name:"测试",type:"spot",lat:29.5,lng:106.5,address:"",note:""});
console.log(loadSpots("chongqing").length); // → 1
```

---

### Task 3: 地图模块 (map.js)

**Files:**
- Modify: `js/map.js`

**Produces:**
- `createMap(containerId, center, zoom)` → AMap.Map
- `addHotelMarker(map, hotel)` → Marker
- `addSpotMarker(map, spot, onClick)` → Marker
- `loadAndShowSpots(map, city, onMarkerClick)` → Marker[]
- `refreshSpotMarkers(city)` → void
- `searchPOI(keyword, city, callback)` → void
- `geocodeAddress(address, city, callback)` → void
- `updateHotelCoords(city, callback)` → void
- `_mapState` (全局) — 管理各地图的状态

- [ ] **Step 1: 编写 js/map.js**

```js
// 高德地图封装

var _mapState = {
  chongqing: { markers: [], spots: [], map: null, hotelMarker: null },
  wuhan:     { markers: [], spots: [], map: null, hotelMarker: null }
};
var _currentInfoWindow = null;

function createMap(containerId, center, zoom) {
  return new AMap.Map(containerId, {
    zoom: zoom,
    center: center,
    resizeEnable: true,
    features: ['bg', 'road', 'building', 'point'],
    mapStyle: 'amap://styles/light'
  });
}

function addHotelMarker(map, hotel) {
  var marker = new AMap.Marker({
    position: [hotel.lng, hotel.lat],
    title: hotel.name,
    icon: new AMap.Icon({
      size: new AMap.Size(32, 40),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(32, 40),
      imageOffset: new AMap.Pixel(0, 0)
    }),
    label: {
      content: '<div style="background:#3498DB;color:#fff;padding:3px 8px;border-radius:10px;font-size:12px;white-space:nowrap;">🏨 ' + hotel.name + '</div>',
      direction: 'top',
      offset: new AMap.Pixel(0, -8)
    },
    zIndex: 100
  });
  marker.setMap(map);
  return marker;
}

function addSpotMarker(map, spot, onClick) {
  var color = spot.type === 'spot' ? '#E74C3C' : '#F39C12';
  var emoji = spot.type === 'spot' ? '🏔️' : '🍜';
  var labelText = spot.name.length > 8 ? spot.name.slice(0, 7) + '…' : spot.name;

  var content = '<div style="background:' + color + ';color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">' + emoji + '</div>';

  var marker = new AMap.Marker({
    position: [spot.lng, spot.lat],
    content: content,
    offset: new AMap.Pixel(-14, -14),
    zIndex: 90
  });

  marker.on('click', function() {
    if (onClick) onClick(spot, marker);
  });

  marker.setMap(map);
  return marker;
}

function loadAndShowSpots(map, city, onMarkerClick) {
  var state = _mapState[city];
  var spots = loadSpots(city);
  state.spots = spots;

  state.markers.forEach(function(m) { m.setMap(null); });
  state.markers = [];

  spots.forEach(function(spot) {
    var marker = addSpotMarker(map, spot, onMarkerClick);
    state.markers.push(marker);
  });
  return state.markers;
}

function refreshSpotMarkers(city) {
  var state = _mapState[city];
  if (!state.map) return;
  loadAndShowSpots(state.map, city, _onMarkerClick);
}

function searchPOI(keyword, city, callback) {
  AMap.plugin('AMap.PlaceSearch', function() {
    var placeSearch = new AMap.PlaceSearch({
      city: city, pageSize: 5, pageIndex: 1, citylimit: true
    });
    placeSearch.search(keyword, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        var pois = (result.poiList && result.poiList.pois) || [];
        callback(pois.map(function(poi) {
          return { name: poi.name, address: poi.address || '', location: poi.location };
        }));
      } else { callback([]); }
    });
  });
}

function geocodeAddress(address, city, callback) {
  AMap.plugin('AMap.Geocoder', function() {
    var geocoder = new AMap.Geocoder({ city: city });
    geocoder.getLocation(address, function(status, result) {
      if (status === 'complete' && result.info === 'OK' && result.geocodes.length > 0) {
        var lnglat = result.geocodes[0].location;
        callback([lnglat.lng, lnglat.lat]);
      } else { callback(null); }
    });
  });
}

function updateHotelCoords(city, callback) {
  var hotel = HOTELS[city];
  var cityName = city === 'chongqing' ? '重庆' : '武汉';
  geocodeAddress(hotel.name, cityName, function(coords) {
    if (coords) { hotel.lat = coords[1]; hotel.lng = coords[0]; }
    if (callback) callback();
  });
}
```

- [ ] **Step 2: 验证** — 刷新页面，控制台确认无报错，`typeof createMap === 'function'`

---

### Task 4: 应用入口 — Tab 切换 + 行程渲染 + 地图初始化

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 编写 js/app.js**

```js
// 应用入口

// === DOM 引用 ===
var tabBtns = document.querySelectorAll('.tab-btn');
var tabContents = {
  itinerary: document.getElementById('tab-itinerary'),
  chongqing: document.getElementById('tab-chongqing'),
  wuhan: document.getElementById('tab-wuhan')
};
var fabBtns = {
  chongqing: document.getElementById('fab-chongqing'),
  wuhan: document.getElementById('fab-wuhan')
};
var sheetOverlay = document.getElementById('sheet-overlay');
var addSheet = document.getElementById('add-sheet');
var poiInput = document.getElementById('poi-search-input');
var poiResults = document.getElementById('poi-results');
var selectedInfo = document.getElementById('selected-info');
var noteInput = document.getElementById('note-input');
var btnSave = document.getElementById('btn-save');
var btnCancel = document.getElementById('btn-cancel');
var typeBtns = document.querySelectorAll('.type-btn');

// === 状态 ===
var currentTab = 'itinerary';
var mapsInitialized = { chongqing: false, wuhan: false };
var currentSheetCity = null;
var currentSheetType = 'spot';
var selectedPOI = null;
var searchTimer = null;

// === 行程渲染 ===
function renderItinerary() {
  var timeline = document.getElementById('timeline');
  var html = '';
  ITINERARY.forEach(function(item) {
    html += '<div class="timeline-item">' +
      '<div class="timeline-icon">' + item.icon + '</div>' +
      '<div class="timeline-card">' +
        '<div class="card-date">' + item.date + (item.time ? ' · ' + item.time : '') + '</div>' +
        '<div class="card-route">' + item.from + ' <span class="arrow">→</span> ' + item.to + '</div>' +
        '<div class="card-info">' + item.label + '</div>' +
      '</div></div>';
  });
  timeline.innerHTML = html;
}
renderItinerary();

// === Tab 切换 ===
function switchTab(tabName) {
  currentTab = tabName;
  tabBtns.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  Object.keys(tabContents).forEach(function(key) {
    tabContents[key].classList.toggle('hidden', key !== tabName);
  });

  if ((tabName === 'chongqing' || tabName === 'wuhan') && !mapsInitialized[tabName]) {
    initCityMap(tabName);
  } else if (mapsInitialized[tabName]) {
    setTimeout(function() {
      var m = _mapState[tabName].map;
      if (m) m.resize();
    }, 100);
  }
}

tabBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    switchTab(btn.getAttribute('data-tab'));
  });
});

// === 地图初始化 ===
function initCityMap(city) {
  var containerId = 'map-' + city;
  var center = city === 'chongqing' ? [106.5330, 29.5750] : [114.3530, 30.5270];
  var map = createMap(containerId, center, 13);
  _mapState[city].map = map;
  mapsInitialized[city] = true;

  updateHotelCoords(city, function() {
    var hotel = HOTELS[city];
    _mapState[city].hotelMarker = addHotelMarker(map, hotel);
    map.setCenter([hotel.lng, hotel.lat]);
  });

  loadAndShowSpots(map, city, _onMarkerClick);
}

// === FAB ===
fabBtns.chongqing.addEventListener('click', function() { openAddSheet('chongqing'); });
fabBtns.wuhan.addEventListener('click', function() { openAddSheet('wuhan'); });
```

- [ ] **Step 2: 验证** — 刷新页面 → 行程时间线可见 → 点击"重庆"Tab → 地图加载，酒店标记出现

---

### Task 5: Sheet 面板 — POI 搜索 + 保存

**Files:**
- Modify: `js/app.js`（追加到末尾）

- [ ] **Step 1: 追加 Sheet 逻辑到 js/app.js**

```js
// === Sheet 面板 ===

function _onMarkerClick(spot, marker) {
  showMarkerInfo(spot, marker);
}

function openAddSheet(city) {
  currentSheetCity = city;
  currentSheetType = 'spot';
  selectedPOI = null;
  poiInput.value = '';
  noteInput.value = '';
  poiResults.classList.add('hidden');
  poiResults.innerHTML = '';
  selectedInfo.classList.add('hidden');
  btnSave.disabled = true;

  typeBtns.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-type') === 'spot');
  });

  sheetOverlay.classList.remove('hidden');
  addSheet.classList.remove('hidden');
  setTimeout(function() { poiInput.focus(); }, 300);
}

function closeAddSheet() {
  sheetOverlay.classList.add('hidden');
  addSheet.classList.add('hidden');
  currentSheetCity = null;
  selectedPOI = null;
  if (searchTimer) { clearTimeout(searchTimer); searchTimer = null; }
}

typeBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    currentSheetType = btn.getAttribute('data-type');
    typeBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    updateSaveButton();
  });
});

poiInput.addEventListener('input', function() {
  var keyword = poiInput.value.trim();
  if (searchTimer) clearTimeout(searchTimer);
  if (keyword.length < 1) { poiResults.classList.add('hidden'); poiResults.innerHTML = ''; return; }

  searchTimer = setTimeout(function() {
    var cityName = currentSheetCity === 'chongqing' ? '重庆' : '武汉';
    searchPOI(keyword, cityName, function(results) {
      poiResults.innerHTML = '';
      if (results.length === 0) {
        poiResults.innerHTML = '<li style="color:#999;text-align:center;">未找到结果</li>';
      } else {
        results.forEach(function(poi) {
          var li = document.createElement('li');
          li.innerHTML = '<div class="poi-name">' + poi.name + '</div>' +
                         '<div class="poi-addr">' + poi.address + '</div>';
          li.addEventListener('click', function() { selectPOI(poi); });
          poiResults.appendChild(li);
        });
      }
      poiResults.classList.remove('hidden');
    });
  }, 300);
});

function selectPOI(poi) {
  selectedPOI = poi;
  poiInput.value = poi.name;
  poiResults.classList.add('hidden');
  selectedInfo.classList.remove('hidden');
  selectedInfo.querySelector('.selected-name').textContent = poi.name;
  selectedInfo.querySelector('.selected-address').textContent = poi.address || '';
  updateSaveButton();
}

function updateSaveButton() { btnSave.disabled = !selectedPOI; }

btnSave.addEventListener('click', function() {
  if (!selectedPOI || !currentSheetCity) return;
  var spot = {
    id: generateId(),
    name: selectedPOI.name,
    type: currentSheetType,
    lat: selectedPOI.location.lat,
    lng: selectedPOI.location.lng,
    address: selectedPOI.address || '',
    note: noteInput.value.trim()
  };
  saveSpot(currentSheetCity, spot);
  refreshSpotMarkers(currentSheetCity);
  closeAddSheet();
});

btnCancel.addEventListener('click', closeAddSheet);
sheetOverlay.addEventListener('click', closeAddSheet);

document.addEventListener('click', function(e) {
  if (!e.target.closest('.sheet-search')) { poiResults.classList.add('hidden'); }
});
```

- [ ] **Step 2: 验证** — 重庆/武汉 Tab 点"+" → 输入地名 → 搜出结果 → 选中 → 保存 → 地图出现标记

---

### Task 6: 标记信息窗口 + 删除

**Files:**
- Modify: `js/app.js`（追加到末尾）

- [ ] **Step 1: 追加信息窗口和删除逻辑**

```js
// === 信息窗口 + 删除 ===

function showMarkerInfo(spot, marker) {
  var map = _mapState[currentTab].map;
  if (!map) return;

  if (_currentInfoWindow) { _currentInfoWindow.close(); _currentInfoWindow = null; }

  var typeLabel = spot.type === 'spot' ? '景点' : '美食';
  var content = '<div class="info-window-content">' +
    '<div class="iw-name">' + spot.name + '</div>' +
    '<span class="iw-badge ' + spot.type + '">' + typeLabel + '</span>' +
    '<div class="iw-address">📍 ' + (spot.address || '未知地址') + '</div>' +
    (spot.note ? '<div class="iw-note">💬 ' + spot.note + '</div>' : '') +
    '<button class="iw-delete" data-spot-id="' + spot.id + '">🗑️ 删除</button>' +
    '</div>';

  var infoWindow = new AMap.InfoWindow({
    content: content,
    offset: new AMap.Pixel(0, -35),
    closeWhenClickMap: true
  });
  infoWindow.open(map, marker.getPosition());

  setTimeout(function() {
    var deleteBtn = document.querySelector('.iw-delete[data-spot-id="' + spot.id + '"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteSpotAndMarker(spot.id);
        infoWindow.close();
      });
    }
  }, 100);

  infoWindow.on('close', function() { _currentInfoWindow = null; });
  _currentInfoWindow = infoWindow;
}

function deleteSpotAndMarker(spotId) {
  ['chongqing', 'wuhan'].forEach(function(city) {
    var spots = loadSpots(city);
    if (spots.some(function(s) { return s.id === spotId; })) {
      deleteSpot(city, spotId);
      refreshSpotMarkers(city);
    }
  });
}
```

- [ ] **Step 2: 验证** — 点击标记 → 弹窗 → 点"删除" → 标记消失

---

### Task 7: 最终集成测试 + 部署

- [ ] **Step 1: 全流程测试**

在 Chrome DevTools 移动模拟 (iPhone 12 Pro / 390×844) 中：
1. ✅ 打开页面 → 行程时间线显示 5 段行程（延吉→长春→重庆→武汉→返程）
2. ✅ 点击"重庆" → 高德地图加载，酒店蓝色标记出现
3. ✅ 点"+" → Sheet 弹出 → 选"景点" → 输入"洪崖洞" → 出现搜索结果 → 选中 → 保存
4. ✅ 地图出现红色景点标记 → 点击标记 → 弹出信息窗 → 点"删除"
5. ✅ 同样流程测试"美食"类型
6. ✅ 切换到"武汉" → 重复以上
7. ✅ 刷新页面 → 添加的地点仍然存在
8. ✅ 切回"行程" → 时间线正常

- [ ] **Step 2: 边界情况检查**
- 输入空字符串搜索 → 不触发请求
- 搜索无结果 → 显示"未找到结果"
- 未选 POI 直接点保存 → 按钮灰色不可点
- 删除最后一个地点 → 地图正常不崩溃

- [ ] **Step 3: GitHub Pages 部署**

```bash
cd "C:\Users\Administrator\Desktop\旅游"
git init
git add -A
git commit -m "feat: 旅游行程规划手机网页"
# 在 GitHub 创建仓库后：
git remote add origin <你的仓库URL>
git branch -M main
git push -u origin main
# Settings → Pages → Source: Deploy from branch → main → Save
```
