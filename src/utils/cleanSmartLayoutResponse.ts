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
        content: cleanedContent,
        note: section.note || undefined,
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
      // Fix common issues like unquoted keys, trailing commas, or units like '300 sq ft'
      const cleaned = data
        .replace(/(\w+):/g, '"$1":') // unquoted keys
        .replace(/,\s*}/g, '}')      // trailing commas
        .replace(/,\s*]/g, ']')      // trailing commas in arrays
        .replace(/(\d+)\s*(sq ft|sqft|sqm|sq\.? m)/gi, '"$1 $2"'); // numbers with units
      return JSON.parse(cleaned);
    }
    return data;
  } catch {
    return data;
  }
};
