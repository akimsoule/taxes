import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { Context } from "@netlify/functions";

const SECRET_KEY = process.env.SECRET_KEY || "test"; // Assurez-vous de définir cette clé dans vos variables d'environnement Netlify

export default async (
  request: Request,
  context: Context
): Promise<Response> => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Générer un UUID
    const uuid = uuidv4();

    // Signer l'UUID avec la clé secrète
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(uuid)
      .digest("hex");

    // Retourner le token signé
    const token = `${uuid}.${signature}`;

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating bearer token:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate bearer token" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
