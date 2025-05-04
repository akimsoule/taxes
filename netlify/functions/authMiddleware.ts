import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from "@netlify/functions";

export const authMiddleware = (
  handler: (
    event: HandlerEvent,
    context: HandlerContext
  ) => Promise<HandlerResponse>
): Handler => {
  return async (
    event: HandlerEvent,
    context: HandlerContext
  ): Promise<HandlerResponse> => {
    const authHeader = event.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Unauthorized: Missing or invalid token",
        }),
      };
    }

    const token = authHeader.split(" ")[1];

    if (token !== "votre_token_securise") {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Forbidden: Invalid token" }),
      };
    }

    // on assume que le handler retourne bien un HandlerResponse
    return await handler(event, context);
  };
};
