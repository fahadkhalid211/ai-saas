// Client-side video to speech audio extractor
// Uses the browser Web Audio API to strip heavy visual frames and convert video
// to compact 16kHz mono WAV audio, remaining well under the 4.5MB serverless limit.

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus', 'wma']);

export function isVideoFilename(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return VIDEO_EXTENSIONS.has(ext);
}

export function isAudioFilename(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXTENSIONS.has(ext);
}

export function isMediaFilename(filename: string): boolean {
  return isVideoFilename(filename) || isAudioFilename(filename);
}

/**
 * Encodes an AudioBuffer into a standard 16-bit PCM mono WAV Blob.
 * Downsamples to targetSampleRate (e.g. 16,000 Hz) to keep files compact.
 */
export function audioBufferToWavBlob(
  audioBuffer: AudioBuffer,
  targetSampleRate: number = 16000
): Blob {
  const numSrcChannels = audioBuffer.numberOfChannels;
  const srcSampleRate = audioBuffer.sampleRate;
  const ratio = srcSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(audioBuffer.length / ratio));

  // Extract channel data
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numSrcChannels; c++) {
    channelData.push(audioBuffer.getChannelData(c));
  }

  // Resample and mix down to mono
  const monoSamples = new Int16Array(targetLength);
  let maxAbs = 0;

  for (let i = 0; i < targetLength; i++) {
    const srcPos = i * ratio;
    const srcIndex = Math.floor(srcPos);
    const nextIndex = Math.min(srcIndex + 1, audioBuffer.length - 1);
    const frac = srcPos - srcIndex;

    let sample1 = 0;
    let sample2 = 0;
    for (let c = 0; c < numSrcChannels; c++) {
      sample1 += channelData[c][srcIndex];
      sample2 += channelData[c][nextIndex];
    }
    sample1 /= numSrcChannels;
    sample2 /= numSrcChannels;

    const interpolated = sample1 + frac * (sample2 - sample1);
    const abs = Math.abs(interpolated);
    if (abs > maxAbs) maxAbs = abs;

    // Clamp to -1.0 .. 1.0 and convert to 16-bit signed PCM
    const clamped = Math.max(-1, Math.min(1, interpolated));
    monoSamples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }

  // Detect silent recordings with no mic/speaking voice
  if (maxAbs < 0.0005) {
    throw new Error(
      'The video contains only silence or inaudible background noise with no detectable spoken voice.'
    );
  }

  // Build standard 44-byte RIFF WAVE header
  const dataSize = monoSamples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAsciiString(view, 8, 'WAVE');

  // fmt subchunk
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = mono)
  view.setUint32(24, targetSampleRate, true); // SampleRate
  view.setUint32(28, targetSampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // data subchunk
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(new Uint8Array(monoSamples.buffer, monoSamples.byteOffset, monoSamples.byteLength));

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeAsciiString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Extracts audio from a video file in the browser and returns a compact WAV File.
 * If the file is not a video or Web Audio is unavailable, returns the original file.
 */
export async function extractAudioFromVideoFile(
  file: File,
  onStatus?: (status: string) => void
): Promise<File> {
  const isVid = isVideoFilename(file.name) || (file.type && file.type.startsWith('video/'));
  if (!isVid) {
    return file;
  }

  // Check Web Audio API availability
  if (typeof window === 'undefined') {
    return file;
  }

  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    if (file.size > 4.5 * 1024 * 1024) {
      throw new Error(
        `Video file (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 4.5MB upload limit, and this browser lacks Web Audio support. Please export the audio as MP3 or M4A and upload it.`
      );
    }
    return file;
  }

  try {
    onStatus?.(`Extracting audio track from "${file.name}"...`);
    const arrayBuffer = await file.arrayBuffer();

    const audioCtx = new AudioContextClass();
    let audioBuffer: AudioBuffer;

    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } finally {
      try {
        await audioCtx.close();
      } catch {}
    }

    if (!audioBuffer || audioBuffer.numberOfChannels === 0 || audioBuffer.length === 0) {
      throw new Error('No audio track detected in this video file.');
    }

    // Determine target sample rate so file size stays under 3.8MB for serverless headroom
    const duration = audioBuffer.duration;
    let targetRate = 16000; // 16kHz standard for speech models

    const maxBytes = 3.8 * 1024 * 1024;
    if (duration * targetRate * 2 > maxBytes) {
      targetRate = Math.max(8000, Math.floor(maxBytes / (duration * 2)));
    }

    onStatus?.(`Compressing speech audio (${duration.toFixed(1)}s at ${targetRate}Hz)...`);
    const wavBlob = audioBufferToWavBlob(audioBuffer, targetRate);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const wavFile = new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' });

    console.log(
      `[AudioExtractor] Extracted audio from "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB -> ${(wavFile.size / 1024 / 1024).toFixed(2)} MB WAV)`
    );

    return wavFile;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    // If it's a silence or missing audio error, surface it directly to the user
    if (
      errMsg.includes('silence') ||
      errMsg.includes('inaudible') ||
      errMsg.includes('No audio track')
    ) {
      throw err;
    }

    console.warn(`[AudioExtractor] Browser extraction failed, checking fallback: ${errMsg}`);

    // If file is within the 4.5MB serverless boundary, fall back to direct file upload
    if (file.size <= 4.5 * 1024 * 1024) {
      return file;
    }

    throw new Error(
      `Video file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 4.5MB serverless upload limit, and the browser could not demux its audio codec (${errMsg}). Please convert or export the audio as MP3 or M4A and upload it directly.`
    );
  }
}
