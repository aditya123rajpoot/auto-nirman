import Map2DResult from '@/components/Map2DResult';

function MapBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.34),rgba(2,6,23,0.82)_42%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.075] bg-[linear-gradient(rgba(125,211,252,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.65)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute right-12 top-32 h-80 w-[520px] rotate-[-8deg] border border-cyan-200/10 bg-cyan-200/[0.018]">
        <div className="absolute left-8 top-8 h-24 w-40 border border-cyan-200/10" />
        <div className="absolute bottom-10 right-10 h-28 w-52 border border-cyan-200/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-200/10" />
      </div>
      <div className="absolute bottom-12 left-8 h-44 w-72 border border-emerald-200/10 bg-emerald-200/[0.018]" />
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
