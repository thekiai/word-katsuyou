import { VerbEntry } from '../types';
import verbsData from '../data/verbs.json';

export async function loadVerbs(): Promise<VerbEntry[]> {
  try {
    return verbsData as VerbEntry[];
  } catch (error) {
    console.error('Failed to load verbs:', error);
    return [];
  }
}
