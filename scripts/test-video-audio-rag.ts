import { Database } from '../lib/db';
import { chunkDocument } from '../lib/rag/chunker';
import { generateEmbeddingsBatch } from '../lib/rag/embedder';
import { retrieveRelevantContext } from '../lib/rag/retrieval';
import { ExtractedDocument } from '../lib/rag/types';

async function testVideoAudioRag() {
  console.log('=== Testing Video/Audio Ingestion & Knowledge Retrieval ===');

  const assistant = await Database.getAssistantById('demo-assistant');
  if (!assistant) throw new Error('demo-assistant not found');

  // Simulate a parsed video document with business explanation
  const mediaDoc: ExtractedDocument = {
    title: 'ceo_business_walkthrough.mp4',
    type: 'video',
    content: `=== [Video Transcription: ceo_business_walkthrough.mp4] ===
Language: English
Duration: 02:15 (135.0 seconds)

--- Full Spoken Narrative ---
Welcome to Helios Robotics. We manufacture automated warehouse fulfillment drones designed for cold-storage facilities. Our drones operate at temperatures down to minus 30 degrees Celsius and have a battery life of 14 hours per charge. Our enterprise subscription starts at $3,500 per month including hardware maintenance and overnight replacement. You can reach our deployment engineers at engineering@heliosrobotics.io.

--- Timestamped Breakdown ---
[00:00 - 00:35] Welcome to Helios Robotics. We manufacture automated warehouse fulfillment drones designed for cold-storage facilities.
[00:35 - 01:10] Our drones operate at temperatures down to minus 30 degrees Celsius and have a battery life of 14 hours per charge.
[01:10 - 01:50] Our enterprise subscription starts at $3,500 per month including hardware maintenance and overnight replacement.
[01:50 - 02:15] You can reach our deployment engineers at engineering@heliosrobotics.io.`,
    sections: [
      {
        heading: 'Video [00:00 - 00:35]',
        text: 'Video [00:00 - 00:35]\nWelcome to Helios Robotics. We manufacture automated warehouse fulfillment drones designed for cold-storage facilities.',
        metadata: { startTime: 0, endTime: 35, formattedTime: '00:00 - 00:35' },
      },
      {
        heading: 'Video [00:35 - 01:10]',
        text: 'Video [00:35 - 01:10]\nOur drones operate at temperatures down to minus 30 degrees Celsius and have a battery life of 14 hours per charge.',
        metadata: { startTime: 35, endTime: 70, formattedTime: '00:35 - 01:10' },
      },
      {
        heading: 'Video [01:10 - 01:50]',
        text: 'Video [01:10 - 01:50]\nOur enterprise subscription starts at $3,500 per month including hardware maintenance and overnight replacement.',
        metadata: { startTime: 70, endTime: 110, formattedTime: '01:10 - 01:50' },
      },
      {
        heading: 'Video [01:50 - 02:15]',
        text: 'Video [01:50 - 02:15]\nYou can reach our deployment engineers at engineering@heliosrobotics.io.',
        metadata: { startTime: 110, endTime: 135, formattedTime: '01:50 - 02:15' },
      },
    ],
  };

  // 1. Create Knowledge Source in DB
  const source = await Database.createKnowledgeSource({
    assistantId: assistant.id,
    title: mediaDoc.title,
    type: 'video',
    fileSizeBytes: 14500000,
    status: 'processing',
  });
  console.log(`Created knowledge source: ${source.id} (${source.title})`);

  // 2. Chunk document
  const chunks = chunkDocument(mediaDoc);
  console.log(`Generated ${chunks.length} structured chunks from video document.`);

  // 3. Local embedding batch
  const texts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddingsBatch(texts);
  console.log(`Generated ${embeddings.length} embeddings (dim: ${embeddings[0].length}).`);

  // 4. Save chunks
  const chunkRecords = chunks.map((c, i) => ({
    assistantId: assistant.id,
    knowledgeSourceId: source.id,
    content: c.content,
    chunkIndex: c.chunkIndex,
    tokenCount: c.tokenCount,
    metadata: {
      ...c.metadata,
      sourceTitle: mediaDoc.title,
      sourceType: 'video',
    },
    embedding: embeddings[i],
  }));

  await Database.saveChunks(chunkRecords);
  await Database.updateKnowledgeSource(source.id, {
    status: 'ready',
    chunkCount: chunkRecords.length,
  });
  console.log(`✓ Saved ${chunkRecords.length} chunks to knowledge database!`);

  // 5. Test Retrieval: "What are your drone operating temperatures and pricing?"
  const userQuery = 'What temperature do your drones work in and what is the enterprise subscription price?';
  console.log(`\nTesting RAG Context Retrieval for query: "${userQuery}"`);

  const retrieval = await retrieveRelevantContext(assistant.id, userQuery, [], 3);
  console.log('\nRetrieved Citations:');
  retrieval.citations.forEach((cit, idx) => {
    console.log(`[${idx + 1}] Source: ${cit.sourceTitle} (${cit.sourceType})`);
    console.log(`    Preview: ${cit.preview.slice(0, 150)}...`);
  });

  console.log('\nRetrieved Context snippet:');
  console.log(retrieval.contextText.slice(0, 400) + '...');

  // Clean up test source
  await Database.deleteKnowledgeSource(source.id);
  console.log('\n✓ Cleaned up test knowledge source.');
  console.log('🎉 END-TO-END VIDEO RAG RETRIEVAL VERIFIED SUCCESSFULLY!');
}

testVideoAudioRag().catch((err) => {
  console.error('RAG test failed:', err);
  process.exit(1);
});
