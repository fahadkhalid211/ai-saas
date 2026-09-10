import fs from 'fs';
import path from 'path';
import {
  isVideoFile,
  isAudioFile,
  isMediaFile,
  formatTimestamp,
  transcribeMedia,
  parseMediaFile,
} from '../lib/rag/transcriber';
import { parseFileOrText } from '../lib/rag/parsers';

function createSineWaveWav(durationSec = 1.0, sampleRate = 16000): Buffer {
  const numSamples = Math.floor(durationSec * sampleRate);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

async function runTests() {
  console.log('=== 1. Checking Extension Classifiers ===');
  const videoFiles = ['business_pitch.mp4', 'demo.webm', 'overview.mov', 'walkthrough.mkv'];
  for (const f of videoFiles) {
    if (!isVideoFile(f) || !isMediaFile(f)) {
      throw new Error(`Expected ${f} to be recognized as video`);
    }
    console.log(`✓ Video recognized: ${f}`);
  }

  const audioFiles = ['ceo_message.mp3', 'interview.wav', 'podcast.m4a', 'recording.flac'];
  for (const f of audioFiles) {
    if (!isAudioFile(f) || !isMediaFile(f)) {
      throw new Error(`Expected ${f} to be recognized as audio`);
    }
    console.log(`✓ Audio recognized: ${f}`);
  }

  console.log('\n=== 2. Checking Timestamp Formatting ===');
  if (formatTimestamp(15) !== '00:15') throw new Error(`formatTimestamp(15) failed: got ${formatTimestamp(15)}`);
  if (formatTimestamp(75) !== '01:15') throw new Error(`formatTimestamp(75) failed: got ${formatTimestamp(75)}`);
  if (formatTimestamp(3665) !== '01:01:05') throw new Error(`formatTimestamp(3665) failed: got ${formatTimestamp(3665)}`);
  console.log('✓ All timestamp formats verified (00:15, 01:15, 01:01:05)');

  console.log('\n=== 3. Testing Real Groq Whisper Transcription with Assistant Key ===');
  const dbPath = path.join(process.cwd(), '.data', 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const assistant = dbData.assistants[0];
  const apiKey = assistant.apiKeyEncrypted;

  const wavBuffer = createSineWaveWav(1.5, 16000);
  console.log(`Generated test WAV buffer (${wavBuffer.length} bytes). Sending to Groq Whisper...`);

  const doc = await parseFileOrText({
    filename: 'company_intro.mp4',
    type: 'mp4',
    buffer: wavBuffer,
    options: {
      apiKey,
      provider: 'groq',
    },
  });

  console.log('\n✓ parseFileOrText successfully processed company_intro.mp4:');
  console.log('Title:', doc.title);
  console.log('Type:', doc.type);
  console.log('Metadata:', doc.metadata);
  console.log('Content preview:\n', doc.content.slice(0, 300));

  console.log('\n🎉 ALL MEDIA INGESTION & TRANSCRIPTION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
