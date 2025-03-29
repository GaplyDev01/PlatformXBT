import { StreamEvent } from '../types/chat';

export class GroqAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GroqAPIError';
  }
}

interface GenerateOptions {
  stream?: boolean;
  onStream?: (event: StreamEvent) => void;
  tools?: any[];
  model?: string;
}

export const generateAIResponse = async (
  message: string,
  options: GenerateOptions = {}
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    throw new GroqAPIError('Groq API key not found', 401, 'MISSING_API_KEY');
  }

  try {
    console.log('Sending request to Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are TradesXBT AI, an expert cryptocurrency market analyst. Your role is to provide detailed, actionable market analysis with clear trading signals.

When analyzing market data, focus on:
- Current price and market cap
- Volume and liquidity
- Price trends and momentum
- Support and resistance levels
- Risk assessment

Always structure your responses with:
1. Market Overview
2. Technical Analysis
3. Trading Signal
4. Risk Assessment
5. Action Items`
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: 'deepseek-r1-distill-llama-70b',
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        stream: options.stream,
        stop: null,
        tools: options.tools
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      throw new GroqAPIError(
        `API returned ${response.status}`,
        response.status,
        'API_ERROR',
        errorText
      );
    }

    if (options.stream && options.onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            options.onStream({ type: 'done' });
            break;
          }
          
          const chunk = decoder.decode(value);
          console.log('Received chunk:', chunk);
          
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') {
              options.onStream({ type: 'done' });
              continue;
            }
            
            try {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  const content = data.choices[0].delta.content;
                  responseText += content;
                  options.onStream({
                    type: 'delta',
                    data: content
                  });
                }
              }
            } catch (error) {
              console.warn('Error parsing SSE line:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        options.onStream({
          type: 'error',
          error: error instanceof Error ? error.message : 'Stream reading error'
        });
      } finally {
        reader.releaseLock();
      }
      return responseText;
    }

    const data = await response.json();
    console.log('Groq API response:', data);
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new GroqAPIError(
      'Failed to generate AI response',
      500,
      'GROQ_ERROR',
      error
    );
  }
};

export const testAIChat = async (): Promise<boolean> => {
  try {
    const testMessage = "Test message";
    let received = false;
    
    await generateAIResponse(testMessage, {
      stream: true,
      onStream: () => { received = true; }
    });
    
    return received;
  } catch (error) {
    console.error('AI chat test failed:', error);
    return false;
  }
};