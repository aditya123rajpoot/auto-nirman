import Map2DResult from '@/components/Map2DResult';

function MapBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.34),rgba(2,6,23,0.82)_42%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.075] bg-[linear-gradient(rgba(125,211,252,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.65)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute right-[-90px] top-24 h-[560px] w-[560px] rounded-full border border-cyan-200/10" />
      <div className="absolute bottom-[-180px] left-[-120px] h-[480px] w-[480px] rounded-full bg-emerald-400/[0.045] blur-3xl" />
    </div>
  );
}

export default function Map2DResultPage() {
  return (
    <main className="relative min-h-screen pt-20 text-white">
      <MapBackdrop />
      <Map2DResult />
    </main>
  );
}
