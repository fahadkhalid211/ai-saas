import { diagnoseKnowledgeFailure } from '../lib/rag/diagnostics';

function runDiagnosticsTests() {
  console.log('=== Testing Knowledge Error Diagnostics & Action Guidance ===\n');

  // Case 1: .MOV rejection from Groq Whisper
  const diagMov = diagnoseKnowledgeFailure({
    filename: 'le-feng-video.MOV',
    type: 'video',
    errorMessage: '400 file must be one of the following types: [flac mp3 mp4 mpeg mpga m4a ogg opus wav webm]',
    fileSizeBytes: 15659621,
  });
  console.log('Case 1 (.MOV Whitelist Error):');
  console.log('Reason:', diagMov.reason);
  console.log('What To Do Next:', diagMov.whatToDoNext);
  if (!diagMov.reason.includes('demux the container format') && !diagMov.reason.includes('le-feng-video.MOV')) {
    throw new Error('Case 1 failed');
  }

  // Case 2: File size > 25MB
  const diagSize = diagnoseKnowledgeFailure({
    filename: 'presentation_long.mp4',
    type: 'video',
    errorMessage: 'File size exceeds 25MB limit',
    fileSizeBytes: 45 * 1024 * 1024,
  });
  console.log('\nCase 2 (45MB Video):');
  console.log('Reason:', diagSize.reason);
  console.log('What To Do Next:', diagSize.whatToDoNext);
  if (!diagSize.reason.includes('45.0 MB') || !diagSize.whatToDoNext.includes('MP3 or M4A')) {
    throw new Error('Case 2 failed');
  }

  // Case 3: Scanned PDF
  const diagPdf = diagnoseKnowledgeFailure({
    filename: 'scanned_contract.pdf',
    type: 'pdf',
    errorMessage: 'Failed to parse PDF file: No readable text found in this PDF. It may be an image-only scanned document.',
  });
  console.log('\nCase 3 (Scanned PDF):');
  console.log('Reason:', diagPdf.reason);
  console.log('What To Do Next:', diagPdf.whatToDoNext);
  if (!diagPdf.whatToDoNext.includes('OCR')) {
    throw new Error('Case 3 failed');
  }

  // Case 4: No speech in audio
  const diagAudio = diagnoseKnowledgeFailure({
    filename: 'silent_video.mp4',
    type: 'video',
    errorMessage: 'Transcription completed but no speech or text was detected in the file.',
  });
  console.log('\nCase 4 (Silent Recording):');
  console.log('Reason:', diagAudio.reason);
  console.log('What To Do Next:', diagAudio.whatToDoNext);
  if (!diagAudio.reason.includes('no audible spoken speech')) {
    throw new Error('Case 4 failed');
  }

  console.log('\n🎉 ALL DIAGNOSTIC TESTS PASSED SUCCESSFULLY!');
}

runDiagnosticsTests();
