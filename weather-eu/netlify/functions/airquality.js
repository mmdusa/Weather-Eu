// netlify/functions/airquality.js
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    const {
      coordinates,           // "lat,lon"
      radius = "25000",
      order_by = "distance",
      limit = "5",
    } = event.queryStringParameters || {};

    if (!coordinates) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing required 'coordinates' param (format: lat,lon)" }),
      };
    }

    const url = new URL("https://api.openaq.org/v2/latest");
    url.searchParams.set("coordinates", coordinates);
    url.searchParams.set("radius", radius);
    url.searchParams.set("order_by", order_by);
    url.searchParams.set("limit", limit);

    const headers = { "User-Agent": "netlify-function-airquality" };
    if (process.env.OPENAQ_KEY) headers["x-api-key"] = process.env.OPENAQ_KEY;

    const upstream = await fetch(url.toString(), { method: "GET", headers });

    const contentType = upstream.headers.get("content-type") || "application/json; charset=utf-8";
    const bodyText = await upstream.text();

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers: { ...CORS, "Content-Type": contentType },
        body: bodyText || JSON.stringify({ error: "Upstream error from OpenAQ" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
      body: bodyText,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "OpenAQ proxy failed", details: String(err) }),
    };
  }
};
