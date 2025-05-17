import { Context } from "@netlify/functions";
import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY || "test"; // Remplacez par votre clé secrète
const secretKey = process.env.RECAPTCHA_SECRET_KEY || "RECAPTCHA_SECRET_KEY";

export const authMiddleware = (
  handler: (request: Request, context: Context & { userData?: any }) => Promise<Response>
) => {
  return async (request: Request, context: Context & { userData?: any }): Promise<Response> => {
    const authHeader = request.headers.get("authorization");
    const recaptchaToken = request.headers.get("x-recaptcha-token");
    const userEncrypted = request.headers.get("x-user-encrypted");

    // Décodage des données utilisateur
    let userData : any;
    try {
      if (!userEncrypted) {
        throw new Error("Missing encrypted user data");
      }
      const decodedUser = atob(userEncrypted); // Décodage Base64
      userData = JSON.parse(decodedUser); // Conversion en objet JSON
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Vérification du header Authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing or invalid token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.split(" ")[1];

    // Validation du token signé
    if (!validateSignedToken(token)) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Invalid token" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Vérification du token reCAPTCHA
    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing reCAPTCHA token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Appel à une fonction pour valider le token reCAPTCHA
      const isValidRecaptcha = await validateRecaptchaToken(recaptchaToken);
      if (!isValidRecaptcha) {
        return new Response(
          JSON.stringify({
            error: "Forbidden: Invalid reCAPTCHA token",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error: Failed to validate reCAPTCHA token",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ajout de userData au contexte
    context.userData = userData;

    // Appel du handler si toutes les vérifications passent
    return await handler(request, context);
  };
};

// Fonction pour valider un token signé
const validateSignedToken = (token: string): boolean => {
  try {
    const [uuid, signature] = token.split(".");
    if (!uuid || !signature) {
      return false;
    }

    // Recalculer la signature avec la clé secrète
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(uuid)
      .digest("hex");

    // Comparer la signature recalculée avec celle du token
    return signature === expectedSignature;
  } catch (error) {
    console.error("Error validating signed token:", error);
    return false;
  }
};

// Fonction pour valider le token reCAPTCHA
const validateRecaptchaToken = async (token: string): Promise<boolean> => {
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    }
  );

  const result = await response.json();
  return result.success;
};
