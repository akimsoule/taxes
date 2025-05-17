import { Context } from "@netlify/functions";

export default async (
  request: Request,
  context: Context
): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing 'url' query parameter.", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch file.");
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        // Type MIME du fichier (pdf, image, vidéo, etc.)
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",

        // ⚠️ Ceci empêche le navigateur de le télécharger
        "Content-Disposition": "inline",

        // Autorise l'affichage cross-origin dans un iframe
        "Access-Control-Allow-Origin": "*",

        // Facile à ajouter, mais optionnel ici
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy fetch error:", error);
    return new Response("Failed to fetch file.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};
