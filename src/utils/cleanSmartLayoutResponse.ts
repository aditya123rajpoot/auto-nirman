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
    if (typeof data === 'string') {
      let str = data.trim();

      // ✅ Remove prefix like "Here is the JSON response:"
      str = str.replace(/^here is (the )?json( output)?( response)?\s*[:\-]?\s*/i, '');

      // ✅ Match code block
      const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let jsonPart = '';
      let notePart = '';

      if (codeBlockMatch) {
        jsonPart = codeBlockMatch[1].trim();
        notePart = str.split(codeBlockMatch[0])[1]?.trim() || '';
      } else {
        // fallback: split on first {
        const index = str.indexOf('{');
        if (index !== -1) {
          jsonPart = str.slice(index).trim();
          notePart = str.slice(0, index).trim();
        } else {
          return data;
        }
      }

      const cleaned = jsonPart
        .replace(/(\w+):/g, '"$1":') // Quote keys
        .replace(/,\s*}/g, '}')      // Remove trailing commas
        .replace(/,\s*]/g, ']')      //
        .replace(/(\d+)\s*(sq ft|sqft|sqm|sq\.? m|ft|cars?)/gi, '"$1 $2"'); // Wrap units

      const parsed = JSON.parse(cleaned);
      return notePart ? { ...parsed, _note: notePart } : parsed;
    }

    return data;
  } catch {
    return data;
  }
};
