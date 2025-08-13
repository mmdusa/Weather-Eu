export async function handler() {
  try {
    // Call RainViewer API for radar frames
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");

    if (!res.ok) {
      throw new Error(`RainViewer request failed: ${res.status}`);
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
