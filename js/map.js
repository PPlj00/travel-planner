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
    features: ['bg', 'road'],       // 只显示底图+道路，去掉了建筑和默认POI
    mapStyle: 'amap://styles/light',
    showBuildingBlock: false        // 不显示3D建筑
  });
  return map;
}

/**
 * 在地图上绘制地铁线路和关键站点
 * @param {object} map - AMap.Map 实例
 * @param {string} city - "chongqing" | "wuhan"
 */
function drawSubwayLines(map, city) {
  if (city !== 'chongqing' || typeof SUBWAY_LINES === 'undefined') return;

  SUBWAY_LINES.forEach(function(line) {
    var polyline = new AMap.Polyline({
      path: line.path,
      strokeColor: line.color,
      strokeWeight: 5,
      strokeOpacity: 0.7,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 60,
      showDir: false
    });
    polyline.setMap(map);
  });

  if (typeof SUBWAY_STATIONS !== 'undefined') {
    SUBWAY_STATIONS.forEach(function(st) {
      var marker = new AMap.Marker({
        position: [st.lng, st.lat],
        content: '<div style="background:#fff;color:#333;width:8px;height:8px;border-radius:50%;border:2px solid #1890ff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
        offset: new AMap.Pixel(-4, -4),
        zIndex: 65
      });
      marker.setMap(map);
    });
  }
}

/**
 * 在地图上添加住宿标记（蓝色）
 * @param {object} map - AMap.Map 实例
 * @param {object} hotel - { name, lat, lng }
 * @returns {object} AMap.Marker
 */
function addHotelMarker(map, hotel) {
  var shortName = hotel.name;
  if (shortName.length > 10) { shortName = shortName.slice(0, 9) + '…'; }

  var content = '<div style="background:#3498DB;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.35);">🏨</div>';

  var marker = new AMap.Marker({
    position: [hotel.lng, hotel.lat],
    content: content,
    offset: new AMap.Pixel(-18, -18),
    zIndex: 100,
    label: {
      content: '<div style="background:#3498DB;color:#fff;padding:4px 10px;border-radius:12px;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">🏨 ' + shortName + '</div>',
      direction: 'top',
      offset: new AMap.Pixel(0, -8)
    }
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
