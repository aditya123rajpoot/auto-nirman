import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/map2d/detect-boundary': [
      './scripts/detect-boundary-opencv.cjs',
      './node_modules/@techstark/opencv-js/**/*',
    ],
  },
};

export default nextConfig;
