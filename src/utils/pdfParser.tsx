import pdf from 'pdf-parse';
import { Record } from '../types/models';
import { useDataContext } from '../context/DataContext';

interface ParsePDFOptions {
  onComplete: (records: Record[]) => void;
  onError: (error: string) => void;
}

export const parseTangerinePDF = async (file: File, options: ParsePDFOptions) => {
  const { data } = useDataContext(); // Accéder aux données existantes
  const existingRecords = data.records; // Récupérer les enregistrements existants

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = await pdf(Buffer.from(arrayBuffer));

    // Vérifiez si le fichier est bien pour TANGERINE
    if (!pdfData.text.includes('TANGERINE')) {
      throw new Error("Le fichier PDF n'est pas valide pour TANGERINE.");
    }

    // Analysez le contenu du PDF pour extraire les records
    const records = extractRecordsFromTangerinePDF(pdfData.text, existingRecords);

    options.onComplete(records);
  } catch (error) {
    options.onError(error instanceof Error ? error.message : String(error));
  }
};

const extractRecordsFromTangerinePDF = (
  text: string,
  existingRecords: Record[] = [] // Liste des enregistrements existants
): Record[] => {
  const lines = text.split('\n');
  const records: Record[] = [];
  const existingKeys = new Set(
    existingRecords.map(
      (record) => `${record.date}-${record.description}-${record.amount}`
    )
  );

  // Exemple de logique pour extraire les données ligne par ligne
  lines.forEach((line) => {
    const match = line.match(
      /(?<date>\d{4}-\d{2}-\d{2})\s+(?<description>.+?)\s+(?<amount>-?\d+\.\d{2})/
    );

    if (match && match.groups) {
      const { date, description, amount } = match.groups;

      // Générer une clé unique pour chaque ligne
      const uniqueKey = `${date.trim()}-${description.trim()}-${parseFloat(amount)}`;

      // Vérifier si l'enregistrement existe déjà
      if (!existingKeys.has(uniqueKey)) {
        existingKeys.add(uniqueKey); // Ajouter la clé au Set
        records.push({
          id: crypto.randomUUID(),
          description: description.trim(),
          date: date.trim(),
          amount: parseFloat(amount),
          currency: 'CAD', // Par défaut pour TANGERINE
          deductible: false, // À ajuster selon vos besoins
          categoryId: '', // À mapper si nécessaire
          activityId: '', // À mapper si nécessaire
          bankId: 'TANGERINE', // ID de la banque
          receiptId: undefined,
          deductibleAmount: undefined,
        });
      }
    }
  });

  return records;
};