import { describe, it, expect } from 'vitest';
import {
  isVideoFilename,
  isAudioFilename,
  isMediaFilename,
  audioBufferToWavBlob,
} from './audioExtractor';
import { detectAudioBufferFormat } from '../rag/transcriber';

describe('audioExtractor', () => {
  it('correctly identifies video and audio filenames', () => {
    expect(isVideoFilename('presentation.mp4')).toBe(true);
    expect(isVideoFilename('recording.mov')).toBe(true);
    expect(isVideoFilename('screen.webm')).toBe(true);
    expect(isVideoFilename('document.pdf')).toBe(false);
    expect(isVideoFilename('pricing.csv')).toBe(false);

    expect(isAudioFilename('voice.mp3')).toBe(true);
    expect(isAudioFilename('audio.wav')).toBe(true);
    expect(isAudioFilename('speech.m4a')).toBe(true);
    expect(isAudioFilename('recording.mov')).toBe(false);

    expect(isMediaFilename('clip.mp4')).toBe(true);
    expect(isMediaFilename('memo.m4a')).toBe(true);
    expect(isMediaFilename('notes.txt')).toBe(false);
  });

  it('detects magic bytes format from audio buffer headers', () => {
    // Construct fake WAV header
    const wavHeader = Buffer.alloc(44);
    wavHeader.write('RIFF', 0, 'ascii');
    wavHeader.writeUInt32LE(36, 4);
    wavHeader.write('WAVE', 8, 'ascii');
    wavHeader.write('fmt ', 12, 'ascii');

    const detected = detectAudioBufferFormat(wavHeader);
    expect(detected).not.toBeNull();
    expect(detected?.ext).toBe('wav');
    expect(detected?.mime).toBe('audio/wav');

    // Construct fake MP3 header with ID3
    const id3Header = Buffer.alloc(20);
    id3Header.write('ID3', 0, 'ascii');
    const detectedMp3 = detectAudioBufferFormat(id3Header);
    expect(detectedMp3?.ext).toBe('mp3');
    expect(detectedMp3?.mime).toBe('audio/mpeg');

    // Unknown file
    const unknown = Buffer.from('just some text content');
    expect(detectAudioBufferFormat(unknown)).toBeNull();
  });

  it('encodes AudioBuffer into valid 16-bit PCM mono WAV blob', () => {
    const sampleRate = 44100;
    const length = 44100; // 1 second
    const channelData = new Float32Array(length);

    // Generate a 440 Hz sine wave
    for (let i = 0; i < length; i++) {
      channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.8;
    }

    const mockAudioBuffer = {
      numberOfChannels: 1,
      sampleRate,
      length,
      duration: 1.0,
      getChannelData: () => channelData,
      copyFromChannel: () => {},
      copyToChannel: () => {},
    } as unknown as AudioBuffer;

    const blob = audioBufferToWavBlob(mockAudioBuffer, 16000);
    expect(blob).toBeDefined();
    expect(blob.type).toBe('audio/wav');
    // 16000 samples * 2 bytes = 32000 bytes + 44 bytes header = 32044 bytes
    expect(blob.size).toBe(32044);
  });

  it('detects silence and throws a clear error', () => {
    const sampleRate = 16000;
    const length = 16000;
    const silentData = new Float32Array(length); // All zeros

    const mockAudioBuffer = {
      numberOfChannels: 1,
      sampleRate,
      length,
      duration: 1.0,
      getChannelData: () => silentData,
      copyFromChannel: () => {},
      copyToChannel: () => {},
    } as unknown as AudioBuffer;

    expect(() => audioBufferToWavBlob(mockAudioBuffer, 16000)).toThrow(
      /silence or inaudible background noise/i
    );
  });
});
