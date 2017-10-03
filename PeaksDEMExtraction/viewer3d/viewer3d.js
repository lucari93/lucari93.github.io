function startup(Cesium) {

  $.getJSON("../config.json", function(config) {

    if (getParameterByName("country")){
      config.country = getParameterByName("country");
    }

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
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: '//assets.agi.com/stk-terrain/world'
      })
    });

    viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
      url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
      requestWaterMask: true,
      requestVertexNormals: true
    });

    var pinBuilder = new Cesium.PinBuilder();

    const map = L.map('map')
    L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
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

    function lookAt(estimated, real, color) {

      markers.clearLayers();
      viewer.entities.removeAll();

      const viewCoord = estimated || real;

      map.setView([viewCoord.lat, viewCoord.lon], 16);

      if (estimated) {
        Cesium.sampleTerrain(viewer.terrainProvider, 9, [Cesium.Cartographic.fromDegrees(estimated.lon, estimated.lat)])
          .then(function(samples) {
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
          });
      }
      if (real) {
        Cesium.sampleTerrain(viewer.terrainProvider, 9, [Cesium.Cartographic.fromDegrees(real.lon, real.lat)])
          .then(function(samples) {
            real.ele = samples[0].height

            markers.addLayer(L.marker([real.lat, real.lon], {
              icon: new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-' + color + '.png',
                iconSize: [12, 20],
                iconAnchor: [6, 20],
                popupAnchor: [1, -34],
              })
            }));

            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(real.lon, real.lat, real.ele),
              billboard: {
                image: pinBuilder.fromColor(Cesium.Color[color.toUpperCase()], 24).toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
              }
            });

          });
      }

      Cesium.sampleTerrain(viewer.terrainProvider, 9, [Cesium.Cartographic.fromDegrees(viewCoord.lon, viewCoord.lat)])
        .then(function(samples) {
          viewCoord.ele = samples[0].height

          const target = Cesium.Cartesian3.fromDegrees(viewCoord.lon, viewCoord.lat, viewCoord.ele)
          const offset = new Cesium.Cartesian3(6344.974098678562, -793.3419798081741, viewCoord.ele);
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

        var win = window.open("https://www.google.it/maps/place/" + viewCoord.lat + "," + viewCoord.lon + "/data=!3m1!1e3",
          "Google Maps", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, \
        resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
      });

    }

    function fillLists(file, parent, titleFunction, color) {
      $.get(file, function(data) {
        data.forEach(function(value, index) {
          $(parent).append(
            '<a \
          href="#" \
          data-index=' + index + '\
          class="list-group-item \
          ">' + titleFunction(value) + '</a>')
        })
        $(parent + " .list-group-item").on('click', function() {
          $('.active').removeClass('active');
          $(this).addClass('active');
          const value = data[$(this).data("index")];
          $("#current-title").html(titleFunction(value));

          lookAt(value.estimatedCoord, value.realCoord, color);
        });
      })
    }

    function FpTitle(v) {
      return v.id + " - " + v.estimatedCoord.lat + "," + v.estimatedCoord.lon;
    }
    fillLists("../out/" + config.country + "/analysis/" + config.demType + "/fp.json", "#fp-list", FpTitle, "yellow")

    function TpFnTitle(v) {
      const coord = v.estimatedCoord || v.realCoord
      return v.name + " - " + coord.lat + "," + coord.lon + " (" + v.ele + ")";
    }
    fillLists("../out/" + config.country + "/analysis/" + config.demType + "/tp.json", "#tp-list", TpFnTitle, "green")
    fillLists("../out/" + config.country + "/analysis/" + config.demType + "/fn.json", "#fn-list", TpFnTitle, "red")

  })
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

if (typeof Cesium !== "undefined") {
  startup(Cesium);
} else if (typeof require === "function") {
  require(["Cesium"], startup);
}
