import axios from 'axios';
import { logger } from '../utils/logger.js';

const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// Get API key dynamically when needed (not at module load time)
function getApiKey(): string {
  const apiKey = process.env.BAILIAN_API_KEY;
  if (!apiKey) {
    throw new Error('BAILIAN_API_KEY is not configured');
  }
  return apiKey;
}

export interface BailianRequest {
  model: string;
  input: {
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
  parameters?: {
    temperature?: number;
    max_tokens?: number;
  };
}

export interface BailianResponse {
  output: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
  request_id: string;
}

export async function callBailianAPI(
  prompt: string,
  model: string = 'deepseek-v3'
): Promise<string> {
  const apiKey = getApiKey();

  const requestData: BailianRequest = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
    parameters: {
      temperature: 0.7,
      max_tokens: 4000, // Increased for script generation (3 scripts need more tokens)
    },
  };

  try {
    logger.info('Calling Alibaba Cloud Bailian API', {
      model,
      promptLength: prompt.length,
    });

    const response = await axios.post<BailianResponse>(
      BAILIAN_API_URL,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 90000, // 90 seconds timeout (increased for script generation)
      }
    );

    const content = response.data.output.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from API');
    }

    logger.info('Bailian API call successful', {
      requestId: response.data.request_id,
      contentLength: content.length,
    });

    return content;
  } catch (error: any) {
    logger.error('Bailian API call failed', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('API请求超时，请稍后重试');
    }

    if (error.response?.status === 401) {
      throw new Error('API密钥无效，请检查配置');
    }

    if (error.response?.status === 429) {
      throw new Error('API调用频率过高，请稍后重试');
    }

    throw new Error(error.response?.data?.message || 'AI服务暂时不可用，请稍后重试');
  }
}

