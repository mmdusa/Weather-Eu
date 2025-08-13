export async function handler(event) {
  try {
    // Forward query params from the request to the real OpenAQ API
    const res = await fetch(`https://api.openaq.org/v2/latest?${event.rawQuery}`, {
      headers: {
        "x-api-key": process.env.OPENAQ_KEY || "" // Optional if API key is required
      }
    });

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
      body: JSON.stringify({ error: err.message })
    };
  }
}
