import { PrismaClient } from "@prisma/client";
import { Context } from "@netlify/functions";
import { google } from "googleapis"; // Import Google API client
import { Image } from "../types/models"; // Assurez-vous que le chemin est correct
import { TableType } from "../types/tableType";

const prisma = new PrismaClient();

const VALID_TYPES = [
  "users",
  "records",
  "receipts",
  "docs",
  "travels",
  "activities",
  "categories",
  "merchants",
  "banks",
] as const;

const VALID_ACTIONS = ["get", "add", "addBatch", "update", "delete"] as const;

type ValidType = (typeof VALID_TYPES)[number];
type ValidAction = (typeof VALID_ACTIONS)[number];

// Configure Google Drive API
const drive = google.drive({
  version: "v3",
  auth: process.env.GOOGLE_DRIVE_API_KEY, // Assurez-vous que cette clé est configurée dans vos variables d'environnement
});

// Utilitaire pour récupérer un fichier depuis Google Drive
async function getGoogleDriveFile(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId: fileId!,
      alt: "media",
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch file from Google Drive");
  }
}

// Utilitaire pour supprimer un fichier de Google Drive
async function deleteGoogleDriveFile(fileId: string) {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    throw new Error("Failed to delete file from Google Drive");
  }
}

// Utilitaire pour ajouter une image dans Google Drive et la base de données
async function addImage(body: Image) {
  const { id, base64, ocrRawData, uploadedAt, userEmail, fileName, fileType } =
    body;

  console.log(process.env.GOOGLE_DRIVE_API_KEY);

  if (!fileName || !base64) {
    throw new Error("Missing fileName or fileContent for image");
  }

  const now = new Date().toISOString();

  // Upload the image to Google Drive
  const fileMetadata = { name: fileName };
  const media = {
    mimeType: "image/jpeg",
    body: Buffer.from(base64, "base64"),
  };

  try {
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });
    const fileId = driveResponse.data.id;

    if (!fileId) {
      throw new Error("Failed to retrieve fileId from Google Drive response");
    }

    // Save the fileId in the database
    return await prisma.image.create({
      data: {
        id,
        ocrRawData, // Données OCR extraites de l'image
        uploadedAt, // Date d'upload de l'image
        userEmail, // ID de l'utilisateur qui a uploadé l'imageProvide a valid user reference or null if optional
        fileName, // Nom du fichier ajouté pour correspondre au type attendu
        fileType, // Type de fichier ajouté pour correspondre au type attendu
        fileLink: `https://drive.google.com/uc?id=${fileId}`, // Add the fileLink property with the Google Drive file URL
      },
    });
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw new Error("Failed to upload file to Google Drive");
  }
}

// Utilitaire pour récupérer une image depuis Google Drive
async function getImage(fileId: string) {
  if (!fileId) {
    throw new Error("Missing fileId for image");
  }
  return await getGoogleDriveFile(fileId);
}

// Utilitaire pour supprimer une image depuis Google Drive et la base de données
async function deleteImage(id: string) {
  if (!id) {
    throw new Error("Missing fileId for delete");
  }

  // Supprimer le fichier de Google Drive
  await deleteGoogleDriveFile(id);

  // Supprimer l'entrée correspondante dans la base de données
  await prisma.image.delete({
    where: { id },
  });
}

// Fonction utilitaire pour obtenir le type Prisma correct
function getPrismaType(type: ValidType): TableType {
  const typeMap: Record<ValidType, TableType> = {
    users: "user",
    records: "record",
    receipts: "receipt",
    docs: "doc",
    travels: "travel",
    activities: "activity",
    categories: "category",
    merchants: "merchant",
    banks: "bank",
  };

  return typeMap[type];
}

export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as ValidType;
    // Correction pour la transformation du type pluriel en type singulier pour Prisma
    const prismaType = type ? (getPrismaType(type) as string) : undefined;
    const action = url.searchParams.get("action") as ValidAction;
    const id = url.searchParams.get("id");

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
          });

          if (!items) {
            return new Response(JSON.stringify({ error: "Invalid type" }), {
              status: 400,
            });
          }

          const totalItems = await prisma[prismaType].count();
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
            const where: Record<string, any> = {};
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
            const where = {};
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
                  data: { ...item },
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
          const updatedItem = await prisma[prismaType].update({
            where: { id },
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
          const deletedItem = await prisma[prismaType].delete({
            where: { id },
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
