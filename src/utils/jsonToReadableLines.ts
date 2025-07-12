export function jsonToReadableLines(data: any, indent = 0): string[] {
  const spacing = '  '.repeat(indent);
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        lines.push(`${spacing}${key}:`);
        lines.push(...jsonToReadableLines(value, indent + 1));
      } else {
        lines.push(`${spacing}${key}: ${value}`);
      }
    }
    return lines;
  } else if (Array.isArray(data)) {
    return data.flatMap((item) => jsonToReadableLines(item, indent));
  } else {
    return [`${spacing}${data}`];
  }
}
