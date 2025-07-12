'use client';

export default function DotTyping() {
  return (
    <span className="dot-typing">
      <style jsx>{`
        .dot-typing {
          position: relative;
          width: 60px;
          text-align: left;
        }
        .dot-typing::after {
          content: '...';
          animation: dots 1s steps(3, end) infinite;
        }
        @keyframes dots {
          0% {
            content: '';
          }
          33% {
            content: '.';
          }
          66% {
            content: '..';
          }
          100% {
            content: '...';
          }
        }
      `}</style>
    </span>
  );
}
