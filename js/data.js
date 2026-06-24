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
