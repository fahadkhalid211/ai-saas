/**
 * Consolidated SSE chat stream reader for web, iframe embed, and CRM interfaces.
 */

export interface StreamChatEvents {
  onToken: (accumulated: string, token: string) => void;
  onStatus?: (statusText: string) => void;
  onCitations?: (citations: any[], isWebSearch?: boolean) => void;
  onTakeover?: (agentName?: string, conversationId?: string, conversationToken?: string) => void;
  onDone?: (conversationId?: string, conversationToken?: string) => void;
}

export async function consumeChatStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamChatEvents
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let streamBuffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      streamBuffer += decoder.decode(value, { stream: true });
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const jsonText = trimmed.slice(6).trim();
        if (!jsonText || jsonText === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonText);

          if (parsed.type === 'token' && parsed.token) {
            accumulated += parsed.token;
            callbacks.onToken(accumulated, parsed.token);
          } else if (parsed.type === 'status' && callbacks.onStatus) {
            callbacks.onStatus(parsed.message || parsed.status || 'Searching knowledge...');
          } else if (parsed.type === 'citations' && callbacks.onCitations) {
            callbacks.onCitations(parsed.citations || [], Boolean(parsed.isWebSearch));
          } else if (parsed.type === 'takeover_active' && callbacks.onTakeover) {
            callbacks.onTakeover(parsed.agentName, parsed.conversationId, parsed.conversationToken);
            // Also signal done so the widget starts polling for agent replies
            if (parsed.conversationId && callbacks.onDone) {
              callbacks.onDone(parsed.conversationId, parsed.conversationToken);
            }
          } else if (parsed.type === 'escalation') {
            // Human-agent handoff acknowledged — set conversationId so widget starts
            // polling for incoming agent messages
            if (parsed.conversationId && callbacks.onDone) {
              callbacks.onDone(parsed.conversationId, parsed.conversationToken);
            }
          } else if (parsed.type === 'done' && callbacks.onDone) {
            callbacks.onDone(parsed.conversationId, parsed.conversationToken);
          }
        } catch {
          // Ignore partial or malformed chunk splits
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return accumulated;
}
