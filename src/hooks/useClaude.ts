import { useCallback, useRef, useState } from 'react';
import { getModel } from '../data/models';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useClaude() {
  const [streaming, setStreaming] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const chat = useCallback(async (
    messages: ChatMessage[],
    systemPrompt: string,
    modelId: string,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (msg: string) => void,
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);
    setWaiting(true);

    const model = getModel(modelId);
    const endpoint = model.provider === 'salesforce' ? '/api/sf-models/chat' : '/api/claude/chat';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt, modelId }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => 'Unknown error');
        onError(text);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) { onError(parsed.error); return; }
            if (parsed.text) {
              setWaiting(false);
              onChunk(parsed.text);
            }
          } catch {}
        }
      }
      onDone();
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        onError((err as Error)?.message ?? 'Network error');
      }
    } finally {
      setStreaming(false);
      setWaiting(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setWaiting(false);
  }, []);

  return { chat, stop, streaming, waiting };
}
