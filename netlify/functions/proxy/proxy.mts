import fetch from "node-fetch";

export async function handler(event: any) {
  const fileUrl = event.queryStringParameters.url;

  if (!fileUrl) {
    return {
      statusCode: 400,
      body: "Missing 'url' query parameter.",
    };
  }

  try {
    const response = await fetch(fileUrl, {});
    const buffer = await response.buffer();


    return {
      statusCode: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Access-Control-Allow-Origin": "*", // Permettre les requêtes cross-origin
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Error fetching file:", error);
    return {
      statusCode: 500,
      body: "Failed to fetch file.",
    };
  }
}