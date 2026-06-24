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
