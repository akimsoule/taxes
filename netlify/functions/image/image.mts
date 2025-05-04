import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { Context } from "@netlify/functions";
import * as stream from "stream";

const prisma = new PrismaClient();

// Authentification Google avec compte de service
const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const action = url.searchParams.get("action");

    if (type !== "images") {
      return new Response(
        JSON.stringify({
          error: "Invalid type. Only 'images' is supported for this action.",
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

        const passThroughStream = new stream.PassThrough();
        passThroughStream.end(fileData);

        const fileMetadata = {
          name: metadata.fileName || "unknown",
        };

        const media = {
          mimeType: metadata.fileType || "application/octet-stream",
          body: passThroughStream,
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

          const savedImage = await prisma.image.create({
            data: {
              id: fileId,
              fileName: metadata.fileName || "unknown",
              fileType: metadata.fileType || "unknown",
              uploadedAt,
              userEmail: metadata.userEmail || "unknown",
              ocrRawData: metadata.ocrRawData || "",
              fileLink,
            },
          });

          return new Response(JSON.stringify(savedImage), {
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
            JSON.stringify({ error: "Missing id for getSingleImage" }),
            { status: 400 }
          );
        }

        try {
          const image = await prisma.image.findUnique({
            where: { id },
          });

          if (!image) {
            return new Response(JSON.stringify({ error: "Image not found" }), {
              status: 404,
            });
          }

          return new Response(JSON.stringify(image), {
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
          const images = await prisma.image.findMany({
            skip,
            take: pageSize,
          });

          const totalItems = await prisma.image.count();
          const totalPages = Math.ceil(totalItems / pageSize);

          return new Response(
            JSON.stringify({
              items: images,
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

      case "delete": {
        if (request.method !== "DELETE") {
          return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
          });
        }

        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for deleteImage" }),
            { status: 400 }
          );
        }

        try {
          // Supprimer l'image de Google Drive
          await drive.files.delete({ fileId: id });

          // Supprimer l'image de la base de données
          await prisma.image.delete({
            where: { id },
          });

          return new Response(
            JSON.stringify({ message: "Image deleted successfully" }),
            { status: 200 }
          );
        } catch (error) {
          console.error("Error deleting image:", error);
          return new Response(
            JSON.stringify({ error: "Failed to delete image" }),
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
    console.error("Error in image function:", error);
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
