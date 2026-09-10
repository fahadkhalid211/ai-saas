import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';

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

async function testMovUpload() {
  const dbPath = path.join(process.cwd(), '.data', 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const apiKey = dbData.assistants[0].apiKeyEncrypted;

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const buffer = createSineWaveWav(1.5, 16000);

  // Test 1: Uploading with literal .mov extension (which failed previously)
  console.log('Test 1: Uploading with literal "video.MOV"...');
  try {
    const file1 = await toFile(buffer, 'video.MOV', { type: 'video/quicktime' });
    await client.audio.transcriptions.create({
      file: file1,
      model: 'whisper-large-v3',
    });
    console.log('Test 1 succeeded (unexpected)');
  } catch (err: any) {
    console.log('Test 1 failed as expected with message:', err?.message || err);
  }

  // Test 2: Uploading mapped to virtual .mp4 extension
  console.log('\nTest 2: Uploading mapped to "video.mp4" with type "video/mp4"...');
  try {
    const file2 = await toFile(buffer, 'video.mp4', { type: 'video/mp4' });
    const resp2 = await client.audio.transcriptions.create({
      file: file2,
      model: 'whisper-large-v3',
    });
    console.log('Test 2 succeeded! Transcribed text:', resp2.text);
  } catch (err: any) {
    console.log('Test 2 failed:', err?.message || err);
  }
}

testMovUpload().catch(console.error);
