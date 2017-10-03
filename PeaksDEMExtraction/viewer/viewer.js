$(document).ready(function() {

  var map = L.map('map');
  const features = new L.FeatureGroup().addTo(map);

  $.getJSON("../config.json", function(config) {

    if (getParameterByName("country")){
      config.country = getParameterByName("country");
    }

    $.getJSON("../in/" + config.country + "/patches.json", function(patches) {

      patches.forEach(function(p) {
        $("#patchSelector").append(
          "<option>" + p + "</option>"
        )
      })

      $("#patchSelector").on('change', function() {
        features.clearLayers();
        init(this.value);
      })

      init(patches[0]);

      function init(patch) {
        const pCoord = patchNameToCoordinate(patch);

        map.setView([pCoord.lat + 0.5, pCoord.lon + 0.5], 15);
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        $('#coordinate-button').on('click', function() {
          // parse lat and lng from the divs data attribute

          var latlng = $('#coordinate').val().split(',');
          console.log(latlng);
          var lat = latlng[0];
          var lng = latlng[1];
          var zoom = 15;

          // add a marker
          L.marker([lat, lng], {}).addTo(features);
          // set the view
          map.setView([lat, lng], zoom);
        })

        map.addEventListener('click', function(ev) {
          var lat = ev.latlng.lat;
          var lon = ev.latlng.lng;
          console.log(`coordinate (${lat}, ${lon})`);
        });

        // MAIN

        const size = config.demType == "dem3" ? 1200 : 3600;

        const peaknessDem3Folder = '../out/' + config.country + '/peakness/' + config.demType + '/';
        const ridgenessDem3Folder = '../out/' + config.country + '/ridgeness/' + config.demType + '/';

        const analysisFolder = "../out/" + config.country + "/analysis/" + config.demType + "/";

        // getPeakness('red', ridgenessDem3Folder, patch);
        getPeakness('blue', peaknessDem3Folder, patch);
        getTpFnFp(analysisFolder, patch)

        function getPeakness(color, path, patchName) {
          drawPatch(color, patchName);
          $.get(path + patchName + ".json", function(data) {

            const matrix = math.type.SparseMatrix.fromJSON(data);

            matrix.forEach(function(value, index, matrix) {
              coordinate = minutesSecondsToDecimalCoordinates(patchName, index[0], index[1], size);
              drawPeakness(coordinate.lat, coordinate.lon, value, color);

            }, true);
          })
        }

        function drawPeakness(cellLat, cellLon, fuzzy, color) {
          if (fuzzy <= 0 || isNaN(cellLat) || isNaN(cellLon)) {
            return;
          }
          L.rectangle([
            [cellLat, cellLon],
            [cellLat - 1 / size, cellLon + 1 / size]
          ], {
            color: color,
            weight: 0,
            fillColor: color,
            fillOpacity: fuzzy / 2,
          }).addTo(features);
        }

        function drawPatch(color, patchName) {
          const c = patchNameToCoordinate(patchName);
          L.rectangle([
            [c.lat + 1 + 0.5 / size, c.lon - 0.5 / size],
            [c.lat + 0.5 / size, c.lon + 1 - 0.5 / size]
          ], {
            color: color,
            weight: 1,
            fillOpacity: 0
          }).addTo(features);
        }

        function getTpFnFp(countryFolder, patch) {
          $.get(countryFolder + "tp.json", function(data) {
            for (peak of data) {
              drawPeak(peak.realCoord.lat, peak.realCoord.lon, peak.name, peak.ele, greenIconSmall, patch)
              drawPeak(peak.estimatedCoord.lat, peak.estimatedCoord.lon, peak.name, peak.ele, greenIcon, patch)
            }
          })
          $.get(countryFolder + "fn.json", function(data) {
            for (peak of data) {
              drawPeak(peak.realCoord.lat, peak.realCoord.lon, peak.name + " - " + peak.type, peak.ele, redIconSmall, patch)
            }
          })
          $.get(countryFolder + "fp.json", function(data) {
            for (group of data) {
              drawPeak(group.estimatedCoord.lat, group.estimatedCoord.lon, group.id, undefined, blueIcon, patch)
            }
          })
        }

        // https://github.com/pointhi/leaflet-color-markers
        const greenIcon = new L.Icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
        const greenIconSmall = new L.Icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          iconSize: [12, 20],
          iconAnchor: [6, 20],
          popupAnchor: [1, -34],
        });
        const redIconSmall = new L.Icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          iconSize: [18, 30],
          iconAnchor: [9, 30],
          popupAnchor: [1, -34],
        });
        const blueIcon = new L.Icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        function drawPeak(lat, lon, name, ele, icon, patch) {

          if (!patch || isInPatch(lat, lon, patch)) {
            L.marker([lat, lon], {
              icon: icon,
              title: name + " (" + ele + "m)"
            }).addTo(features);
          }
        }
      }

    })
  })
})

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
