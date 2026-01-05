import { callBailianAPI } from './bailian.js';
import { logger } from '../utils/logger.js';
import { getSession } from '../models/session.js';
import type { ContentPoint } from '../models/session.js';
import { randomUUID } from 'crypto';
import { sanitizeForPrompt, sanitizeUserInput, cleanAIResponse } from '../utils/text-sanitizer.js';

/**
 * Generate 3 detailed content points based on selected hook
 * Per FR-034: Generate 3 detailed content points (not just outline)
 * Per FR-040: Content points should be rich and detailed
 */
export async function generateContent(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<ContentPoint[]> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please select a hook first.');
  }

  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(session.selectedHook.text);

  const prompt = `你是一位拥有10年短视频创作经验的内容创作大师，擅长将"金句"转化为可拍摄、有画面感、有情感层次的详细内容。你深谙短视频内容的结构化创作方法，能够创作出既有深度又有传播力的内容。

**重要提示**：用户输入可能包含中文、英文或中英文混合内容。请根据输入内容的语言特点，生成相应语言风格的内容。如果输入是混合语言，请根据主要语言或内容特点选择最合适的语言风格。

## 创作背景
用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}

## 内容创作框架

请围绕这个金句，生成3个详细的内容要点，遵循经典的"引入→展开→升华"结构：

### 要点1：引入阶段（开场建立场景）
**目标**：用金句开场，快速建立场景和情绪基调
**要求**：
- 标题示例："开场引入"、"场景建立"、"第一印象"等
- 内容必须包含：
  * **具体场景描述**：时间、地点、环境、氛围（如：傍晚6点的巷子、温暖的灯光、飘散的香味）
  * **画面构图建议**：镜头语言（如：从远景到近景、特写细节）
  * **情绪锚点**：如何用金句开场，建立什么样的情绪（好奇、期待、共鸣等）
  * **动作设计**：创作者/演员的具体动作（如：推门、环顾、品尝）
- 字数要求：不少于150字，确保有足够的细节和画面感

### 要点2：展开阶段（核心内容展开）
**目标**：展开故事/知识点，保持节奏，深化内容
**要求**：
- 标题示例："核心展开"、"过程体验"、"深度探索"等
- 内容必须包含：
  * **详细过程描述**：具体发生了什么，包含哪些细节和转折
  * **情感递进**：情绪如何从开场发展到高潮（如：从好奇到惊喜，从期待到满足）
  * **互动设计**：与场景/物品/人物的互动细节
  * **记忆点强化**：如何强化金句中的记忆点（如：重复关键信息、突出反差）
- 字数要求：不少于200字，这是内容的核心部分，需要最丰富

### 要点3：升华阶段（价值总结）
**目标**：总结价值，升华主题，留下记忆点和回味空间
**要求**：
- 标题示例："价值总结"、"主题升华"、"回味空间"等
- 内容必须包含：
  * **价值提炼**：这个内容的核心价值是什么，给观众带来什么
  * **情感升华**：如何将个人体验升华为普遍情感或价值观
  * **记忆点强化**：如何再次强化金句，让观众记住
  * **行动引导**：如何自然引导观众互动（点赞、评论、关注）
- 字数要求：不少于150字，确保有深度和回味

## 专业要求

### 场景化描述标准
每个要点必须包含：
- **五感描述**：视觉、听觉、嗅觉、味觉、触觉（根据主题选择相关感官）
- **环境细节**：光线、温度、声音、氛围等
- **时间感**：明确的时间节点或时间流逝感

### 可拍摄性要求
- **镜头语言**：每个要点应该包含具体的镜头建议（特写、中景、全景、运动镜头等）
- **动作指导**：具体的动作和互动，确保可以拍摄
- **道具/场景**：明确需要的道具、场景布置

### 情感层次设计
- **情绪递进**：三个要点应该形成清晰的情绪弧线（如：好奇→探索→满足→回味）
- **情感共鸣点**：每个要点至少包含一个情感共鸣点
- **记忆点植入**：在关键位置植入记忆点，强化观众印象

## 输出要求

请以JSON格式返回，格式如下：
{
  "contentPoints": [
    {
      "title": "要点1的标题（引入阶段）",
      "content": "详细的内容描述，必须包含：具体场景描述（时间、地点、环境、氛围）、画面构图建议、情绪锚点、动作设计。不少于150字。"
    },
    {
      "title": "要点2的标题（展开阶段）",
      "content": "详细的内容描述，必须包含：详细过程描述、情感递进、互动设计、记忆点强化。不少于200字。"
    },
    {
      "title": "要点3的标题（升华阶段）",
      "content": "详细的内容描述，必须包含：价值提炼、情感升华、记忆点强化、行动引导。不少于150字。"
    }
  ]
}

**重要要求**：
1. 每个要点的内容必须具体、可拍摄，不要抽象描述
2. 确保三个要点形成完整的内容结构和情绪弧线
3. 确保内容与金句高度相关，能够自然承接金句
4. 确保每个要点都有明确的场景、画面、动作和情感

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Generating content points', { 
      sessionId, 
      model, 
      hook: session.selectedHook.text 
    });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response
    let contentData: { contentPoints: Array<{ title?: string; content: string }> };
    try {
      // Try to extract JSON from response (might have markdown code blocks)
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse content JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: cleanedResponse.substring(0, 200)
      });
      
      // Fallback: create basic content points
      contentData = {
        contentPoints: [
          {
            title: '引入场景',
            content: '详细描述为什么选择这个主题，包括发现过程、第一印象、期待感等。'
          },
          {
            title: '展开内容',
            content: '详细描述主要内容，包括过程、体验、感受等。'
          },
          {
            title: '价值总结',
            content: '总结价值和推荐理由，升华主题，留下回味空间。'
          }
        ]
      };
    }

    // Validate and format content points with sanitization
    const contentPoints: ContentPoint[] = (contentData.contentPoints || [])
      .slice(0, 3) // Limit to 3 points
      .map((point: { title?: string; content: string }, index: number) => ({
        id: `content-${randomUUID()}`,
        title: point.title ? sanitizeUserInput(point.title) : `要点 ${index + 1}`,
        content: point.content ? sanitizeUserInput(point.content) : '内容生成遇到问题，请重试',
        order: index + 1,
      }));

    // Ensure we have exactly 3 content points
    while (contentPoints.length < 3) {
      contentPoints.push({
        id: `content-${randomUUID()}`,
        title: `要点 ${contentPoints.length + 1}`,
        content: '内容生成遇到问题，请重试',
        order: contentPoints.length + 1,
      });
    }

    logger.info('Content points generated successfully', { 
      sessionId, 
      pointsCount: contentPoints.length 
    });

    return contentPoints;
  } catch (error: any) {
    logger.error('Failed to generate content points', {
      sessionId,
      error: error.message,
      errorType: error.constructor.name,
    });

    // Return fallback content points
    return [
      {
        id: `content-${randomUUID()}`,
        title: '引入场景',
        content: '内容生成遇到问题，请重试',
        order: 1,
      },
      {
        id: `content-${randomUUID()}`,
        title: '展开内容',
        content: '内容生成遇到问题，请重试',
        order: 2,
      },
      {
        id: `content-${randomUUID()}`,
        title: '价值总结',
        content: '内容生成遇到问题，请重试',
        order: 3,
      },
    ];
  }
}

/**
 * Re-generate content outline with optimizations
 * Per FR-037: Support content optimization
 */
export async function optimizeContent(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<ContentPoint[]> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please select a hook first.');
  }

  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(session.selectedHook.text);

  // Build current content description for prompt (with sanitization)
  const currentContentDesc = session.contentOutline && session.contentOutline.length > 0
    ? session.contentOutline.map((point, index) => {
        const sanitizedTitle = sanitizeForPrompt(point.title || '无标题');
        const sanitizedContent = sanitizeForPrompt(point.content.substring(0, 200));
        return `要点${index + 1}（${sanitizedTitle}）：${sanitizedContent}${point.content.length > 200 ? '...' : ''}`;
      }).join('\n')
    : '无';

  const prompt = `你是一位短视频内容创作专家，擅长在现有内容基础上进行优化和精炼。

