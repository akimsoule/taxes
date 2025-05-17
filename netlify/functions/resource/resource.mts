import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { Context } from "@netlify/functions";
import * as stream from "stream";
import { authMiddleware } from "../authMiddleware";

const prisma = new PrismaClient();

// Authentification Google avec compte de service
const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const validResourceTypes = [
  "INVOICE",
  "RECEIPT",
  "TRAVEL",
  "OTHER",
  "BANK_STATEMENT",
  "PAYSLIP",
  "CONTRACT",
  "IDENTITY_DOCUMENT",
  "INSURANCE_POLICY",
  "WARRANTY",
  "CERTIFICATE",
  "MEDICAL_RECORD",
  "TAX_DOCUMENT",
  "LEGAL_DOCUMENT",
  "PROPERTY_DOCUMENT",
  "VEHICLE_DOCUMENT",
  "EDUCATIONAL_DOCUMENT",
];

const resourceApi = async (request: Request, context: Context & { userData?: any }) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const action = url.searchParams.get("action");
    const userData = context.userData; // Récupérer les données utilisateur

    if (type !== "resources") {
      return new Response(
        JSON.stringify({
          error: "Invalid type. Only 'resources' is supported for this action.",
        }),
        { status: 400 }
      );
    }

    switch (action) {
      case "post": {
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
          });
        }

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
          return new Response(
            JSON.stringify({
              error: "Invalid Content-Type. Expected multipart/form-data.",
            }),
            { status: 400 }
          );
        }

        const boundary = contentType.split("boundary=")[1];
        if (!boundary) {
          return new Response(
            JSON.stringify({ error: "Invalid multipart/form-data format." }),
            { status: 400 }
          );
        }

        const bodyBuffer = Buffer.from(await request.arrayBuffer());
        const parts = parseMultipartFormData(bodyBuffer, boundary);

        const filePart = parts.find((part) => part.name === "file");
        const metadataPart = parts.find((part) => part.name === "metadata");

        if (!filePart || !metadataPart) {
          return new Response(
            JSON.stringify({ error: "File or metadata is missing." }),
            { status: 400 }
          );
        }

        const metadata = JSON.parse(metadataPart.data.toString());
        const fileData = filePart.data;

        if (!Buffer.isBuffer(fileData)) {
          throw new Error("File data is not a valid buffer.");
        }

        // Validation du type de resource
        if (!validResourceTypes.includes(metadata.type)) {
          metadata.type = "OTHER"; // Valeur par défaut
        }

        const passThroughStream = new stream.PassThrough();
        passThroughStream.end(fileData);

        const fileMetadata = {
          name: metadata.fileName || "unknown",
        };

        const media = {
          mimeType: metadata.fileType || "application/octet-stream",
          body: passThroughStream, // Utilisation du flux
        };

        try {
          const driveResponse = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: "id",
          });

          const fileId = driveResponse.data.id;
          if (!fileId) {
            throw new Error("Failed to upload file to Google Drive");
          }

          // Ajout des permissions après la création du fichier
          await drive.permissions.create({
            fileId,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          });

          const uploadedAt = new Date().toISOString();

          const fileLink = `https://drive.google.com/uc?id=${fileId}&export=download`;

          const savedResource = await prisma.resource.create({
            data: {
              id: fileId,
              fileName: metadata.fileName || "unknown",
              fileType: metadata.fileType || "unknown",
              uploadedAt,
              userEmail: metadata.userEmail || "unknown",
              ocrRawData: metadata.ocrRawData || "",
              fileLink,
              type: metadata.type,
              isArchived: metadata.isArchived || false, // Par défaut, non archivé
            },
          });

          return new Response(JSON.stringify(savedResource), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("Error uploading file to Google Drive:", error);
          return new Response(
            JSON.stringify({ error: "Failed to upload file to Google Drive." }),
            { status: 500 }
          );
        }
      }

      case "get": {
        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for getSingleResource" }),
            { status: 400 }
          );
        }

        try {
          const resource = await prisma.resource.findFirst({
            where: {
              id,
              userEmail: userData.email, // Filtrer par userEmail
            },
          });

          if (!resource) {
            return new Response(
              JSON.stringify({ error: "Resource not found" }),
              { status: 404 }
            );
          }

          return new Response(JSON.stringify(resource), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      case "getBatch": {
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
          const resources = await prisma.resource.findMany({
            skip,
            take: pageSize,
            where: {
              userEmail: userData.email, // Filtrer par userEmail
            },
          });

          const totalItems = await prisma.resource.count({
            where: {
              userEmail: userData.email, // Filtrer par userEmail
            },
          });
          const totalPages = Math.ceil(totalItems / pageSize);

          return new Response(
            JSON.stringify({
              items: resources,
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

      case "update": {
        if (request.method !== "PUT") {
          return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
          });
        }

        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for updateResource" }),
            { status: 400 }
          );
        }

        try {
          // Vérifier que la ressource appartient à l'utilisateur
          const resource = await prisma.resource.findFirst({
            where: {
              id,
              userEmail: userData.email, // Filtrer par userEmail
            },
          });

          if (!resource) {
            return new Response(
              JSON.stringify({ error: "Resource not found or unauthorized" }),
              { status: 404 }
            );
          }

          // Lire le corps de la requête pour obtenir les données à mettre à jour
          const body = await request.json();

          // Mettre à jour la ressource dans la base de données
          const updatedResource = await prisma.resource.update({
            where: { id },
            data: {
              fileName: body.fileName || resource.fileName,
              fileType: body.fileType || resource.fileType,
              ocrRawData: body.ocrRawData || resource.ocrRawData,
              type: body.type || resource.type,
              isArchived: body.isArchived !== undefined ? body.isArchived : resource.isArchived,
            },
          });

          return new Response(JSON.stringify(updatedResource), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("Error updating resource:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update resource" }),
            { status: 500 }
          );
        }
      }

      case "delete": {
        if (request.method !== "DELETE") {
          return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
          });
        }

        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for deleteResource" }),
            { status: 400 }
          );
        }

        try {
          // Vérifier que la ressource appartient à l'utilisateur
          const resource = await prisma.resource.findFirst({
            where: {
              id,
              userEmail: userData.email, // Filtrer par userEmail
            },
          });

          if (!resource) {
            return new Response(
              JSON.stringify({ error: "Resource not found or unauthorized" }),
              { status: 404 }
            );
          }

          // Supprimer la ressource de Google Drive
          await drive.files.delete({ fileId: id });

          // Supprimer la ressource de la base de données
          await prisma.resource.delete({
            where: { id },
          });

          return new Response(
            JSON.stringify({ message: "Resource deleted successfully" }),
            { status: 200 }
          );
        } catch (error) {
          console.error("Error deleting resource:", error);
          return new Response(
            JSON.stringify({ error: "Failed to delete resource" }),
            { status: 500 }
          );
        }
      }

      case "archive": {
        if (request.method !== "PATCH") {
          return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
          });
        }

        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for archiveResource" }),
            { status: 400 }
          );
        }

        try {
          // Vérifier que la ressource appartient à l'utilisateur
          const resource = await prisma.resource.findFirst({
            where: {
              id,
              userEmail: userData.email, // Filtrer par userEmail
            },
          });

          if (!resource) {
            return new Response(
              JSON.stringify({ error: "Resource not found or unauthorized" }),
              { status: 404 }
            );
          }

          const updatedResource = await prisma.resource.update({
            where: { id },
            data: { isArchived: true },
          });

          return new Response(JSON.stringify(updatedResource), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("Error archiving resource:", error);
          return new Response(
            JSON.stringify({ error: "Failed to archive resource" }),
            { status: 500 }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid or missing action" }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in resource function:", error);
    return new Response(JSON.stringify({ error: error.toString() }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Fonction utilitaire pour parser le multipart/form-data
function parseMultipartFormData(buffer: Buffer, boundary: string) {
  const parts: { name: string; data: Buffer }[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const boundaryEndBuffer = Buffer.from(`--${boundary}--`);

  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;
  let end = buffer.indexOf(boundaryBuffer, start);

  while (end !== -1) {
    const partBuffer = buffer.slice(start, end);
    const headerEndIndex = partBuffer.indexOf("\r\n\r\n");
    const headers = partBuffer.slice(0, headerEndIndex).toString();
    const contentDispositionMatch = headers.match(/name="([^"]+)"/);
    const name = contentDispositionMatch ? contentDispositionMatch[1] : "";

    const data = partBuffer.slice(headerEndIndex + 4, partBuffer.length - 2);
    parts.push({ name, data });

    start = end + boundaryBuffer.length;
    end = buffer.indexOf(boundaryBuffer, start);
  }

  return parts;
}

export default authMiddleware(resourceApi);
