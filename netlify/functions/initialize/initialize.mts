import { PrismaClient } from "@prisma/client";
import { Context } from "@netlify/functions";
import { authMiddleware } from "../authMiddleware"; // Import du middleware

const prisma = new PrismaClient();

// Données initiales
const initialBanks = [
  { id: "TANGERINE", name: "TANGERINE" },
  { id: "RBC", name: "RBC" },
  { id: "DESJARDINS", name: "DESJARDINS" },
];

const initializeHandler = async (
  request: Request,
  context: Context
): Promise<Response> => {
  try {
    console.log("Initialisation de la base de données...");

    // Insertion des banques
    for (const bank of initialBanks) {
      await prisma.bank.upsert({
        where: { id: bank.id },
        update: { name: bank.name },
        create: {
          id: bank.id,
          name: bank.name,
        },
      });
    }

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ message: "Base de données initialisée avec succès" }),
    //   headers: { "Content-Type": "application/json" },
    // }

    return new Response(
      JSON.stringify({ message: "Base de données initialisée avec succès" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la BD:", error);
    return new Response(
      JSON.stringify({
        error: "Échec de l'initialisation de la base de données",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({
    //     error: "Échec de l'initialisation de la base de données",
    //     details: error.message,
    //   }),
    //   headers: { "Content-Type": "application/json" },
    // }
  } finally {
    await prisma.$disconnect();
  }
};

// Envelopper le handler avec authMiddleware
export default authMiddleware(initializeHandler);
