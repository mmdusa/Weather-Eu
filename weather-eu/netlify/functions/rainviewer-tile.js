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
    const qs = event.queryStringParameters || {};
    const time = qs.time; // required
    const z = qs.z;
    const x = qs.x;
    const y = qs.y;

    if (!time || !z || !x || !y) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing required params: time, z, x, y" }),
      };
    }

    const color = qs.color ?? "3";
    const smooth = qs.smooth ?? "1";
    const snow = qs.snow ?? "1";

    // 256 tiles; '2' = radar; '1_1' = PNG format
    const upstream = `https://tilecache.rainviewer.com/v2/radar/${time}/256/${z}/${x}/${y}/2/1_1.png?color=${color}&smooth=${smooth}&snow=${snow}`;

    const res = await fetch(upstream);
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { ...CORS, "Content-Type": "text/plain" },
        body: `Upstream error ${res.status}`,
      };
    }

    const buf = Buffer.from(await res.arrayBuffer());

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...CORS,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
      body: buf.toString("base64"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
