// Do not use "require" in this file

function coordinateToPatchName(latitude, longitude) {

  function formatForPatchName(number, length) {
    number = String(parseInt(number));
    while (number.length < length) {
      number = '0' + number;
    }
    return number;
  }

  latitude = Math.floor(latitude);
  longitude = Math.floor(longitude);
  let lat = latitude >= 0 ? ('N' + formatForPatchName(latitude, 2)) : ('S' + formatForPatchName(-latitude, 2));
  let lon = longitude >= 0 ? ('E' + formatForPatchName(longitude, 3)) : ('W' + formatForPatchName(-longitude, 3));
  return lat + lon;
}

function patchNameToCoordinate(patchName) {
  const nsl = patchName.substring(0, 1);
  const nsv = patchName.substring(1, 3);
  const ewl = patchName.substring(3, 4);
  const ewv = patchName.substring(4, 7);

  return {
    lat: parseFloat(nsl == "N" ? nsv : -nsv),
    lon: parseFloat(ewl == "E" ? ewv : -ewv)
  };
}

/**
 * Converts x and y coordinates of a dem patch to decimal coordinates
 * @param  {Integer} north Bottom left corner north coordinate of the dem patch
 * @param  {Integer} east  Bottom left corner east coordinate of the dem patch
 * @param  {Integer} x     row of the dem patch
 * @param  {Integer} y     column of the dem patch
 * @return {Json}       decimal coordinate
 */
function minutesSecondsToDecimalCoordinates(patchName, x, y, size) {
  const coordinate = patchNameToCoordinate(patchName);
  return {
    lat: coordinate.lat + (size + 0.5 - x) / size,
    lon: coordinate.lon + (y - 0.5) / size
  };
}

function cellFromCoordiante(lat, lon, size) {
  const ns = Math.floor(lat - 0.5 / size);
  const ew = Math.floor(lon + 0.5 / size);

  return {
    patchName: coordinateToPatchName(lat, lon),
    x: Math.floor(size * (ns - lat + 1) + 0.5),
    y: Math.floor(size * (lon - ew) + 0.5)
  }
}

function isInPatch(lat, lon, patch) {
  const p = patchNameToCoordinate(patch);
  return lat > p.lat && lat < p.lat + 1 && lon > p.lon && lon < p.lon + 1;
}

function getCorrectPatchXY(patch, x, y, size) {

  let patchCoord = patchNameToCoordinate(patch)

  let resPatch;
  let resX;
  let resY;

  if (x < 0) {
    resX = size + x;
    if (y < 0) {
      resPatch = coordinateToPatchName(patchCoord.lat + 1, patchCoord.lon - 1);
      resY = size + y;
    } else if (y >= 0 && y < size) {
      resPatch = coordinateToPatchName(patchCoord.lat + 1, patchCoord.lon);
      resY = y;
    } else if (y >= size) {
      resPatch = coordinateToPatchName(patchCoord.lat + 1, patchCoord.lon + 1);
      resY = y - size;
    }
  } else if (x >= 0 && x < size) {
    resX = x;
    if (y < 0) {
      resPatch = coordinateToPatchName(patchCoord.lat, patchCoord.lon - 1);
      resY = size + y;
    } else if (y >= 0 && y < size) {
      resPatch = patch;
      resY = y;
    } else if (y >= size) {
      resPatch = coordinateToPatchName(patchCoord.lat, patchCoord.lon + 1);
      resY = y - size;
    }
  } else if (x >= size) {
    resX = x - size;
    if (y < 0) {
      resPatch = coordinateToPatchName(patchCoord.lat - 1, patchCoord.lon - 1);
      resY = size + y;
    } else if (y >= 0 && y < size) {
      resPatch = coordinateToPatchName(patchCoord.lat - 1, patchCoord.lon);
      resY = y;
    } else if (y >= size) {
      resPatch = coordinateToPatchName(patchCoord.lat - 1, patchCoord.lon + 1);
      resY = y - size;
    }
  }
  return {
    patch: resPatch,
    x: resX,
    y: resY
  }
}

function estimatePeakPosition(group) {
  let latAcc = 0;
  let lonAcc = 0;
  let wAcc = 0;

  group.forEach(function (v) {
    latAcc+= v.lat * v.peakness;
    lonAcc+= v.lon * v.peakness;
    wAcc += v.peakness;
  })

  return {
    lat: latAcc / wAcc,
    lon: lonAcc / wAcc
  }
}

try {
  module.exports = {
    coordinateToPatchName: coordinateToPatchName,
    patchNameToCoordinate: patchNameToCoordinate,
    minutesSecondsToDecimalCoordinates: minutesSecondsToDecimalCoordinates,
    cellFromCoordiante: cellFromCoordiante,
    isInPatch: isInPatch,
    getCorrectPatchXY: getCorrectPatchXY,
    estimatePeakPosition: estimatePeakPosition
  }
} catch (e) {
  console.warn("module.exports not supported");
}
