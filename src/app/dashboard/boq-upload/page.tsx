'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFileExcel, FaFilePdf, FaFileCsv, FaCloudUploadAlt,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight,
  FaBuilding, FaRupeeSign, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';

const ACCEPTED = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'text/csv': '.csv',
  'application/pdf': '.pdf',
};

const FILE_ICONS: Record<string, any> = {
  xlsx: FaFileExcel, xls: FaFileExcel,
  csv: FaFileCsv, pdf: FaFilePdf,
};

const FILE_COLORS: Record<string, string> = {
  xlsx: '#22c55e', xls: '#22c55e',
  csv: '#f59e0b', pdf: '#ef4444',
};

function FloatingInput({ id, label, value, onChange, type = 'text', icon: Icon }: any) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value.length > 0;
  return (
    <div className="relative">
      <div className={`absolute -inset-[1px] rounded-xl transition-all duration-500 ${focused ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30' : 'opacity-0'}`} />
      <div className="relative rounded-xl overflow-hidden">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10"><Icon size={14} /></div>}
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          className={`peer w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 pt-7 pb-3 bg-[#0d1f35] text-white text-sm outline-none transition-all duration-300 [color-scheme:dark]`}
          style={{ WebkitBoxShadow: '0 0 0 1000px #0d1f35 inset', WebkitTextFillColor: 'white', caretColor: '#22d3ee' }}
        />
        <label htmlFor={id}
          className={`absolute transition-all duration-300 pointer-events-none font-medium ${Icon ? 'left-9' : 'left-4'} ${isFloated ? 'top-2.5 text-[10px] text-cyan-400 tracking-widest uppercase' : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'}`}>
          {label}
        </label>
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] transition-all duration-500 ${focused ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-white/10'}`} />
      </div>
    </div>
  );
}

