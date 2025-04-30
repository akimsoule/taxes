import { Context } from "@netlify/functions";
import { Record } from "../types/models";
import pdfParse from "pdf-parse";

interface ParseTextOptions {
  onComplete: (records: Record[]) => void;
  onError: (error: string) => void;
}

const data: { records: Record[] } = {
  records: [],
};

export const parseTangerineTextBase64 = async (
  base64Data: string,
  options: ParseTextOptions
) => {
  try {
    // Décoder les données Base64 en Buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Utiliser pdf-parse pour extraire le texte
    const pdfData = await pdfParse(buffer);

    // Diviser le texte par pages
    const transactionPages = pdfData.text.split("\n\n"); // Renommé de `pages` à `transactionPages`

    debugger;

    let allRecords: Record[] = [];

    transactionPages.forEach((pageText, index) => {
      console.log(`Traitement de la page ${index + 1}`);
      console.log("Texte de la page :", pageText);
      const records = extractRecordsFromTangerineText(pageText, data.records);
      console.log("Enregistrements extraits :", records);
      debugger;
      allRecords.push(...records);
    });

    options.onComplete(allRecords);
  } catch (error) {
    console.error("Erreur lors du traitement Base64 :", error);
    options.onError(error instanceof Error ? error.message : String(error));
  }
};

const extractRecordsFromTangerineText = (
  text: string,
  existingRecords: Record[] = []
): Record[] => {
  const lines = text.split("\n");
  const records: Record[] = [];
  const existingKeys = new Set(
    existingRecords.map(
      (record) => `${record.date}-${record.description}-${record.amount}`
    )
  );

  console.log("Lignes analysées :", lines);

  lines.forEach((line) => {
    const match = line.match(
      /(?<date>\d{4}-\d{2}-\d{2})\s+(?<description>.+?)\s+(?<amount>-?\d+\.\d{2})/
    );

    if (match && match.groups) {
      const { date, description, amount } = match.groups;

      const uniqueKey = `${date.trim()}-${description.trim()}-${parseFloat(
        amount
      )}`;

      if (!existingKeys.has(uniqueKey)) {
        existingKeys.add(uniqueKey);
        const record = {
          id: crypto.randomUUID(),
          description: description.trim(),
          date: date.trim(),
          amount: parseFloat(amount),
          currency: "CAD",
          deductible: false,
          categoryId: "",
          activityId: "",
          bankId: "TANGERINE",
          receiptId: undefined,
          deductibleAmount: undefined,
        };
        records.push(record);
        console.log("Enregistrement extrait :", record);
      }
    } else {
      console.warn("Ligne non correspondante :", line);
    }
  });

  return records;
};

// Configuration du service REST API JSON
export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url);

    switch (request.method) {
      case "GET": {
        // Retourner tous les enregistrements
        return new Response(JSON.stringify(data.records), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "POST": {
        const contentType = request.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          const body = await request.json();
          const base64File = body.file;

          if (!base64File) {
            return new Response(
              JSON.stringify({ body: "Aucun fichier fourni" }),
              { status: 400 }
            );
          }

          // Traitez les données Base64 directement
          await parseTangerineTextBase64(base64File.split(",")[1], {
            onComplete: (records) => {
              data.records.push(...records);
            },
            onError: (error) => {
              throw new Error(error);
            },
          });

          return new Response(
            JSON.stringify({ body: "Données traitées avec succès" }),
            { status: 200 }
          );
        }

        const body = await request.json();
        const newRecord: Record = {
          ...body,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.records.push(newRecord);
        return new Response(JSON.stringify(newRecord), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "PUT": {
        // Mettre à jour un enregistrement existant
        const body = await request.json();
        const recordIndex = data.records.findIndex((r) => r.id === body.id);
        if (recordIndex === -1) {
          return new Response(JSON.stringify({ body: "Record not found" }), {
            status: 404,
          });
        }
        data.records[recordIndex] = {
          ...data.records[recordIndex],
          ...body,
          updatedAt: new Date().toISOString(),
        };
        return new Response(JSON.stringify(data.records[recordIndex]), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "DELETE": {
        // Supprimer un enregistrement
        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(JSON.stringify({ body: "ID is required" }), {
            status: 400,
          });
        }
        const recordIndex = data.records.findIndex((r) => r.id === id);
        if (recordIndex === -1) {
          return new Response(JSON.stringify({ body: "Record not found" }), {
            status: 404,
          });
        }
        const deletedRecord = data.records.splice(recordIndex, 1);
        return new Response(JSON.stringify(deletedRecord), {
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ body: "Method not allowed" }), {
          status: 405,
        });
    }
  } catch (error) {
    console.error("Error in upload-tangerine-records function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
