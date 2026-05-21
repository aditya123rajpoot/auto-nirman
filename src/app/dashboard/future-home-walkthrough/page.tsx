import RealisticRoomTour from '@/components/tour/RealisticRoomTour';

function WalkthroughBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(3,7,18,0.92)_42%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(125,211,252,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.65)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute right-[-120px] top-20 h-[520px] w-[520px] rounded-full border border-cyan-200/10 bg-cyan-200/[0.025]" />
      <div className="absolute bottom-[-160px] left-[-90px] h-[420px] w-[420px] rounded-full bg-amber-300/[0.045] blur-3xl" />
      <div className="absolute left-1/2 top-24 h-72 w-[520px] -translate-x-1/2 rotate-[-9deg] border border-white/10 bg-white/[0.015]">
        <div className="absolute left-10 top-10 h-20 w-40 border border-cyan-200/10" />
        <div className="absolute bottom-12 right-14 h-24 w-56 border border-cyan-200/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
      </div>
    </div>
  );
}

export default function FutureHomeWalkthroughPage() {
  return (
    <main className="relative min-h-screen pt-20 text-white">
      <WalkthroughBackdrop />
      <RealisticRoomTour />
    </main>
  );
}
