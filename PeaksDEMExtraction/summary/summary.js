$(document).ready(function() {

  const countries = {
    "ch": "Svizera",
    "resegone": "Resegone",
    "dubai": "Dubai",
    "everest": "Himalaya - Everest",
    "aus": "Australia - Olgas"
  }

  Object.entries(countries).forEach(function ([id, name]) {

    const container = $('<div/>').appendTo("#summary")

    $('<h2/>', {
      'text': name
    }).appendTo(container);

    $('<a/>', {
      'text': "MAP",
      'href': "../viewer/viewer.html?country=" + id
    }).appendTo(container)

    $('<br/><br/>').appendTo(container);

    $('<a/>', {
      'text': "3D VIEWER",
      'href': "../viewer3d/viewer3d.html?country=" + id
    }).appendTo(container);

    $('<br/><br/>').appendTo(container);

    $('<iframe/>', {
      'src': "../out/" + id + "/analysis/dem3/results.txt",
    }).appendTo(container);

    // $.get("../out/" + id + "/analysis/dem3/results.txt", function (results) {
    //   $('<span/>', {
    //     'text': results.replace('\n', "<br/>")
    //   }).appendTo(container);
    // })
  })

})
