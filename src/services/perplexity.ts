export interface PerplexityStreamEvent {
  type: 'start' | 'delta' | 'done' | 'error';
  data?: string;
  error?: string;
}

interface PerplexityOptions {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
  onStream?: (event: PerplexityStreamEvent) => void;
}

export const generatePerplexityResponse = async (
  message: string,
  options: PerplexityOptions = {}
): Promise<string> => {
  const {
    model = 'sonar',
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
    stream = false,
    onStream
  } = options;

  // Mock implementation
  const mockResponse = `Here's my analysis of ${message}:\n\n1. Market Overview: The current market conditions show mixed signals.\n2. Technical Analysis: Key support and resistance levels are being tested.\n3. Recommendation: Consider a balanced approach with proper risk management.`;

  if (stream && onStream) {
    const words = mockResponse.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      onStream({
        type: 'delta',
        data: chunk
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    onStream({ type: 'done' });
    return mockResponse;
  }

  return mockResponse;
};