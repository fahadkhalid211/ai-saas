import { describe, it, expect, vi } from 'vitest';
import { consumeChatStream } from './stream';

describe('Chat Stream Consumer', () => {
  function createReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
  }

  it('should stream tokens and accumulate total message', async () => {
    const stream = createReadableStream([
      'data: {"type":"token","token":"Hello"}\n\n',
      'data: {"type":"token","token":" world"}\n\n',
      'data: {"type":"token","token":"!"}\n\n',
      'data: [DONE]\n\n',
    ]);

    const onToken = vi.fn();
    const result = await consumeChatStream(stream, { onToken });

    expect(result).toBe('Hello world!');
    expect(onToken).toHaveBeenCalledTimes(3);
    expect(onToken).toHaveBeenLastCalledWith('Hello world!', '!');
  });

  it('should handle status and citation events', async () => {
    const stream = createReadableStream([
      'data: {"type":"status","message":"Searching knowledge..."}\n\n',
      'data: {"type":"citations","citations":[{"title":"Doc 1","text":"Sample"}],"isWebSearch":false}\n\n',
      'data: {"type":"token","token":"Answer"}\n\n',
      'data: {"type":"done","conversationId":"conv_123","conversationToken":"tok_abc"}\n\n',
    ]);

    const onStatus = vi.fn();
    const onCitations = vi.fn();
    const onDone = vi.fn();
    const onToken = vi.fn();

    const result = await consumeChatStream(stream, {
      onToken,
      onStatus,
      onCitations,
      onDone,
    });

    expect(result).toBe('Answer');
    expect(onStatus).toHaveBeenCalledWith('Searching knowledge...');
    expect(onCitations).toHaveBeenCalledWith([{ title: 'Doc 1', text: 'Sample' }], false);
    expect(onDone).toHaveBeenCalledWith('conv_123', 'tok_abc');
  });

  it('should handle split chunks across stream buffer boundaries', async () => {
    const stream = createReadableStream([
      'data: {"type":"token",',
      '"token":"Split ',
      'test"}\n\ndata: {"type":"done"}\n\n',
    ]);

    const onToken = vi.fn();
    const result = await consumeChatStream(stream, { onToken });

    expect(result).toBe('Split test');
    expect(onToken).toHaveBeenCalledWith('Split test', 'Split test');
  });
});
