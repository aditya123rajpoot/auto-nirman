import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type DetectBoundaryRequest = {
  imageData: number[];
  imageWidth: number;
  imageHeight: number;
  plotWidth: number;
  plotLength: number;
};

async function runOpenCVWorker(body: DetectBoundaryRequest) {
  const payloadDir = path.join(os.tmpdir(), 'auto-nirman-opencv');
  await mkdir(payloadDir, { recursive: true });
  const payloadPath = path.join(payloadDir, `${randomUUID()}.json`);
  await writeFile(payloadPath, JSON.stringify(body), 'utf8');

  return new Promise<{ status: number; payload: unknown }>(resolve => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'detect-boundary-opencv.cjs');
    const opencvPath = path.join(process.cwd(), 'node_modules', '@techstark', 'opencv-js', 'dist', 'opencv.js');
    const child = spawn(process.execPath, [scriptPath, payloadPath], {
      cwd: process.cwd(),
      env: { ...process.env, OPENCV_JS_PATH: opencvPath },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      void unlink(payloadPath).catch(() => undefined);
      resolve({ status: 504, payload: { success: false, error: 'OpenCV boundary detection timed out.' } });
    }, 15000);

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('error', error => {
      clearTimeout(timer);
      void unlink(payloadPath).catch(() => undefined);
      resolve({ status: 500, payload: { success: false, error: error.message } });
    });
    child.on('close', code => {
      clearTimeout(timer);
      void unlink(payloadPath).catch(() => undefined);
      try {
        const payload = JSON.parse(stdout);
        resolve({ status: code === 0 ? 200 : 422, payload });
      } catch {
        resolve({
          status: 500,
          payload: { success: false, error: stderr || 'OpenCV worker returned an unreadable response.' },
        });
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DetectBoundaryRequest;

    if (!body.imageData?.length || !body.imageWidth || !body.imageHeight) {
      return NextResponse.json({ success: false, error: 'Image pixel data is required.' }, { status: 400 });
    }

    if (!Number.isFinite(body.plotWidth) || !Number.isFinite(body.plotLength)) {
      return NextResponse.json({ success: false, error: 'Plot dimensions are required.' }, { status: 400 });
    }

    const result = await runOpenCVWorker(body);
    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'OpenCV boundary detection failed.' },
      { status: 500 }
    );
  }
}