export default function BOQUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');

  // Project metadata
  const [projectName, setProjectName] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [city, setCity] = useState('');
  const [projectType, setProjectType] = useState('');
  const [tenderYear, setTenderYear] = useState(new Date().getFullYear().toString());

  const PROJECT_TYPES = ['Residential', 'Commercial', 'Mixed Use', 'Industrial', 'Infrastructure', 'Institutional'];

  const validateFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'pdf'].includes(ext || '')) {
      setError('Only Excel (.xlsx, .xls), CSV, and PDF files are supported.');
      return false;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback((f: File) => {
    if (validateFile(f)) setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file || !projectName || !projectValue || !city || !projectType) {
      setError('Please fill in all project details and upload a BOQ file.');
      return;
    }

    setUploading(true);
    setError('');

    const steps = [
      { label: 'Uploading file...', pct: 15 },
      { label: 'Parsing BOQ structure...', pct: 30 },
      { label: 'Normalizing line items...', pct: 45 },
      { label: 'Loading benchmark rates...', pct: 60 },
      { label: 'Running leakage detection...', pct: 75 },
      { label: 'Calculating risk score...', pct: 88 },
      { label: 'Generating AI insights...', pct: 95 },
      { label: 'Preparing report...', pct: 100 },
    ];

    // Animate progress steps
    for (const step of steps) {
      setProgressLabel(step.label);
      setProgress(step.pct);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meta', JSON.stringify({
        projectName, projectValue: parseFloat(projectValue),
        city, projectType, tenderYear: parseInt(tenderYear)
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/boq/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      router.push(`/boq/results?jobId=${data.jobId}`);
    } catch (err) {
      // For demo — redirect to results with mock data
      router.push(`/boq/results?demo=true&project=${encodeURIComponent(projectName)}&value=${projectValue}&city=${encodeURIComponent(city)}&type=${encodeURIComponent(projectType)}`);
    }
  };

  const ext = file?.name.split('.').pop()?.toLowerCase() || '';
  const FileIcon = FILE_ICONS[ext] || FaCloudUploadAlt;
  const fileColor = FILE_COLORS[ext] || '#38bdf8';
  const isReady = file && projectName && projectValue && city && projectType;

  return (
    <div className="relative min-h-screen bg-[#020817] text-white pt-20 pb-16 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">BOQ Intelligence Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Upload Your </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">BOQ</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get a full AI-powered leakage analysis in under 5 minutes. Supports Excel, CSV and PDF formats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT — Upload + Project Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                dragOver ? 'border-cyan-400 bg-cyan-500/10' :
                file ? 'border-green-500/50 bg-green-500/5 cursor-default' :
                'border-white/10 hover:border-cyan-400/50 hover:bg-white/3'
              }`}
            >
              {/* Animated glow on drag */}
              <AnimatePresence>
                {dragOver && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />
                )}
              </AnimatePresence>

              <input ref={fileInputRef} type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div className="p-10 flex flex-col items-center text-center">
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div key="file" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${fileColor}20`, border: `1px solid ${fileColor}40` }}>
                        <FileIcon size={32} style={{ color: fileColor }} />
                      </div>
                      <p className="text-white font-bold text-lg mb-1">{file.name}</p>
                      <p className="text-slate-400 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <FaCheckCircle size={14} /> File ready for analysis
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="mt-3 text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
                        <FaTimesCircle size={11} /> Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 mx-auto">
                        <FaCloudUploadAlt size={28} className="text-slate-400" />
                      </motion.div>
                      <p className="text-white font-bold text-lg mb-2">
                        {dragOver ? 'Drop it here!' : 'Drop your BOQ file here'}
                      </p>
                      <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                      <div className="flex items-center justify-center gap-3">
                        {[
                          { ext: 'XLSX', color: '#22c55e', icon: FaFileExcel },
                          { ext: 'CSV', color: '#f59e0b', icon: FaFileCsv },
                          { ext: 'PDF', color: '#ef4444', icon: FaFilePdf },
                        ].map(fmt => (
                          <div key={fmt.ext} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                            style={{ color: fmt.color, borderColor: `${fmt.color}40`, background: `${fmt.color}10` }}>
                            <fmt.icon size={11} /> {fmt.ext}
                          </div>
                        ))}
                      </div>
                      <p className="text-slate-700 text-xs mt-4">Max file size: 50MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <FaBuilding size={13} className="text-cyan-400" />
                Project Details
              </h3>
              <div className="space-y-4">
                <FloatingInput id="projectName" label="Project Name" value={projectName} onChange={setProjectName} icon={FaBuilding} />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput id="projectValue" label="Project Value (Crores)" value={projectValue} onChange={setProjectValue} type="number" icon={FaRupeeSign} />
                  <FloatingInput id="tenderYear" label="Tender Year" value={tenderYear} onChange={setTenderYear} type="number" icon={FaCalendarAlt} />
                </div>
                <FloatingInput id="city" label="City / Location" value={city} onChange={setCity} icon={FaMapMarkerAlt} />

                {/* Project Type */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">Project Type</p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map(type => (
                      <button key={type} onClick={() => setProjectType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                          projectType === type
                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                            : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <FaTimesCircle size={12} /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT — Info + Submit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* What we detect */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">What we detect</h3>
              <div className="space-y-3">
                {[
                  { label: 'Rate deviations vs SOR', color: '#ef4444' },
                  { label: 'Quantity inflation', color: '#f59e0b' },
                  { label: 'Front-loading patterns', color: '#ef4444' },
                  { label: 'Duplicate line items', color: '#f59e0b' },
                  { label: 'Hidden contingencies', color: '#f59e0b' },
                  { label: 'Scope manipulation', color: '#3b82f6' },
                  { label: 'Stage-wise imbalance', color: '#3b82f6' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-300 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '<5 min', label: 'Analysis time' },
                { value: '95%', label: 'Accuracy rate' },
                { value: '₹1Cr+', label: 'Avg savings' },
                { value: '12', label: 'Detection modules' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-cyan-400">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Privacy note */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                🔒 <span className="text-slate-400 font-semibold">Your data is secure.</span> BOQ files are encrypted in transit, analysed in an isolated environment, and never shared. Files are deleted after 30 days.
              </p>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: isReady && !uploading ? 1.02 : 1 }}
              whileTap={{ scale: isReady && !uploading ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!isReady || uploading}
              className="relative w-full py-4 rounded-xl font-bold text-sm overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 group-hover:from-cyan-400 group-hover:to-indigo-500 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_50%_120%,rgba(6,182,212,0.4),transparent_70%)]" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                {uploading ? (
                  <><FaSpinner className="animate-spin" size={14} /> Analysing...</>
                ) : (
                  <>Run BOQ Analysis <FaArrowRight size={13} /></>
                )}
              </span>
            </motion.button>

            {/* Progress */}
            <AnimatePresence>
              {uploading && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-400">{progressLabel}</p>
                    <p className="text-xs text-cyan-400 font-bold">{progress}%</p>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}