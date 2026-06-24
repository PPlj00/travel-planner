// 应用入口：Tab 切换、行程渲染、地图初始化、事件绑定

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

// === 行程渲染 ===
function renderItinerary() {
  var timeline = document.getElementById('timeline');
  var html = '';
  ITINERARY.forEach(function(item) {
    html += '<div class="timeline-item">';
    html += '  <div class="timeline-icon">' + item.icon + '</div>';
    html += '  <div class="timeline-card">';
    html += '    <div class="card-date">' + item.date + '</div>';
    html += '    <div class="card-route">' + item.from + '<span class="arrow"> → </span>' + item.to + '</div>';
    html += '    <div class="card-info">';
    if (item.time) {
      html += item.time + ' · ' + item.label;
    } else {
      html += item.label;
    }
    html += '    </div>';
    html += '    <span class="card-type">' + item.label + '</span>';
    html += '  </div>';
    html += '</div>';
  });
  timeline.innerHTML = html;
}

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

  // 懒初始化地图：首次切换到城市 Tab 才初始化
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

  var map = createMap(containerId, center, 13);
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

// === 初始化渲染 ===
renderItinerary();

// === Sheet 面板逻辑 ===

// 城市名称映射（内部标识 → 中文名）
var _cityNames = {
  chongqing: '重庆',
  wuhan: '武汉'
};

/**
 * 打开添加地点 Sheet
 * @param {string} city - "chongqing" | "wuhan"
 */
function openAddSheet(city) {
  currentSheetCity = city;

  // 更新标题
  document.getElementById('sheet-title').textContent = '添加地点 - ' + _cityNames[city];

  // 重置类型为景点
  currentSheetType = 'spot';
  selectedPOI = null;
  poiInput.value = '';
  noteInput.value = '';

  // 重置类型按钮激活状态
  typeBtns.forEach(function(btn) {
    btn.classList.remove('active');
  });
  document.querySelector('.type-btn[data-type="spot"]').classList.add('active');

  // 隐藏搜索结果和已选信息
  poiResults.classList.add('hidden');
  selectedInfo.classList.add('hidden');

  // 禁用保存按钮（未选 POI 时不可保存）
  btnSave.disabled = true;

  // 显示遮罩和 Sheet
  sheetOverlay.classList.remove('hidden');
  addSheet.classList.remove('hidden');

  // 动画结束后聚焦搜索输入框
  setTimeout(function() {
    poiInput.focus();
  }, 350);
}

/**
 * 关闭添加地点 Sheet，清理状态
 */
function closeAddSheet() {
  // 隐藏遮罩和 Sheet
  sheetOverlay.classList.add('hidden');
  addSheet.classList.add('hidden');

  // 清除搜索防抖定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }

  // 清理 Sheet 状态
  currentSheetCity = null;
  selectedPOI = null;
  poiInput.value = '';
}

// === 类型选择切换 ===
typeBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    // 切换激活状态
    typeBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentSheetType = btn.getAttribute('data-type');
  });
});

// === 搜索输入：防抖 POI 搜索 ===
poiInput.addEventListener('input', function() {
  var keyword = poiInput.value.trim();

  // 清除上一次的防抖定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }

  // 关键词太短时不搜索
  if (keyword.length < 2) {
    poiResults.classList.add('hidden');
    return;
  }

  // 设置防抖定时器（300ms）
  searchTimer = setTimeout(function() {
    var cityName = _cityNames[currentSheetCity];
    searchPOI(keyword, cityName, function(results) {
      // 清空并渲染搜索结果列表
      poiResults.innerHTML = '';

      if (results.length === 0) {
        poiResults.innerHTML = '<li class="poi-empty">未找到相关地点</li>';
      } else {
        results.forEach(function(poi) {
          var li = document.createElement('li');
          li.className = 'poi-item';
          li.innerHTML = '<strong>' + poi.name + '</strong><span>' + (poi.address || '') + '</span>';
          li.addEventListener('click', function() {
            // 选中该 POI
            selectedPOI = poi;

            // 更新已选信息
            selectedInfo.querySelector('.selected-name').textContent = poi.name;
            selectedInfo.querySelector('.selected-address').textContent = poi.address || '';
            selectedInfo.classList.remove('hidden');

            // 隐藏搜索结果列表，清空搜索输入
            poiResults.classList.add('hidden');
            poiInput.value = '';

            // 启用保存按钮
            btnSave.disabled = false;
          });
          poiResults.appendChild(li);
        });
      }

      // 显示搜索结果
      poiResults.classList.remove('hidden');
    });
  }, 300);
});

// === 保存按钮：保存地点并刷新地图 ===
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

  // 关闭 Sheet
  closeAddSheet();
});

// === 取消按钮 ===
btnCancel.addEventListener('click', closeAddSheet);

// === 遮罩点击关闭 ===
sheetOverlay.addEventListener('click', closeAddSheet);
