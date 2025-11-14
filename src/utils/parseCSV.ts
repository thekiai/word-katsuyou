import { VerbEntry } from '../types';

export async function parseCSV(csvText: string): Promise<VerbEntry[]> {
  const lines = csvText.trim().split('\n');

  // Skip header line (first line)
  const dataLines = lines.slice(1);

  const verbs: VerbEntry[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;

    // Split by comma but handle potential issues
    const fields = line.split(',');

    if (fields.length >= 10) {
      verbs.push({
        base: fields[0].trim(),
        meaningJa: fields[1].trim(),
        present: fields[2].trim(),
        past: fields[3].trim(),
        future: fields[4].trim(),
        go: fields[5].trim(),
        seo: fields[6].trim(),
        negative_an: fields[7].trim(),
        negative_jian: fields[8].trim(),
        possible: fields[9].trim(),
      });
    }
  }

  return verbs;
}

export async function loadVerbs(): Promise<VerbEntry[]> {
  try {
    const response = await fetch('/src/data/korean_verbs_with_meaning.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Failed to load verbs:', error);
    return [];
  }
}
