export async function handler(event) {
  try {
    const { lat, lng } = event.queryStringParameters;

    if (!lat || !lng) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing lat/lng parameters" })
      };
    }

    // Call OpenAQ API
    const res = await fetch(
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lng}&radius=25000&order_by=distance&limit=5`,
      {
        headers: {
          "x-api-key": process.env.OPENAQ_KEY || "" // Optional if you have a key
        }
      }
    );

    if (!res.ok) {
      throw new Error(`OpenAQ request failed: ${res.status}`);
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
}
