'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaDownload, FaArrowLeft, FaChartLine, FaRupeeSign,
  FaShieldAlt, FaBolt, FaFileAlt, FaInfoCircle
} from 'react-icons/fa';

// â”€â”€ Mock analysis result for demo â”€â”€
function generateMockResult(projectName: string, valueStr: string, city: string, type: string) {
  const value = parseFloat(valueStr) || 50;
  const leakagePct = 0.032 + Math.random() * 0.025;
  const leakageINR = value * leakagePct;
  const score = Math.floor(55 + Math.random() * 20);

  return {
    projectName,
    city,
    projectType: type,
    projectValueCr: value,
    riskScore: score,
    riskLevel: score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW',
    totalLeakageCr: leakageINR.toFixed(2),
    leakagePct: (leakagePct * 100).toFixed(1),
    confidenceScore: 87,
    lineItemsAnalyzed: Math.floor(120 + Math.random() * 80),
    itemsFlagged: Math.floor(18 + Math.random() * 10),
    benchmarkSource: 'CPWD DSR 2023 + UP PWD SOR 2023-24',
    findings: [
      {
        id: 'F001',
        severity: 'HIGH',
        module: 'Rate Deviation',
        headline: `M25 RCC rate inflated by 34% vs CPWD benchmark`,
        description: `Submitted rate of â‚¹8,240/cum against CPWD DSR 2023 benchmark of â‚¹6,150/cum for ${city} region. Deviation of 34% exceeds the 25% threshold.`,
        exposureCr: (leakageINR * 0.38).toFixed(2),
        recommendation: 'Negotiate rate down to â‚¹6,500-7,000/cum. Request contractor to justify premium with material cost breakup.',
        confidence: 'HIGH',
      },
      {
        id: 'F002',
        severity: 'HIGH',
        module: 'Front Loading',
        headline: `Foundation section inflated to 27.8% vs expected 18-22%`,
        description: `Foundation & substructure costs represent 27.8% of total BOQ value. Industry norm for ${type} projects is 18-22%. This is consistent with front-loading behavior to extract early cash.`,
        exposureCr: (leakageINR * 0.28).toFixed(2),
        recommendation: 'Link payment milestones to verified physical completion. Restructure payment terms to cap foundation advance at 20% of total.',
        confidence: 'HIGH',
      },
      {
        id: 'F003',
        severity: 'MEDIUM',
        module: 'Quantity Inflation',
        headline: `Steel reinforcement quantity 22% above IS norm for project typology`,
        description: `BOQ shows 118 kg steel per 100 sqft BUA. IS norm for ${type} construction is 85-100 kg. Excess of ~18% represents probable quantity padding.`,
        exposureCr: (leakageINR * 0.20).toFixed(2),
        recommendation: 'Commission independent structural consultant review. Validate quantities against structural drawings before accepting.',
        confidence: 'MEDIUM',
      },
      {
        id: 'F004',
        severity: 'MEDIUM',
        module: 'Duplicate Items',
        headline: `3 probable duplicate line items detected (NLP similarity >88%)`,
        description: `Items "Providing & laying vitrified tiles 600x600" and "Supplying & fixing vitrified floor tiles 600x600 mm" appear to be the same work billed twice with combined value significant.`,
        exposureCr: (leakageINR * 0.09).toFixed(2),
        recommendation: 'Consolidate to single line item. Verify with specification document which description is correct.',
        confidence: 'HIGH',
      },
      {
        id: 'F005',
        severity: 'LOW',
        module: 'Contingency Inflation',
        headline: `Provisional sum items represent 4.8% of BOQ â€” above 3% threshold`,
        description: `Total lump-sum and provisional items account for 4.8% of BOQ value without detailed breakdown. These create discretionary spending risk post-contract.`,
        exposureCr: (leakageINR * 0.05).toFixed(2),
        recommendation: 'Require detailed breakdown for all LS items >â‚¹5 lakh. Convert provisional sums to measured items wherever possible.',
        confidence: 'MEDIUM',
      },
    ],
    moduleScores: [
      { module: 'Rate Deviation', score: 72, weight: '25%', items: 8 },
      { module: 'Quantity Inflation', score: 58, weight: '20%', items: 5 },
      { module: 'Front Loading', score: 81, weight: '20%', items: 1 },
      { module: 'Duplicate Items', score: 45, weight: '15%', items: 3 },
      { module: 'Contingency Inflation', score: 38, weight: '10%', items: 2 },
      { module: 'Scope Manipulation', score: 22, weight: '5%', items: 1 },
      { module: 'Stage Imbalance', score: 31, weight: '5%', items: 2 },
    ],
    executiveSummary: `Our AI analysis of the submitted BOQ identifies â‚¹${leakageINR.toFixed(2)} crore in probable leakage exposure across ${Math.floor(18 + Math.random() * 10)} flagged line items. The most significant concern is a systematic rate inflation pattern in structural works combined with a front-loading distribution, which is consistent with contractor behavior patterns observed in similar ${city}-region tenders. We recommend withholding contract execution until flagged items are renegotiated.`,
  };
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#dc2626', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: FaTimesCircle },
  HIGH:     { color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: FaExclamationTriangle },
  MEDIUM:   { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: FaExclamationTriangle },
  LOW:      { color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: FaInfoCircle },
};

