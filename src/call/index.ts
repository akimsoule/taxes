import { Record } from "../types/models";

export const callUploadTangerineRecordsApi = async (
  file: File,
  onComplete: (records: Record[]) => void,
  onError: (error: string) => void
) => {
  try {
    // Convertir le fichier en Base64
    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    const base64File = await toBase64(file);

    // Envoyer le fichier encodé en Base64 à l'API
    const response = await fetch("/api/upload-tangerine-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: base64File }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    onComplete(data.records);
  } catch (error) {
    onError(error instanceof Error ? error.message : String(error));
  }
};
