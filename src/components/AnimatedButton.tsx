'use client'

import dynamic from 'next/dynamic'
const MotionButton = dynamic(
  () =>
    import('framer-motion').then((mod) => mod.motion.button as typeof mod.motion.button),
  { ssr: false }
)

export default function AnimatedButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <MotionButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-lg"
      onClick={onClick}
    >
      {text}
    </MotionButton>
  )
}
