// netlify/functions/rainviewer-tile.js
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS };
  }

  try {
    const {
      ts,   // timestamp
      z,
      x,
      y,
      color = "3",
      smooth = "1",
      snow = "1",
    } = event.queryStringParameters || {};

    if (!ts || !z || !x || !y) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing required ts, z, x, or y query params" }),
      };
    }

    const upstream = `https://tilecache.rainviewer.com/v2/radar/${ts}/256/${z}/${x}/${y}/2/1_1.png?color=${color}&smooth=${smooth}&snow=${snow}`;
    const res = await fetch(upstream);

    if (!res.ok) {
      const txt = await res.text();
      return {
        statusCode: res.status,
        headers: { ...CORS, "Content-Type": "text/plain" },
        body: txt || `Upstream error (${res.status})`,
      };
    }

    const buf = Buffer.from(await res.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=120",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
