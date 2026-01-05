import { callBailianAPI } from './bailian.js';
import { logger } from '../utils/logger.js';
import { getSession } from '../models/session.js';
import type { Hook } from '../models/session.js';
import { randomUUID } from 'crypto';
import { sanitizeForPrompt, sanitizeUserInput, cleanAIResponse } from '../utils/text-sanitizer.js';

/**
 * Generate 3-5 hooks (golden phrases) based on user input
 * Per FR-028: Generate 3-5 hook options for user selection
 * Per FR-033: Hooks must be emotionally engaging and attention-grabbing
 */
export async function generateHooks(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<Hook[]> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Sanitize user input for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);

  const prompt = `你是一位拥有10年短视频创作经验的金句创作大师，深谙"3秒钩子法则"和情绪触发机制。你擅长根据不同赛道和主题，创作出能在开头3秒内抓住观众注意力、引发强烈情感共鸣的"金句"（Hook）。

**重要提示**：用户输入可能包含中文、英文或中英文混合内容。请根据输入内容的语言特点，生成相应语言风格的金句。如果输入是混合语言，请根据主要语言或内容特点选择最合适的语言风格。

## 创作主题分析
用户想要创作的主题是：${sanitizedUserInput}

请先分析这个主题：
1. **内容赛道识别**：判断属于哪个赛道（美食、旅行、美妆、知识、生活、娱乐等）
2. **目标受众特征**：分析谁会关注这个主题，他们的痛点和需求是什么
3. **情绪触发点**：识别这个主题最容易引发的情感（好奇、共鸣、反差、悬念、惊喜等）

## 专业金句标准

请生成3-5个金句选项，每个金句必须符合以下专业标准：

### 1. 3秒钩子法则
- **前3秒必须抓住注意力**：金句要在3秒内完成情绪触发
- **信息密度高**：在最短时间内传达最大信息量
- **悬念或冲突**：制造疑问、反差或期待感

### 2. 情绪触发点设计
每个金句应该包含至少一种情绪触发机制：
- **好奇型**：制造疑问，引发"为什么"、"怎么做到的"
- **共鸣型**：触动情感，引发"我也是"、"太真实了"
- **反差型**：制造对比，引发"竟然"、"没想到"
- **悬念型**：制造神秘，引发"接下来会怎样"
- **惊喜型**：超出预期，引发"原来如此"

### 3. 记忆点植入
- **语言节奏**：朗朗上口，易于记忆和传播
- **独特视角**：提供与众不同的观点或角度
- **具体细节**：包含具体数字、场景或对比，增强记忆点

### 4. 场景适配性
- **与主题高度相关**：金句必须紧扣用户主题
- **适合短视频表达**：语言简洁有力，适合口语化表达
- **可延展性强**：能够自然引出后续内容

## 输出要求

请以JSON格式返回，格式如下：
{
  "hooks": [
    "金句1（必须符合上述所有标准）",
    "金句2（必须符合上述所有标准）",
    "金句3（必须符合上述所有标准）",
    "金句4（可选，如果主题适合）",
    "金句5（可选，如果主题适合）"
  ]
}

**重要要求**：
1. 每个金句长度控制在15-25字之间，确保3秒内能说完
2. 金句之间要有差异化，不要重复相似的表达方式
3. 优先选择最能引发目标受众情感共鸣的金句
4. 确保每个金句都有明确的情绪触发点和记忆点

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Generating hooks', { sessionId, model, userInput: session.userInput });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response
    let hooksData: { hooks: string[] };
    try {
      // Try to extract JSON from response (might have markdown code blocks)
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        hooksData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse hooks JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: cleanedResponse.substring(0, 200)
      });
      
      // Fallback: try to extract hooks from text
      const lines = cleanedResponse.split('\n').filter(line => line.trim().length > 0);
      const fallbackHooks = lines.slice(0, 5).map(line => line.replace(/^[-*•]\s*/, '').trim());
      hooksData = { hooks: fallbackHooks.length > 0 ? fallbackHooks : ['请重试生成金句'] };
    }

    // Validate and format hooks with sanitization
    const hooks: Hook[] = (hooksData.hooks || [])
      .slice(0, 5) // Limit to 5 hooks
      .filter((hook: string) => hook && hook.trim().length > 0)
      .map((hookText: string, index: number) => ({
        id: `hook-${randomUUID()}`,
        text: sanitizeUserInput(hookText.trim()),
        isSelected: false,
      }));

    // Ensure we have at least 3 hooks
    if (hooks.length < 3) {
      logger.warn('Generated less than 3 hooks, adding fallback hooks', { hooksCount: hooks.length });
      while (hooks.length < 3) {
        hooks.push({
          id: `hook-${randomUUID()}`,
          text: `金句选项 ${hooks.length + 1}（请重试生成）`,
          isSelected: false,
        });
      }
    }

    logger.info('Hooks generated successfully', { 
      sessionId, 
      hooksCount: hooks.length 
    });

    return hooks;
  } catch (error: any) {
    logger.error('Failed to generate hooks', {
      sessionId,
      error: error.message,
      errorType: error.constructor.name,
    });

    // Return fallback hooks
    return [
      {
        id: `hook-${randomUUID()}`,
        text: '金句生成遇到问题，请重试',
        isSelected: false,
      },
      {
        id: `hook-${randomUUID()}`,
        text: '请稍后重试生成金句',
        isSelected: false,
      },
      {
        id: `hook-${randomUUID()}`,
        text: '系统暂时无法生成，请重试',
        isSelected: false,
      },
    ];
  }
}

/**
 * Refine/optimize a specific hook
 * Per FR-030: Support refinement when user selects a hook
 * Per FR-031: Support refinement when user manually edits a hook
 */
export async function refineHook(
  sessionId: string,
  hookText: string,
  model: string = 'deepseek-v3'
): Promise<Hook> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(hookText);

  const prompt = `你是一位拥有10年短视频创作经验的金句创作大师，擅长优化和精炼"金句"（Hook），让其在3秒内最大化情绪触发效果。

