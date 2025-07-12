import { omit } from 'lodash';

export interface PlanSection {
  title: string;
  content: any;
  note?: string;
}

export const cleanSmartLayoutResponse = (rawSections: any[]): PlanSection[] => {
  if (!Array.isArray(rawSections)) return [];

  return rawSections
    .filter((section) => section && section.title && section.content)
    .map((section) => {
      const normalizedTitle = getNormalizedTitle(section.title);
      const cleanedContent = fixInvalidJSON(section.content);
      return {
        title: normalizedTitle,
        content: cleanedContent._note ? omit(cleanedContent, '_note') : cleanedContent,
        note: cleanedContent._note || section.note || undefined,
      };
    });
};

const getNormalizedTitle = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('smart layout')) return 'Smart Layout';
  if (lower.includes('vastu')) return 'Vastu Compliance';
  if (lower.includes('eco') || lower.includes('rainwater')) return 'Eco & Rainwater Strategy';
  return title.trim();
};

const fixInvalidJSON = (data: any): any => {
  try {
    if (typeof data !== 'string') return data;

    let str = data.trim();

    // ✅ Remove known prefaces
    str = str.replace(
      /^(here( is|’?s)?|this is|below is|following is)?( the)?\s*(json|architectural)?\s*(response|output|design)?\s*[:\-]?\s*/i,
      ''
    );

    // ✅ Extract content inside code block if present
    const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonPart = '';
    let notePart = '';

    if (codeBlockMatch) {
      jsonPart = codeBlockMatch[1].trim();
      notePart = str.split(codeBlockMatch[0])[1]?.trim() || '';
    } else {
      // fallback: split at first {
      const index = str.indexOf('{');
      if (index !== -1) {
        jsonPart = str.slice(index).trim();
        notePart = str.slice(0, index).trim();
      } else {
        return { _note: str }; // fully fallback
      }
    }

    // ✅ Preprocess JSON-like string
    const cleaned = jsonPart
      .replace(/(\w[\w\s]*?):/g, (_, key) => `"${key.trim()}":`) // Quote all keys
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/:\s*([0-9]+(?:\s*(sq ft|sqft|sqm|ft|cars?|nos|m2|m|x|×)[^",}]*)?)/gi, (match, val) => {
        return `: "${val.trim()}"`;
      }) // Wrap values like 300 sq ft in quotes
      .replace(/“|”/g, '"'); // Replace smart quotes with regular quotes

    const parsed = JSON.parse(cleaned);

    return notePart ? { ...parsed, _note: notePart } : parsed;
  } catch (err) {
    console.error('🛑 Failed to parse:', err);
    return { _note: typeof data === 'string' ? data : JSON.stringify(data) };
  }
};
