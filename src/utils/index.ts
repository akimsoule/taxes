import cv from "@techstark/opencv-js";
import { recognize } from "tesseract.js";
import { Record } from "../types/models";
import { addBatchItems } from "../services/dataService";

export const extractOCRData = async (imageBase64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageBase64;

    img.onload = async () => {
      try {
        // Créez un canvas pour dessiner l'image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convertissez l'image en matrice OpenCV
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Appliquez un seuil pour améliorer le contraste
        const threshold = new cv.Mat();
        cv.threshold(
          gray,
          threshold,
          0,
          255,
          cv.THRESH_BINARY + cv.THRESH_OTSU
        );

        // Détectez les contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(
          threshold,
          contours,
          hierarchy,
          cv.RETR_EXTERNAL,
          cv.CHAIN_APPROX_SIMPLE
        );

        // Trouvez le plus grand contour (supposé être la région d'intérêt)
        let maxArea = 0;
        let largestContour = null;
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i);
          const area = cv.contourArea(contour);
          if (area > maxArea) {
            maxArea = area;
            largestContour = contour;
          }
        }

        if (largestContour) {
          // Obtenez le rectangle englobant
          const rect = cv.boundingRect(largestContour);

          // Recadrez l'image
          const cropped = src.roi(rect);

          // Affichez le résultat recadré sur le canvas
          cv.imshow(canvas, cropped);

          // Convertir le canvas recadré en base64 pour OCR
          const processedBase64 = canvas.toDataURL("image/png");

          // Utiliser Tesseract.js pour extraire le texte
          const result = await recognize(processedBase64, "eng", {
            logger: (m) => console.log(m), // Optionnel : pour debug
          });

          // Libération mémoire OpenCV
          src.delete();
          gray.delete();
          threshold.delete();
          contours.delete();
          hierarchy.delete();
          cropped.delete();

          resolve(result.data.text);
        } else {
          throw new Error("Aucun contour détecté pour le recadrage.");
        }
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
  });
};

export const addEntities = async (parsedRecords: Record[]) => {
  // add merchants first
  const merchants = new Set<string>();
  parsedRecords.map((record) => {
    merchants.add(record.description);
  });
  await addBatchItems(
    "merchants",
    Array.from(merchants).map((merchant) => ({
      name: merchant,
    })),
    ["name"]
  );
  // add categories
  const categories = new Set<string>();
  parsedRecords.map((record) => {
    categories.add(record.categoryName);
  });
  await addBatchItems(
    "categories",
    Array.from(categories).map((category) => ({
      name: category,
    })),
    ["name"]
  );
  // add records
  await addBatchItems(
    "records",
    parsedRecords.map((record) => ({
      ...record,
    })),
    ["date", "description", "amount"]
  );
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois indexé à 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