## 创作背景
用户想要创作的主题是：${sanitizedUserInput}
用户提供的金句是：${sanitizedHookText}

## 优化目标

请基于以下专业标准优化这个金句：

### 1. 强化3秒钩子效果
- 确保前3秒能抓住注意力
- 优化信息密度，在最短时间内传达核心信息
- 强化悬念或冲突点

### 2. 增强情绪触发
- 识别当前金句的情绪触发类型（好奇、共鸣、反差、悬念、惊喜）
- 强化这种情绪触发，使其更强烈、更直接
- 如果当前情绪触发不明显，添加或强化一个明确的情绪触发点

### 3. 优化记忆点
- 改进语言节奏，使其更朗朗上口
- 添加或强化具体细节（数字、场景、对比）
- 确保有独特的视角或表达方式

### 4. 提升场景适配性
- 确保与主题高度相关
- 优化语言表达，使其更适合短视频口语化
- 确保可延展性强，能自然引出后续内容

## 输出要求

只返回优化后的金句文本，不要其他说明文字。

**优化原则**：
- 保持原金句的核心意图和方向
- 在原有基础上精炼和强化，而不是完全改变
- 确保优化后的金句长度控制在15-25字之间
- 确保优化后的金句比原金句更具吸引力和传播力`;

  try {
    logger.info('Refining hook', { sessionId, hookText, model });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Clean up response (remove markdown, quotes, etc.)
    const refinedText = cleanedResponse
      .trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^```[\w]*\n?|\n?```$/g, '') // Remove code blocks
      .trim();

    // Sanitize the refined hook text
    const sanitizedRefinedText = sanitizeUserInput(refinedText || hookText);

    const refinedHook: Hook = {
      id: `hook-${randomUUID()}`,
      text: sanitizedRefinedText,
      isSelected: false,
    };

    logger.info('Hook refined successfully', { sessionId, original: hookText, refined: sanitizedRefinedText });

    return refinedHook;
  } catch (error: any) {
    logger.error('Failed to refine hook', {
      sessionId,
      hookText,
      error: error.message,
    });

    // Return original hook as fallback
    return {
      id: `hook-${randomUUID()}`,
      text: hookText,
      isSelected: false,
    };
  }
}

