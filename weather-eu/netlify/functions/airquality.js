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
      coordinates,
      radius = "25000",
      order_by = "distance",
      limit = "5",
    } = event.queryStringParameters || {};

    if (!coordinates) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing required 'coordinates' param" }),
      };
    }

    const url = new URL("https://api.openaq.org/v2/latest");
    url.searchParams.set("coordinates", coordinates);
    url.searchParams.set("radius", radius);
    url.searchParams.set("order_by", order_by);
    url.searchParams.set("limit", limit);

    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": process.env.OPENAQ_KEY || undefined,
      },
    });

    const body = await res.text();
    return {
      statusCode: res.status,
      headers: {
        ...CORS,
        "Content-Type":
          res.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
      body,
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
