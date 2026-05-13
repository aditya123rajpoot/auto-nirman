import Map2DGenerator from '@/components/Map2DGenerator';

function MapBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.36),rgba(2,6,23,0.84)_44%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.075] bg-[linear-gradient(rgba(125,211,252,0.66)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.66)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute right-20 top-40 h-72 w-[460px] rotate-[-7deg] border border-cyan-200/10 bg-cyan-200/[0.02]">
        <div className="absolute left-10 top-10 h-28 w-40 border border-cyan-200/10" />
        <div className="absolute bottom-12 right-14 h-24 w-56 border border-cyan-200/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-200/10" />
      </div>
      <div className="absolute bottom-[-180px] left-[-120px] h-[480px] w-[480px] rounded-full bg-cyan-400/[0.045] blur-3xl" />
    </div>
  );
}

export default function Map2DGeneratorPage() {
  return (
    <main className="relative min-h-screen pt-20 text-white">
      <MapBackdrop />
      <Map2DGenerator />
    </main>
  );
}
