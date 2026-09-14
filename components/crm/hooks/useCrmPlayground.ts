'use client';

import { useState, useRef } from 'react';

interface UseCrmPlaygroundOptions {
  activeAssistant: any;
}

export function useCrmPlayground({ activeAssistant }: UseCrmPlaygroundOptions) {
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; citations?: any[]; isWebSearch?: boolean }[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [playgroundAttachment, setPlaygroundAttachment] = useState<{
    name: string;
    type: string;
    size: number;
    data: string;
  } | null>(null);
  const playgroundFileInputRef = useRef<HTMLInputElement>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const handlePlaygroundVoiceToggle = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice dictation is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setIsVoiceListening(false);
    }
  };

  async function handleSendMessage(textToSend?: string) {
    const text = textToSend || inputQuery;
    if (!text.trim() || isStreaming || !activeAssistant) return;

    const newMsgs = [...chatMessages, { role: 'user', content: text.trim() }];
    setChatMessages(newMsgs);
    setInputQuery('');
    setIsStreaming(true);
    setStreamingStatus(null);

    const tempIndex = newMsgs.length;
    setChatMessages([...newMsgs, { role: 'assistant', content: '', citations: [] }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get chat response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamed = '';
      let citations: any[] = [];
      let isWebSearch = false;

      if (reader) {
        let updateTimer: any = null;
        const flushUpdate = () => {
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[tempIndex] = {
              role: 'assistant',
              content: streamed,
              citations,
              isWebSearch,
            };
            return updated;
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'status') {
                  if (data.status === 'searching_web') {
                    setStreamingStatus(data.message || 'Searching the web...');
                  } else if (data.status === 'web_results_found') {
                    setStreamingStatus('Web sources found, formulating answer...');
                  }
                } else if (data.type === 'citations') {
                  citations = data.citations || [];
                  isWebSearch = Boolean(data.isWebSearch);
                  setActiveCitations(isWebSearch ? citations : []);
                } else if (data.type === 'token') {
                  setStreamingStatus(null);
                  streamed += data.token;
                  if (!updateTimer) {
                    updateTimer = setTimeout(() => {
                      updateTimer = null;
                      flushUpdate();
                    }, 35);
                  }
                }
              } catch {
                // partial parse
              }
            }
          }
        }
        if (updateTimer) {
          clearTimeout(updateTimer);
        }
        flushUpdate();
      }
    } catch (err) {
      console.error('Playground chat error:', err);
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[tempIndex] = {
          role: 'assistant',
          content: 'Error: Unable to connect to the AI service. Please verify your provider settings.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  }

  return {
    chatMessages,
    setChatMessages,
    inputQuery,
    setInputQuery,
    isStreaming,
    streamingStatus,
    activeCitations,
    chatEndRef,
    playgroundAttachment,
    setPlaygroundAttachment,
    playgroundFileInputRef,
    isVoiceListening,
    handlePlaygroundVoiceToggle,
    handleSendMessage,
  };
}
