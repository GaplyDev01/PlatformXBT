import { generateAIResponse, StreamEvent } from '../services/groq';
import { generatePerplexityResponse, PerplexityStreamEvent } from '../services/perplexity';

// Determine which AI service to use based on availability and configuration
const getPreferredAIService = (): 'perplexity' | 'groq' | 'fallback' => {
  if (import.meta.env.VITE_PERPLEXITY_API_KEY) {
    return 'perplexity';
  } else if (import.meta.env.VITE_GROQ_API_KEY) {
    return 'groq';
  } else {
    return 'fallback';
  }
};

export const generateEnhancedAIResponse = async (message: string): Promise<string> => {
  try {
    const preferredService = getPreferredAIService();
    console.log(`Using AI service: ${preferredService}`);

    // If no API keys are available, use fallback response
    if (preferredService === 'fallback') {
      return generateFallbackResponse(message);
    }

    // Define comprehensive market data tools
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_market_data',
          description: 'Get current market data for a cryptocurrency',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The cryptocurrency symbol (e.g., BTC, ETH)'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['price', 'volume', 'market_cap', 'change_24h', 'total_supply', 'circulating_supply']
                },
                description: 'The metrics to retrieve'
              }
            },
            required: ['symbol']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_historical_data',
          description: 'Get historical price and volume data',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The cryptocurrency symbol'
              },
              days: {
                type: 'number',
                description: 'Number of days of historical data'
              },
              interval: {
                type: 'string',
                enum: ['daily', 'hourly'],
                description: 'Data interval'
              }
            },
            required: ['symbol', 'days']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_technical_indicators',
          description: 'Get technical indicators for a cryptocurrency',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The cryptocurrency symbol'
              },
              indicators: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['RSI', 'MACD', 'MA', 'BB', 'Volume', 'OBV']
                },
                description: 'The technical indicators to retrieve'
              },
              timeframe: {
                type: 'string',
                enum: ['1h', '4h', '1d', '1w'],
                description: 'Timeframe for indicators'
              }
            },
            required: ['symbol']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_exchange_data',
          description: 'Get exchange-specific data',
          parameters: {
            type: 'object',
            properties: {
              exchange_id: {
                type: 'string',
                description: 'The exchange ID'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['volume', 'tickers', 'pairs', 'orderbook']
                }
              }
            },
            required: ['exchange_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_global_data',
          description: 'Get global market data',
          parameters: {
            type: 'object',
            properties: {
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['market_cap', 'volume', 'dominance', 'defi']
                }
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_token_info',
          description: 'Get detailed token information',
          parameters: {
            type: 'object',
            properties: {
              token_id: {
                type: 'string',
                description: 'The token ID or contract address'
              },
              platform: {
                type: 'string',
                enum: ['ethereum', 'solana', 'binance-smart-chain', 'polygon'],
                description: 'The blockchain platform'
              },
              include: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['market_data', 'community_data', 'developer_data', 'tickers']
                }
              }
            },
            required: ['token_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_nft_data',
          description: 'Get NFT collection data',
          parameters: {
            type: 'object',
            properties: {
              collection_id: {
                type: 'string',
                description: 'The NFT collection ID'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['floor_price', 'market_cap', 'volume', 'sales']
                }
              }
            },
            required: ['collection_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_defi_data',
          description: 'Get DeFi protocol data',
          parameters: {
            type: 'object',
            properties: {
              protocol_id: {
                type: 'string',
                description: 'The DeFi protocol ID'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['tvl', 'volume', 'apy', 'users']
                }
              }
            },
            required: ['protocol_id']
          }
        }
      }
    ];

    try {
      if (preferredService === 'perplexity') {
        return await generatePerplexityResponse(message, {
          systemPrompt: `You are TradesXBT AI, an expert cryptocurrency market analyst. Provide detailed, actionable market analysis with clear trading signals.`,
          temperature: 0.6
        });
      } else {
        return await generateAIResponse(message, {
          tools,
          model: 'deepseek-r1-distill-llama-70b',
          temperature: 0.6,
          max_completion_tokens: 4096,
          top_p: 0.95,
          stream: false
        });
      }
    } catch (error) {
      console.error("Error with AI response:", error);
      return generateFallbackResponse(message);
    }
  } catch (error) {
    console.error('Error generating enhanced AI response:', error);
    return generateFallbackResponse(message);
  }
};

// Generate a fallback response when API services are unavailable
const generateFallbackResponse = (message: string): string => {
  return `I don't have access to real-time data at the moment, but here's some general guidance on your query: "${message}"

Based on general cryptocurrency principles:

1. Market Overview: Cryptocurrency markets are highly volatile and influenced by various factors including regulatory news, technological developments, and market sentiment.

2. Technical Analysis: Without current data, I can't provide specific technical analysis. Generally, traders look at moving averages, RSI, MACD, and support/resistance levels.

3. Trading Signal: Without real-time data, I cannot provide a specific trading signal. Always do your own research before making trading decisions.

4. Risk Assessment: Cryptocurrency trading carries significant risk. Never invest more than you can afford to lose.

5. Action Items:
   - Research the asset thoroughly before investing
   - Set strict stop-loss levels
   - Diversify your portfolio
   - Stay updated with reliable news sources

Would you like me to explain any of these concepts in more detail?`;
};

export const generateStreamingResponse = async (
  message: string,
  onStream: (text: string) => void
): Promise<string> => {
  try {
    let responseText = '';
    
    const handleStreamEvent = (event: StreamEvent) => {
      switch (event.type) {
        case 'delta':
          if (event.data) {
            responseText += event.data;
            onStream(event.data);
          }
          break;
        case 'error':
          const errorMessage = event.error || 'An error occurred while processing your request.';
          const fallbackResponse = `\n\nI apologize, but I encountered an error: ${errorMessage}\n\nHere's what I can tell you based on my general knowledge:\n\n1. Always verify information from multiple sources\n2. Consider market conditions and risk factors\n3. Stay updated with reliable news sources\n4. Consider consulting with financial professionals\n\nWould you like to know more about any of these topics?`;
          onStream(fallbackResponse);
          responseText += fallbackResponse;
          break;
      }
    };

    const response = await generateAIResponse(message, { 
      stream: true, 
      onStream: handleStreamEvent,
      model: 'deepseek-r1-distill-llama-70b',
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95
    });

    return response;
  } catch (error) {
    console.error('Error generating streaming response:', error);
    const errorMessage = 'I apologize, but I encountered an error while processing your request. Here\'s what I can tell you based on general knowledge...';
    onStream(errorMessage);
    return errorMessage;
  }
};

export const testAIChat = async (): Promise<boolean> => {
  try {
    const testMessage = "Test message";
    let received = false;
    
    await generateAIResponse(testMessage, {
      stream: true,
      onStream: () => { received = true; },
      model: 'deepseek-r1-distill-llama-70b',
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95
    });
    
    return received;
  } catch (error) {
    console.error('AI chat test failed:', error);
    return false;
  }
};