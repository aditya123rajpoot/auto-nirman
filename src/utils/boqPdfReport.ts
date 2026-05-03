type BOQFinding = {
  severity: string;
  headline: string;
  module: string;
  exposureCr: string | number;
  description: string;
  recommendation: string;
};

type BOQModuleScore = {
  module: string;
  score: string | number;
  weight: string;
  items: string | number;
};

type BOQReportResult = {
  projectName: string;
  city: string;
  projectType: string;
  projectValueCr: string | number;
  riskLevel: string;
  riskScore: string | number;
  confidenceScore: string | number;
  benchmarkSource: string;
  totalLeakageCr: string | number;
  leakagePct: string | number;
  itemsFlagged: string | number;
  lineItemsAnalyzed: string | number;
  executiveSummary: string;
  findings: BOQFinding[];
  moduleScores: BOQModuleScore[];
};

const cleanPdfText = (value: unknown) =>
  String(value ?? '')
    .replace(/â‚¹/g, 'Rs.')
    .replace(/[₹]/g, 'Rs.')
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapePdfText = (value: string) =>
  cleanPdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapPdfLine = (text: string, maxLength = 88) => {
  const words = cleanPdfText(text).split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
};

export const downloadBoqPdfReport = (result: BOQReportResult) => {
  const reportLines = [
    'Auto Nirman - BOQ Analysis Report',
    `Project: ${result.projectName}`,
    `Location: ${result.city}`,
    `Project Type: ${result.projectType}`,
    `Project Value: Rs.${result.projectValueCr} Crore`,
    '',
    `Risk Level: ${result.riskLevel}`,
    `Risk Score: ${result.riskScore}/100`,
    `Confidence: ${result.confidenceScore}%`,
    `Benchmark: ${result.benchmarkSource}`,
    '',
    `Total Leakage: Rs.${result.totalLeakageCr} Cr`,
    `Leakage: ${result.leakagePct}%`,
    `Items Flagged: ${result.itemsFlagged}`,
    `Items Analysed: ${result.lineItemsAnalyzed}`,
    '',
    'Executive Summary',
    ...wrapPdfLine(result.executiveSummary),
    '',
    'Key Findings',
    ...result.findings.flatMap((finding, index) => [
      `${index + 1}. [${finding.severity}] ${finding.headline}`,
      ...wrapPdfLine(`Module: ${finding.module}`),
      ...wrapPdfLine(`Exposure: Rs.${finding.exposureCr} Cr`),
      ...wrapPdfLine(`Description: ${finding.description}`),
      ...wrapPdfLine(`Recommendation: ${finding.recommendation}`),
      '',
    ]),
    'Module Scores',
    ...result.moduleScores.map((module) => `${module.module}: ${module.score}/100, Weight ${module.weight}, Items ${module.items}`),
  ];

  const pageHeight = 792;
  const margin = 54;
  const lineHeight = 15;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];

  for (let i = 0; i < reportLines.length; i += maxLinesPerPage) {
    pages.push(reportLines.slice(i, i + maxLinesPerPage));
  }

  const objects: string[] = [''];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const content = [
      'BT',
      '/F1 11 Tf',
      '54 738 Td',
      ...pageLines.map((line, lineIndex) => `${lineIndex === 0 ? '' : '0 -15 Td '}(${escapePdfText(line)}) Tj`),
      'ET',
    ].join('\n');

    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `${cleanPdfText(result.projectName).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'boq-analysis'}-report.pdf`;
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};