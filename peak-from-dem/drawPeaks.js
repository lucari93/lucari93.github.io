dem1 = {
  color: 'red',
  cells: 3600
}

dem3 = {
  color: 'blue',
  cells: 1200
}

const patchName = "N46E009"

redCounter = 0;
blueCounter = 0;
function minutesSecondsToDecimalCoordinates(north, east, x, y, dem) {

  var coordinate = {};
  coordinate.lat = north + (dem.cells - x) / dem.cells;
  coordinate.lon = east + (y) / dem.cells;
  return coordinate;
}

$(document).ready(function() {

  function draw(demCellLat, demCellLon, fuzzy, dem) {
    if (fuzzy < 0.5 || isNaN(demCellLat) || isNaN(demCellLon)) {
      return;
    }
    color = dem.color
    L.rectangle([
      [demCellLat, demCellLon],
      [demCellLat - 1 / dem.cells, demCellLon + 1 / dem.cells]
    ], {
      color: color,
      weight: 0,
      fillColor: color,
      fillOpacity: fuzzy / 2,
    }).addTo(map);
  }

  var map = L.map('map').setView([46.1877, 9.4695], 14);

  map.addEventListener('click', function(ev) {
    console.log(`coordinate (${ev.latlng.lat}, ${ev.latlng.lng})`);
  });



  var Esri_DeLorme = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);


  function getPeaks(dem, path) {
    $.get(path, function(data) {
      var lines = data.split("\n");
      console.log(lines.length);
      for (var i = 0; i < lines.length; i++) {
        var lineData = lines[i].split(",");
        coordinate = minutesSecondsToDecimalCoordinates(46, 9, lineData[0], lineData[1], dem);
        var counter = 0;
        draw(coordinate.lat, coordinate.lon, lineData[2], dem);
        if (i % 10000 == 0) {
          console.log(i);
        }

      }
    })
  }

  getPeaks(dem1, 'out/dem1/'+ patchName +'.csv');
  getPeaks(dem3, 'out/dem3/'+ patchName +'.csv');


})
