// 固定数据：行程 & 住宿

// 行程时间线
var ITINERARY = [
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
    time: "8:15 — 12:30",
    from: "长春龙嘉 T2",
    to: "重庆江北 T3",
    type: "flight",
    icon: "✈️",
    label: "飞机",
    detail: "航班约4h15m"
  },
  {
    date: "6月30日 — 7月2日",
    time: "",
    from: "重庆",
    to: "",
    type: "stay",
    icon: "🏙️",
    label: "游玩 3 天",
    detail: "住宿：Asiam亚美丽晶江景酒店（观音桥店）"
  },
  {
    date: "7月2日",
    time: "13:24 — 18:07",
    from: "重庆北",
    to: "汉口",
    type: "train",
    icon: "🚄",
    label: "高铁 · 检票口 14A/15A",
    detail: "约4h43m"
  },
  {
    date: "7月2日 — 7月5日",
    time: "",
    from: "武汉",
    to: "",
    type: "stay",
    icon: "🌆",
    label: "游玩 2 天",
    detail: "住宿：汉庭武汉梦时代街道口地铁站酒店"
  },
  {
    date: "7月5日",
    time: "12:45 — 15:50",
    from: "武汉天河 T2",
    to: "长春龙嘉 T2",
    type: "flight",
    icon: "✈️",
    label: "飞机",
    detail: "航班约3h5m"
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
var HOTELS = {
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