const RISK_CONFIG = {
  CRITICAL: { color: '#dc2626', label: 'CRITICAL RISK', bg: 'from-red-900/30 to-red-900/10', border: 'border-red-500/30' },
  HIGH:     { color: '#f97316', label: 'HIGH RISK',     bg: 'from-orange-900/30 to-orange-900/10', border: 'border-orange-500/30' },
  MEDIUM:   { color: '#f59e0b', label: 'MEDIUM RISK',   bg: 'from-amber-900/30 to-amber-900/10', border: 'border-amber-500/30' },
  LOW:      { color: '#22c55e', label: 'LOW RISK',      bg: 'from-green-900/30 to-green-900/10', border: 'border-green-500/30' },
};

export default function BOQResultsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'modules'>('summary');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const cleanPdfText = (value: unknown) =>
    String(value ?? '')
      .replace(/â‚¹/g, 'Rs.')
      .replace(/[?]/g, 'Rs.')
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

  const downloadPdfReport = useCallback(() => {
    if (!result) return;

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
      ...result.findings.flatMap((finding: any, index: number) => [
        `${index + 1}. [${finding.severity}] ${finding.headline}`,
        ...wrapPdfLine(`Module: ${finding.module}`),
        ...wrapPdfLine(`Exposure: Rs.${finding.exposureCr} Cr`),
        ...wrapPdfLine(`Description: ${finding.description}`),
        ...wrapPdfLine(`Recommendation: ${finding.recommendation}`),
        '',
      ]),
      'Module Scores',
      ...result.moduleScores.map((module: any) => `${module.module}: ${module.score}/100, Weight ${module.weight}, Items ${module.items}`),
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
  }, [result]);

  useEffect(() => {
    const isDemo = params.get('demo') === 'true';
    if (isDemo) {
      setResult(generateMockResult(
        params.get('project') || 'Sample Project',
        params.get('value') || '50',
        params.get('city') || 'Lucknow',
        params.get('type') || 'Residential',
      ));
    }
    // For real: fetch `/api/boq/results?jobId=...`
  }, [params]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <FaBolt className="text-cyan-400 text-4xl" />
        </motion.div>
      </div>
    );
  }

  const riskConfig = RISK_CONFIG[result.riskLevel as keyof typeof RISK_CONFIG];

  return (
    <div className="relative min-h-screen bg-[#020817] text-white pt-20 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Back button */}
        <button onClick={() => router.push('/dashboard/boq-upload')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-6">
          <FaArrowLeft size={12} /> Back to Upload
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">BOQ Analysis Report</p>
              <h1 className="text-3xl font-black text-white">{result.projectName}</h1>
              <p className="text-slate-400 text-sm mt-1">{result.city} Â· {result.projectType} Â· â‚¹{result.projectValueCr} Crore</p>
            </div>
            <button onClick={downloadPdfReport} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
              <FaDownload size={13} className="text-cyan-400" /> Download PDF Report
            </button>
          </div>
        </motion.div>

        {/* Risk Score Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${riskConfig.bg} border ${riskConfig.border} rounded-2xl p-6 mb-6`}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Score circle */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle cx="40" cy="40" r="34" fill="none"
                    stroke={riskConfig.color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - result.riskScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{result.riskScore}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Risk Assessment</p>
                <p className="text-2xl font-black" style={{ color: riskConfig.color }}>{riskConfig.label}</p>
                <p className="text-slate-400 text-sm mt-1">Confidence: {result.confidenceScore}% Â· Based on {result.benchmarkSource}</p>
              </div>
            </div>

            {/* Key numbers */}
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Total Leakage', value: `â‚¹${result.totalLeakageCr} Cr`, color: riskConfig.color },
                { label: 'Leakage %', value: `${result.leakagePct}%`, color: '#f59e0b' },
                { label: 'Items Flagged', value: `${result.itemsFlagged}`, color: '#3b82f6' },
                { label: 'Items Analysed', value: `${result.lineItemsAnalyzed}`, color: '#22c55e' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/3 border border-white/8 rounded-2xl p-1.5">
          {[
            { key: 'summary', label: 'Executive Summary', icon: FaFileAlt },
            { key: 'findings', label: `Findings (${result.findings.length})`, icon: FaExclamationTriangle },
            { key: 'modules', label: 'Module Scores', icon: FaChartLine },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'text-slate-400 hover:text-white'
              }`}>
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <FaFileAlt size={14} className="text-cyan-400" /> Executive Summary
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.executiveSummary}</p>
              </div>

              {/* Recommendation box */}
              <div className={`bg-gradient-to-br ${riskConfig.bg} border ${riskConfig.border} rounded-2xl p-6`}>
                <h3 className="font-bold text-white mb-3">âš  Recommended Action</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH'
                    ? `Do not sign this BOQ in its current form. Request rate justification for all items flagged with HIGH severity. Minimum recommended negotiation target: â‚¹${(parseFloat(result.totalLeakageCr) * 0.7).toFixed(2)} crore reduction before contract execution.`
                    : `Proceed with caution. Address MEDIUM severity findings before finalizing contract. Estimated recoverable amount through negotiation: â‚¹${(parseFloat(result.totalLeakageCr) * 0.5).toFixed(2)} crore.`
                  }
                </p>
              </div>

              {/* Top 3 findings preview */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm">Top Critical Findings</h3>
                {result.findings.slice(0, 3).map((f: any) => {
                  const cfg = SEVERITY_CONFIG[f.severity as keyof typeof SEVERITY_CONFIG];
                  return (
                    <div key={f.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex items-start gap-3`}>
                      <cfg.icon size={14} className={`${cfg.text} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{f.headline}</p>
                        <p className={`${cfg.text} text-xs mt-0.5`}>Exposure: â‚¹{f.exposureCr} Cr Â· {f.module}</p>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setActiveTab('findings')}
                  className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View all {result.findings.length} findings â†’
                </button>
              </div>
            </motion.div>
          )}

          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <motion.div key="findings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {result.findings.map((f: any, i: number) => {
                const cfg = SEVERITY_CONFIG[f.severity as keyof typeof SEVERITY_CONFIG];
                const isExpanded = expandedFinding === f.id;
                return (
                  <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`${cfg.bg} border ${cfg.border} rounded-2xl overflow-hidden`}>
                    <button className="w-full p-5 flex items-start gap-4 text-left" onClick={() => setExpandedFinding(isExpanded ? null : f.id)}>
                      <cfg.icon size={16} className={`${cfg.text} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>{f.severity}</span>
                          <span className="text-slate-500 text-xs">{f.module}</span>
                          <span className="text-slate-500 text-xs">Â· {f.id}</span>
                        </div>
                        <p className="text-white text-sm font-semibold">{f.headline}</p>
                        <p className={`${cfg.text} text-xs mt-1`}>â‚¹{f.exposureCr} Cr exposure Â· Confidence: {f.confidence}</p>
                      </div>
                      <span className={`text-slate-600 text-lg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>â–¾</span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 overflow-hidden">
                          <div className="p-5 space-y-3">
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Technical Analysis</p>
                              <p className="text-slate-300 text-sm leading-relaxed">{f.description}</p>
                            </div>
                            <div className="bg-white/5 border border-white/8 rounded-xl p-4">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommended Action</p>
                              <p className="text-slate-300 text-sm leading-relaxed">{f.recommendation}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Module Scores Tab */}
          {activeTab === 'modules' && (
            <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
                <h3 className="font-bold text-white">Detection Module Breakdown</h3>
                {result.moduleScores.map((mod: any, i: number) => {
                  const color = mod.score >= 70 ? '#ef4444' : mod.score >= 50 ? '#f59e0b' : '#22c55e';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-sm font-medium">{mod.module}</span>
                          <span className="text-slate-600 text-xs">Weight: {mod.weight}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-xs">{mod.items} items flagged</span>
                          <span className="text-sm font-bold" style={{ color }}>{mod.score}/100</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${mod.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}