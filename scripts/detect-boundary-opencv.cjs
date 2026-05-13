const cvReady = require('@techstark/opencv-js');
const fs = require('fs');

function debug(message) {
  if (process.env.OPENCV_DEBUG) process.stderr.write(`${message}\n`);
}

function simplifyPoints(points, maxPoints = 10) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index % step === 0).slice(0, maxPoints);
}

function toPlotPoints(approx, plotWidth, plotLength, imageWidth, imageHeight) {
  const raw = Array.from(approx.data32S || []);
  const points = [];

  for (let index = 0; index < raw.length; index += 2) {
    points.push({
      x: Number(((raw[index] / imageWidth) * plotWidth).toFixed(1)),
      y: Number(((raw[index + 1] / imageHeight) * plotLength).toFixed(1)),
    });
  }

  return simplifyPoints(points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
}

function detect(cv, body) {
  if (!body.imageData?.length || !body.imageWidth || !body.imageHeight) {
    throw new Error('Image pixel data is required.');
  }

  const pixels = new Uint8ClampedArray(body.imageData);
  const src = cv.matFromImageData({
    data: pixels,
    width: body.imageWidth,
    height: body.imageHeight,
  });
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  let approx = null;
  let hull = null;

  try {
    debug('running cv');
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(blurred, edges, 45, 140);
    cv.dilate(edges, edges, kernel);
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let bestContour = null;
    let bestArea = 0;

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const area = cv.contourArea(contour);
      if (area > bestArea) {
        if (bestContour) bestContour.delete();
        bestContour = contour;
        bestArea = area;
      } else {
        contour.delete();
      }
    }

    if (!bestContour || bestArea < 120) {
      if (bestContour) bestContour.delete();
      throw new Error('No strong plot boundary found.');
    }

    approx = new cv.Mat();
    const perimeter = cv.arcLength(bestContour, true);
    cv.approxPolyDP(bestContour, approx, perimeter * 0.018, true);

    if (approx.rows < 4) {
      approx.delete();
      hull = new cv.Mat();
      cv.convexHull(bestContour, hull, false, true);
      approx = new cv.Mat();
      cv.approxPolyDP(hull, approx, perimeter * 0.012, true);
    }

    const points = toPlotPoints(approx, body.plotWidth, body.plotLength, body.imageWidth, body.imageHeight);
    bestContour.delete();

    if (points.length < 4) {
      throw new Error('Boundary detected, but not enough corners were found.');
    }

    process.stdout.write(JSON.stringify({
      success: true,
      points,
      meta: {
        engine: 'opencv-js-worker',
        contourArea: Math.round(bestArea),
        corners: points.length,
      },
    }));
    debug('done');
    process.exit(0);
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();
    if (approx) approx.delete();
    if (hull) hull.delete();
  }
}

function fail(error) {
  process.stdout.write(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : 'OpenCV boundary detection failed.',
  }));
  process.exit(1);
}

try {
  const payloadPath = process.argv[2];
  if (!payloadPath) throw new Error('Payload path is required.');
  debug('reading payload');
  const body = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  debug('waiting for opencv');
  cvReady.then(cv => {
    try {
      debug('opencv ready');
      detect(cv, body);
    } catch (error) {
      fail(error);
    }
  });
} catch (error) {
  fail(error);
}
