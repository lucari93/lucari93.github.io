let lookAt;
let anonymousPeaks;

// Load config file
$.getJSON("../config.json", function(config) {

  if (getParameterByName("country")) {
    config.country = getParameterByName("country");
  }

  /**
   * Fill list of TP, FP, FN
   * @param  {string} file url to json file
   * @param  {string} parent html container
   * @param  {function} titleFunction fuction that format the titleFunction
   * @param  {string} color marker color
   */
  function fillLists(file, parent, titleFunction, color) {
    $.get(file, function(data) {
        anonymousPeaks = data;
        data.forEach(function(value, index) {

          value.estimatedCoord.lat = Number(value.estimatedCoord.lat.toFixed(5));
          value.estimatedCoord.lon = Number(value.estimatedCoord.lon.toFixed(5));

          $(parent).append(
            '<a \
          href="#" \
          data-index=' + index + '\
          class="list-group-item \
          ">' + titleFunction(value) + '</a>')
        })
      })
      .then(function() {
        $("#fp-list .list-group-item").on('click', function() {
          activatePeak($(this).data("index"));
        });
      })
  }

  // Fill lists

  function FpTitle(v) {
    return v.id + " - " + v.estimatedCoord.lat + "," + v.estimatedCoord.lon;
  }
  fillLists("../out/" + config.country + "/analysis/" + config.demType + "/fp.json", "#fp-list", FpTitle, "yellow")

})


function mapsAnd3dInit(Cesium) {

  $('#loader').fadeOut(1000);
  $('#app').fadeIn(2000);

  // Setup Cesium
  var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    animation: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    scene3DOnly: true,
    baseLayerPicker: false,
  });

  viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
    requestWaterMask: true,
    requestVertexNormals: true
  });

  var pinBuilder = new Cesium.PinBuilder();

  // Setup Leaflet
  const map = L.map('map')
  L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  map.setView([0, 0], 1);
  const markers = new L.FeatureGroup().addTo(map);
  map.addEventListener('click', function(ev) {
    markers.addLayer(L.marker([ev.latlng.lat, ev.latlng.lng], {}));
    Cesium.sampleTerrain(viewer.terrainProvider, 9, [Cesium.Cartographic.fromDegrees(ev.latlng.lng, ev.latlng.lat)])
      .then(function(samples) {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(ev.latlng.lng, ev.latlng.lat, samples[0].height),
          billboard: {
            image: pinBuilder.fromColor(Cesium.Color.BLUE, 48).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
      });
  });

  /**
   * Move Cesium and Leaflet to look at a given point and add markers
   * @param  {Object} estimated estimated coordinate
   * @param  {string} color color of markers
   */
  lookAt = function(estimated, color) {

    markers.clearLayers();
    viewer.entities.removeAll();

    map.setView([estimated.lat, estimated.lon], 16);

    if (estimated) {
      Cesium.sampleTerrain(viewer.terrainProvider, 9, [Cesium.Cartographic.fromDegrees(estimated.lon, estimated.lat)])
        .then(function(samples) {
          estimated.ele = samples[0].height
          estimated.ele = samples[0].height

          markers.addLayer(L.marker([estimated.lat, estimated.lon], {
            icon: new L.Icon({
              iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + color + '.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })
          }));

          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(estimated.lon, estimated.lat, estimated.ele),
            billboard: {
              image: pinBuilder.fromColor(Cesium.Color[color.toUpperCase()], 48).toDataURL(),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            }
          });

          const target = Cesium.Cartesian3.fromDegrees(estimated.lon, estimated.lat, estimated.ele)
          const offset = new Cesium.Cartesian3(6344.974098678562, -793.3419798081741, estimated.ele);
          viewer.camera.lookAt(target, offset);
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        });

      $("#maps-link").on("click", function() {

        var w = window.innerWidth * 0.9;
        var h = window.innerHeight * 0.9;

        var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
        var wTop = window.screenTop ? window.screenTop : window.screenY;

        var left = wLeft + (window.innerWidth / 2) - (w / 2);
        var top = wTop + (window.innerHeight / 2) - (h / 2);

        var win = window.open("https://www.google.it/maps/place/" + estimated.lat + "," + estimated.lon + "/data=!3m1!1e3",
          "Google Maps", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, \
            resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
      });
    }
  }
}

let MAP_ACTIVE = false;
MAP_ACTIVE = true;
const startup = mapsAnd3dInit;
if (!MAP_ACTIVE) {
  $(document).ready(function() {
    $('#loader').fadeOut(1000);
    $('#app').fadeIn(2000);
  })
}

/**
 * Get query parameters
 * @param  {string} name name
 * @return {string} value
 */
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

if (typeof Cesium !== "undefined") {
  startup(Cesium);
} else if (typeof require === "function") {
  require(["Cesium"], startup);
}