用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}

当前的内容要点：
${currentContentDesc}

请基于上述现有内容进行优化，而不是重新生成。优化要求：
1. **保留现有内容的核心理念和结构**，不要完全改变内容方向
2. **在现有基础上丰富细节**：添加更多具体场景、情感描述、画面感
3. **改进表达方式**：让语言更生动、更有感染力、更能引起共鸣
4. **优化逻辑结构**：确保三个要点之间的过渡更自然、逻辑更顺畅
5. **保持要点数量不变**：仍然是3个要点，保持原有的标题和顺序（除非标题明显不合适）

请以JSON格式返回优化后的内容，格式如下：
{
  "contentPoints": [
    {
      "title": "要点1的标题（尽量保持原标题，除非需要优化）",
      "content": "在现有内容基础上优化后的详细描述，应该比原内容更丰富、更具体、更有画面感，不少于150字"
    },
    {
      "title": "要点2的标题（尽量保持原标题，除非需要优化）",
      "content": "在现有内容基础上优化后的详细描述，应该比原内容更丰富、更具体、更有画面感，不少于150字"
    },
    {
      "title": "要点3的标题（尽量保持原标题，除非需要优化）",
      "content": "在现有内容基础上优化后的详细描述，应该比原内容更丰富、更具体、更有画面感，不少于150字"
    }
  ]
}

