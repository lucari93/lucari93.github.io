// Define three colors that will be used to style the cluster features
// depending on the number of features they contain.
var colors = {
  low: "rgb(181, 226, 140)",
  middle: "rgb(241, 211, 87)",
  high: "rgb(253, 156, 115)"
};

// Define three rules to style the cluster features.
var lowRule = new OpenLayers.Rule({
  filter: new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.LESS_THAN,
    property: "count",
    value: 15
  }),
  symbolizer: {
    fillColor: colors.low,
    fillOpacity: 0.9,
    strokeColor: colors.low,
    strokeOpacity: 0.5,
    strokeWidth: 12,
    pointRadius: 10,
    label: "${count}",
    labelOutlineWidth: 1,
    fontColor: "#ffffff",
    fontOpacity: 0.8,
    fontSize: "12px"
  }
});
var middleRule = new OpenLayers.Rule({
  filter: new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.BETWEEN,
    property: "count",
    lowerBoundary: 15,
    upperBoundary: 50
  }),
  symbolizer: {
    fillColor: colors.middle,
    fillOpacity: 0.9,
    strokeColor: colors.middle,
    strokeOpacity: 0.5,
    strokeWidth: 12,
    pointRadius: 15,
    label: "${count}",
    labelOutlineWidth: 1,
    fontColor: "#ffffff",
    fontOpacity: 0.8,
    fontSize: "12px"
  }
});
var highRule = new OpenLayers.Rule({
  filter: new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.GREATER_THAN,
    property: "count",
    value: 50
  }),
  symbolizer: {
    fillColor: colors.high,
    fillOpacity: 0.9,
    strokeColor: colors.high,
    strokeOpacity: 0.5,
    strokeWidth: 12,
    pointRadius: 20,
    label: "${count}",
    labelOutlineWidth: 1,
    fontColor: "#ffffff",
    fontOpacity: 0.8,
    fontSize: "12px"
  }
});

// Create a Style that uses the three previous rules
var style = new OpenLayers.Style(null, {
  rules: [lowRule, middleRule, highRule]
});


// Create a map and add OSM raster layer as the base layer
var map = new OpenLayers.Map("map");
var osm = new OpenLayers.Layer.OSM();
map.addLayer(osm);

// Initial view location
var center = new OpenLayers.LonLat(0, 0);
center.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
map.setCenter(center, 0);

// Create a vector layers
var vector = new OpenLayers.Layer.Vector("Features", {
  renderers: ['Canvas', 'SVG'],
  strategies: [
    new OpenLayers.Strategy.AnimatedCluster({
      distance: 45,
      animationMethod: OpenLayers.Easing.Expo.easeOut,
      animationDuration: 20
    })
  ],
  styleMap: new OpenLayers.StyleMap(style)
});
map.addLayer(vector);

fetch('./data.json')
.then(res => res.json())
.then((out) => {
  var coordinates = out.coordinates;
  console.log('Loading ' + coordinates.length + ' elements');
  var features = [];
  for (var i = 0; i < coordinates.length; i++) {
    var lon = coordinates[i][0];
    var lat = coordinates[i][1];

    var lonlat = new OpenLayers.LonLat(lon, lat);
    lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

    var f = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
    features.push(f);
  }
  console.log('Done');
  vector.addFeatures(features);
})
.catch(err => console.error(err));
