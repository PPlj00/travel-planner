# 旅游行程规划手机网页 — 设计文档

## 概述

一个手机端网页，用于展示个人旅游行程，并在**重庆**和**武汉**两个城市的高德地图上标注住宿、景点、美食、地铁线路。支持在手机上直接添加/删除地点，无需修改代码。

## 行程数据

```
6月29日 晚   延吉 → 长春    高铁
6月30日 早   长春 → 重庆    飞机
7月2日       重庆 → 武汉    高铁
7月5日 12:45 武汉 → 长春    飞机
7月5日       长春 → 延吉    高铁
```

## 页面结构

```
┌─────────────────────────┐
│       📱 手机屏幕        │
├─────────────────────────┤
│      内容区域            │
│  (行程 / 重庆地图 /      │
│   武汉地图 三选一)       │
├─────────────────────────┤
│ [📋行程] [🏙️重庆] [🌆武汉] │  ← 底部固定 Tab 导航
└─────────────────────────┘
```

### Tab 1: 行程时间线
- 垂直时间线展示全部行程
- 每段显示：日期、出发地→目的地、交通方式图标（🚄高铁/✈️飞机）、时间

### Tab 2: 重庆地图
- 高德地图全屏展示
- 右下角浮动"+"按钮
- 标注：
  - 🏨 住宿（蓝色）：Asiam亚美丽晶江景酒店（观音桥店）— 固定数据
  - 🏔️ 景点（红色）：用户可增删
  - 🍜 美食（橙色）：用户可增删
  - 🚇 地铁线路：启用高德地图图层

### Tab 3: 武汉地图
- 同上结构
- 住宿（蓝色）：汉庭武汉梦时代街道口地铁站酒店 — 固定数据

## 数据模型

### 固定数据 (`js/data.js`)
```js
// 行程
const ITINERARY = [
  { date: "6月29日", time: "晚", from: "延吉", to: "长春", type: "train", icon: "🚄" },
  { date: "6月30日", time: "早", from: "长春", to: "重庆", type: "flight", icon: "✈️" },
  { date: "7月2日",  from: "重庆", to: "武汉", type: "train", icon: "🚄" },
  { date: "7月5日", time: "12:45", from: "武汉", to: "长春", type: "flight", icon: "✈️" },
  { date: "7月5日", from: "长春", to: "延吉", type: "train", icon: "🚄" },
];

// 住宿（坐标为近似值，实施时通过高德 Geocoder 搜索精确坐标）
const HOTELS = {
  chongqing: { name: "Asiam亚美丽晶江景酒店（观音桥店）", lat: 29.5750, lng: 106.5330 },
  wuhan:     { name: "汉庭武汉梦时代街道口地铁站酒店", lat: 30.5270, lng: 114.3530 },
};
```

### 用户数据 (`localStorage`)
- key: `"chongqing_spots"`, `"wuhan_spots"`
- 结构：
```json
[
  {
    "id": "uuid",
    "name": "洪崖洞",
    "type": "spot",
    "lat": 29.5630,
    "lng": 106.5760,
    "address": "渝中区...",
    "note": ""
  }
]
```
- `type`: `"spot"` (景点) 或 `"food"` (美食)

## 添加地点交互流程

```
点击 "+" 按钮
  → 底部弹出 Sheet 面板
    → 选择类型：🏔️景点 / 🍜美食
    → 输入框：输入名称
    → 实时显示高德 POI 搜索建议列表（AMap.PlaceSearch）
    → 点击选中建议 → 自动填入 name、address、坐标
    → 可选输入备注
    → 点击"保存"
  → Sheet 关闭
  → 地图上即刻出现新标记
```

## 地图标记交互

- 点击标记 → 弹出信息窗(InfoWindow)：显示名称、类型标签、地址、备注
- 信息窗底部有"删除"按钮 → 确认后从 localStorage 和地图上移除
- 景点（红色标记）、美食（橙色标记）、住宿（蓝色标记）

## 未登录高德 API
需要用户提前登录高德开发者账号。使用 JS API 2.0 时，地图加载不会提示登录，但 PlaceSearch 等高级功能需要通过 `AMap.plugin` 异步加载。

实际上高德 JS API 2.0 是按 key 计费的，只要 API Key 有效，不需要终端用户登录。POI 搜索通过 `AMap.plugin('AMap.PlaceSearch', ...)` 加载即可。

## 文件结构

```
旅游/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js        # 入口：Tab切换、初始化协调
│   ├── map.js         # 高德地图封装
│   ├── storage.js     # localStorage CRUD
│   └── data.js        # 固定数据
└── docs/
    └── superpowers/
        └── specs/
            └── 2025-06-25-travel-planner-design.md
```

## 技术栈

| 层 | 技术 |
|---|---|
| 地图 | 高德地图 JS API 2.0 |
| Key | `232b574120ffd77a50ae4664bcc3a507` |
| 数据 | localStorage |
| 样式 | 纯 CSS，移动端适配（viewport, max-width: 480px） |
| 部署 | GitHub Pages |
| 构建 | 不需要，纯静态文件 |

## 移动端适配要点

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- 内容区 `max-width: 480px; margin: 0 auto;` 居中
- 底部 Tab Bar 固定 `position: fixed; bottom: 0;`
- 触摸友好的按钮尺寸（最小 44x44px）
- 地图高度填满内容区可用空间
- 底部 Sheet 面板使用 `transform` 动画滑入/滑出

## 不做的事项（YAGNI）

- 无后端/数据库
- 无用户登录
- 无跨城市数据同步
- 无行程编辑功能（行程固定）
- 无预算/花费记录
- 无天气模块（可后续加）
- 无 PWA/离线缓存（后续可加 Service Worker）
