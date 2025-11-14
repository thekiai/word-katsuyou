import { VerbEntry } from '../types';

export async function loadVerbs(): Promise<VerbEntry[]> {
  try {
    const response = await fetch('/src/data/verbs.json');
    const verbs = await response.json();
    return verbs;
  } catch (error) {
    console.error('Failed to load verbs:', error);
    return [];
  }
}
