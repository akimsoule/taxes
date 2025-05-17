import { PrismaClient } from "@prisma/client";
import { Context } from "@netlify/functions";
import { TableType } from "../types/tableType";
import { authMiddleware } from "../authMiddleware";

const prisma = new PrismaClient();

const VALID_TYPES = [
  "users",
  "records",
  "receipts",
  "travels",
  "activities",
  "categories",
  "merchants",
  "banks",
] as const;

const VALID_ACTIONS = ["get", "add", "addBatch", "update", "delete"] as const;

type ValidType = (typeof VALID_TYPES)[number];
type ValidAction = (typeof VALID_ACTIONS)[number];

// Fonction utilitaire pour obtenir le type Prisma correct
function getPrismaType(type: ValidType): TableType {
  const typeMap: Record<ValidType, TableType> = {
    users: "user",
    records: "record",
    receipts: "receipt",
    travels: "travel",
    activities: "activity",
    categories: "category",
    merchants: "merchant",
    banks: "bank",
  };

  return typeMap[type];
}

const action = async (
  request: Request,
  context: Context & { userData?: any }
) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as ValidType;
    // Correction pour la transformation du type pluriel en type singulier pour Prisma
    const prismaType = type ? (getPrismaType(type) as string) : undefined;
    const action = url.searchParams.get("action") as ValidAction;
    const id = url.searchParams.get("id");
    const userData = context.userData;

    // Tables nécessitant un filtre par userEmail
    const tablesRequiringUserEmail = [
      "users",
      "records",
      "receipts",
      "travels",
      "activities",
    ];

    // Construire la clause where dynamiquement
    const where: Record<string, any> = {};
    if (tablesRequiringUserEmail.includes(type)) {
      where.userEmail = userData.email;
    }

    if (!type || !VALID_TYPES.includes(type) || !prismaType) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing type parameter" }),
        {
          status: 400,
        }
      );
    }

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing action parameter" }),
        {
          status: 400,
        }
      );
    }

    switch (action) {
      case "get": {
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

        if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
          return new Response(
            JSON.stringify({ error: "Invalid page or pageSize parameter" }),
            { status: 400 }
          );
        }

        const skip = (page - 1) * pageSize;

        try {
          const items = await prisma[prismaType].findMany({
            skip,
            take: pageSize,
            where, // Ajouter la clause where
          });

          if (!items) {
            return new Response(JSON.stringify({ error: "Invalid type" }), {
              status: 400,
            });
          }

          const totalItems = await prisma[prismaType].count({
            where, // Ajouter la clause where pour le comptage
          });
          const totalPages = Math.ceil(totalItems / pageSize);

          return new Response(
            JSON.stringify({
              items,
              pagination: {
                page,
                pageSize,
                totalItems,
                totalPages,
              },
            }),
            { status: 200 }
          );
        } catch (error) {
          console.error("Error fetching items:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      case "add": {
        try {
          const body = await request.json();
          const now = new Date().toISOString();

          // Récupérer les propriétés uniques de l'URL
          const uniqPropsParam = url.searchParams.get("uniqProps");
          const uniqProps = uniqPropsParam ? uniqPropsParam.split(",") : ["id"];

          // Vérification corrigée pour s'assurer que toutes les propriétés uniques sont présentes dans le body
          if (
            uniqProps.length > 0 &&
            uniqProps.every(
              (prop) => body[prop] !== undefined && body[prop] !== null
            )
          ) {
            // Construire la condition where basée sur les propriétés uniques
            uniqProps.forEach((prop) => {
              where[prop] = body[prop];
            });

            // Utiliser upsert au lieu de create
            const newItem = await prisma[prismaType].upsert({
              where,
              update: {
                ...body,
              },
              create: {
                ...body,
                userEmail: tablesRequiringUserEmail.includes(type)
                  ? userData.email
                  : undefined,
              },
            });

            return new Response(JSON.stringify(newItem), { status: 201 });
          } else {
            return new Response(
              JSON.stringify({
                error: "Missing or invalid unique properties in body",
              }),
              { status: 400 }
            );
          }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      case "addBatch": {
        try {
          const body = await request.json();

          // Récupérer les propriétés uniques de l'URL
          const uniqPropsParam = url.searchParams.get("uniqProps");
          const uniqProps = uniqPropsParam
            ? uniqPropsParam.split(",")
            : undefined;

          // Si on a des propriétés uniques, on utilise upsert
          if (uniqProps && uniqProps.length > 0) {
            // Construire la condition where basée sur les propriétés uniques
            uniqProps.forEach((prop) => {
              where[prop] = body[prop];
            });
            // Utiliser upsert au lieu de create
            const newItems = await Promise.all(
              body.map((item: any) =>
                prisma[prismaType].upsert({
                  where,
                  update: {
                    ...item,
                  },
                  create: {
                    ...item,
                    userEmail: tablesRequiringUserEmail.includes(type)
                      ? userData.email
                      : undefined,
                  },
                })
              )
            );
            return new Response(JSON.stringify(newItems), { status: 201 });
          } else {
            // Comportement par défaut si pas de propriétés uniques valides
            const newItems = await Promise.all(
              body.map((item: any) =>
                prisma[prismaType].create({
                  data: {
                    ...item,
                    userEmail: tablesRequiringUserEmail.includes(type)
                      ? userData.email
                      : undefined,
                  },
                })
              )
            );
            return new Response(JSON.stringify(newItems), { status: 201 });
          }
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for update" }),
            { status: 400 }
          );
        }

        try {
          const body = await request.json();
          const now = new Date().toISOString();

          where.id = id;

          const updatedItem = await prisma[prismaType].update({
            where,
            data: { ...body, updatedAt: now },
          });
          if (!updatedItem) {
            return new Response(
              JSON.stringify({ error: "Item not found or invalid type" }),
              { status: 404 }
            );
          }
          return new Response(JSON.stringify(updatedItem), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for delete" }),
            { status: 400 }
          );
        }

        try {
          where.id = id;
          const deletedItem = await prisma[prismaType].delete({
            where,
          });
          if (!deletedItem) {
            return new Response(
              JSON.stringify({ error: "Item not found or invalid type" }),
              { status: 404 }
            );
          }
          return new Response(null, { status: 204 });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid or missing action" }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in action function:", error);
    return new Response(JSON.stringify({ error: error.toString() }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default authMiddleware(action);