重要：这是优化，不是重新生成。请基于现有内容进行改进，而不是完全替换。

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Optimizing content points', { sessionId, model });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response (same logic as generateContent)
    let contentData: { contentPoints: Array<{ title?: string; content: string }> };
    try {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse optimized content JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      
      // Fallback: use generateContent
      return generateContent(sessionId, model);
    }

    // Format content points - preserve original IDs and order if possible (with sanitization)
    const originalPoints = session.contentOutline || [];
    const contentPoints: ContentPoint[] = (contentData.contentPoints || [])
      .slice(0, 3)
      .map((point: { title?: string; content: string }, index: number) => ({
        // Try to preserve original ID if structure matches
        id: originalPoints[index]?.id || `content-${randomUUID()}`,
        title: point.title ? sanitizeUserInput(point.title) : (originalPoints[index]?.title || `要点 ${index + 1}`),
        content: point.content ? sanitizeUserInput(point.content) : (originalPoints[index]?.content || '内容优化遇到问题，请重试'),
        order: index + 1,
      }));

    // Ensure we have exactly 3 content points
    while (contentPoints.length < 3) {
      contentPoints.push({
        id: `content-${randomUUID()}`,
        title: `要点 ${contentPoints.length + 1}`,
        content: '内容优化遇到问题，请重试',
        order: contentPoints.length + 1,
      });
    }

    logger.info('Content points optimized successfully', { sessionId, pointsCount: contentPoints.length });

    return contentPoints;
  } catch (error: any) {
    logger.error('Failed to optimize content points', {
      sessionId,
      error: error.message,
    });

    // Fallback: use generateContent
    return generateContent(sessionId, model);
  }
}

/**
 * Expand or optimize a specific content point
 * Per FR-038: Support expanding individual content points
 * If userInstruction is provided, optimize according to user's direction
 * Otherwise, expand the content point in detail
 */
export async function expandPoint(
  sessionId: string,
  pointId: string,
  model: string = 'deepseek-v3',
  userInstruction?: string
): Promise<ContentPoint> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.contentOutline || session.contentOutline.length === 0) {
    throw new Error('No content outline found. Please generate content first.');
  }

  const pointToExpand = session.contentOutline.find(p => p.id === pointId);
  if (!pointToExpand) {
    throw new Error('Content point not found');
  }

  // If user provided instruction, optimize according to it
  // Otherwise, expand in detail
  const hasUserInstruction = userInstruction && userInstruction.trim().length > 0;
  
  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(session.selectedHook?.text || '无');
  const sanitizedTitle = sanitizeForPrompt(pointToExpand.title || '无');
  const sanitizedContent = sanitizeForPrompt(pointToExpand.content);
  const sanitizedInstruction = userInstruction ? sanitizeForPrompt(userInstruction) : '';
  
  const prompt = hasUserInstruction
    ? `你是一位短视频内容创作专家，擅长根据用户指示优化内容。

用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}
要优化的内容要点：
标题：${sanitizedTitle}
当前内容：${sanitizedContent}

用户的优化指示：${sanitizedInstruction}

请根据用户的指示，优化这个内容要点。要求：
1. 严格按照用户的指示方向进行调整
2. 保留原有内容的合理部分
3. 在用户指示的方向上丰富细节和表达
4. 确保优化后的内容更符合用户的需求

请以JSON格式返回，格式如下：
{
  "title": "优化后的标题（可以保持原标题或根据指示调整）",
  "content": "根据用户指示优化后的详细内容，应该比原内容更符合用户需求，不少于200字"
}

只返回JSON，不要其他文字说明。`
    : `你是一位短视频内容创作专家，擅长展开和丰富内容细节。

用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}
要展开的内容要点：
标题：${sanitizedTitle}
当前内容：${sanitizedContent}

请将这个内容要点展开得更详细，包含：
1. 更多具体的场景描述
2. 更丰富的情感表达
3. 更多细节和画面感
4. 更适合短视频拍摄的具体内容

请以JSON格式返回，格式如下：
{
  "title": "展开后的标题（可以保持原标题或优化）",
  "content": "展开后的详细内容，应该比原内容更丰富、更具体、更有画面感，不少于200字"
}

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Expanding content point', { sessionId, pointId, model });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response
    let expandedData: { title?: string; content: string };
    try {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        expandedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse expanded content JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      
      // Fallback: return original point with expanded message
      return {
        ...pointToExpand,
        content: pointToExpand.content + '\n\n（展开功能遇到问题，请重试）',
      };
    }

    const expandedPoint: ContentPoint = {
      id: pointToExpand.id, // Keep original ID
      title: expandedData.title ? sanitizeUserInput(expandedData.title) : pointToExpand.title,
      content: expandedData.content ? sanitizeUserInput(expandedData.content) : pointToExpand.content,
      order: pointToExpand.order, // Keep original order
    };

    logger.info('Content point expanded successfully', { sessionId, pointId });

    return expandedPoint;
  } catch (error: any) {
    logger.error('Failed to expand content point', {
      sessionId,
      pointId,
      error: error.message,
    });

    // Return original point as fallback
    return pointToExpand;
  }
}

