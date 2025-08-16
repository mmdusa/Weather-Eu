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
    // Path after the function name, e.g.
    // /.netlify/functions/rainviewer-tile/v2/radar/TS/256/Z/X/Y/OPACITY/PALETTE.png
    // But we’ll accept the simpler frontend path we recommend below:
    // /.netlify/functions/rainviewer-tile/TS/256/Z/X/Y/OPACITY/PALETTE.png
    const parts = (event.path || "").split("/").filter(Boolean);
    // parts = ["", ".netlify", "functions", "rainviewer-tile", ...rest]
    const i = parts.indexOf("rainviewer-tile");
    const rest = parts.slice(i + 1);

    // Expect: [ts, "256", z, x, y, opacity, palette.png]
    if (rest.length < 7) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Bad tile path" }),
      };
    }

    const [ts, size, z, x, y, opacity, paletteWithExt] = rest;
    const palette = paletteWithExt.replace(".png", "");
    const qs = event.rawQuery ? `?${event.rawQuery}` : "";

    const upstream = `https://tilecache.rainviewer.com/v2/radar/${ts}/${size}/${z}/${x}/${y}/${opacity}/${palette}.png${qs}`;

    const res = await fetch(upstream);

    const arrayBuf = await res.arrayBuffer();
    // Pass through status; always attach CORS so the browser can read it
    return {
      statusCode: res.status,
      headers: {
        ...CORS,
        "Content-Type": "image/png",
        "Cache-Control": res.ok ? "public, max-age=120" : "no-cache",
      },
      body: Buffer.from(arrayBuf).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
