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
