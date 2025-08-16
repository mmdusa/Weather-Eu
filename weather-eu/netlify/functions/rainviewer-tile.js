// netlify/functions/rainviewer-tile.js
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

exports.handler = async (event, _context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS };
  }

  try {
    // everything after the function name is the RainViewer path
    // e.g. /api/rainviewer/tile/1755377400/256/6/33/23/2/1_1.png?color=3&smooth=1&snow=1
    const path = event.path.replace(/^.*\/rainviewer-tile\//, "");
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
    const upstream = `https://tilecache.rainviewer.com/v2/radar/${path}${qs}`;

    const res = await fetch(upstream);
    const arrayBuf = await res.arrayBuffer();

    return {
      statusCode: res.status,
      headers: {
        ...CORS,
        // pass back correct content type
        "Content-Type": res.headers.get("content-type") || "image/png",
        // cache a little to reduce function hits
        "Cache-Control": "public, max-age=60",
      },
      isBase64Encoded: true,
      body: Buffer.from(arrayBuf).toString("base64"),
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
