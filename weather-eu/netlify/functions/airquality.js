export async function handler(event, context) {
  const res = await fetch(`/.netlify/functions/airquality?coordinates=45.0703,7.6869&radius=25000&order_by=distance&limit=5`);
  const data = await res.json();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
}
