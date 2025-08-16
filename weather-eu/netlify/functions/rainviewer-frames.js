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
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: {
        ...CORS,
        "Content-Type": res.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
      body: text,
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
