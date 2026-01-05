import { callBailianAPI } from './bailian.js';
import { ScriptOutline, HashtagSuggestion, MusicStyleSuggestion } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface GenerationResult {
  scripts: ScriptOutline[];
  hashtags: HashtagSuggestion[];
  musicStyle: MusicStyleSuggestion;
}

/**
 * Generate 3 different script outlines
 */
async function generateScripts(prompt: string, model: string): Promise<ScriptOutline[]> {
  const scriptPrompts = [
    {
      style: 'story',
      title: '故事叙述型脚本',
      prompt: `请为"${prompt}"这个主题创建一个故事叙述型的短视频脚本大纲。脚本应该通过讲述一个完整的故事来展示内容，包含开场吸引、故事展开、高潮部分和结尾总结。请以JSON格式返回，包含title、style、points（至少3个要点）和description字段。`,
    },
    {
      style: 'tutorial',
      title: '教程教学型脚本',
      prompt: `请为"${prompt}"这个主题创建一个教程教学型的短视频脚本大纲。脚本应该以教学的方式展示内容，包含问题引入、步骤讲解、重点强调和总结回顾。请以JSON格式返回，包含title、style、points（至少3个要点）和description字段。`,
    },
    {
      style: 'comparison',
      title: '对比评测型脚本',
      prompt: `请为"${prompt}"这个主题创建一个对比评测型的短视频脚本大纲。脚本应该通过对比不同选项来展示内容，包含主题引入、对比展示、优缺点分析和结论建议。请以JSON格式返回，包含title、style、points（至少3个要点）和description字段。`,
    },
  ];

  const scripts: ScriptOutline[] = [];

  for (const scriptPrompt of scriptPrompts) {
    try {
      logger.info(`Generating ${scriptPrompt.style} script`, { title: scriptPrompt.title });
      const response = await callBailianAPI(scriptPrompt.prompt, model);
      
      // Try to parse JSON response
      let scriptData: any;
      let parseMethod = 'unknown';
      try {
        // Extract JSON from response (might be wrapped in markdown code blocks)
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scriptData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          parseMethod = 'json';
        } else {
          // Fallback: create script from text response
          const lines = response.split('\n').filter(line => line.trim());
          scriptData = {
            title: scriptPrompt.title,
            style: scriptPrompt.style,
            points: lines.slice(0, 5).map((line: string) => line.replace(/^[-*•]\s*/, '').trim()),
            description: response.substring(0, 100),
          };
          parseMethod = 'text-fallback';
        }
      } catch (parseError: any) {
        // If JSON parsing fails, create a structured script from text
        logger.warn(`JSON parsing failed for ${scriptPrompt.style} script, using text fallback`, {
          error: parseError.message,
        });
        const lines = response.split('\n').filter(line => line.trim());
        scriptData = {
          title: scriptPrompt.title,
          style: scriptPrompt.style,
          points: lines.slice(0, 5).map((line: string) => line.replace(/^[-*•]\s*/, '').trim()).filter(Boolean),
          description: response.substring(0, 100),
        };
        parseMethod = 'text-error-fallback';
      }

      // Ensure points is an array of strings
      let points: string[] = [];
      if (Array.isArray(scriptData.points)) {
        // Convert objects to strings if needed
        points = scriptData.points.map((point: any) => {
          if (typeof point === 'string') {
            return point;
          } else if (typeof point === 'object' && point !== null) {
            // Handle object format like {part: "...", content: "..."} or {name: "...", content: "..."}
            return point.content || point.part || point.name || JSON.stringify(point);
          } else {
            return String(point);
          }
        }).filter((p: string) => p && p.trim().length > 0);
      }

      // Ensure minimum 3 points
      if (points.length < 3) {
        points = [
          '开场吸引观众注意力',
          '展开主要内容',
          '总结和行动号召',
        ];
      }

      // Ensure description is a string
      let description: string = '';
      if (scriptData.description) {
        if (typeof scriptData.description === 'string') {
          description = scriptData.description;
        } else if (typeof scriptData.description === 'object' && scriptData.description !== null) {
          // Handle object format like {opening: "...", development: "...", climax: "...", ending: "..."}
          // Convert to a readable string format
          const descObj = scriptData.description as any;
          const parts: string[] = [];
          if (descObj.opening) parts.push(`开场：${descObj.opening}`);
          if (descObj.development) parts.push(`展开：${descObj.development}`);
          if (descObj.climax) parts.push(`高潮：${descObj.climax}`);
          if (descObj.ending) parts.push(`结尾：${descObj.ending}`);
          description = parts.length > 0 ? parts.join(' | ') : JSON.stringify(descObj);
        } else {
          description = String(scriptData.description);
        }
      }

      // Ensure title and style are strings
      const title = typeof scriptData.title === 'string' 
        ? scriptData.title 
        : (scriptData.title ? String(scriptData.title) : scriptPrompt.title);
      const style = typeof scriptData.style === 'string' 
        ? scriptData.style 
        : (scriptData.style ? String(scriptData.style) : scriptPrompt.style);

      scripts.push({
        style: style,
        title: title,
        points: points.slice(0, 10), // Limit to 10 points
        description: description,
      });
      
      logger.info(`Successfully generated ${scriptPrompt.style} script`, {
        title,
        pointsCount: points.length,
        parseMethod,
        hasDescription: !!description,
      });
    } catch (error: any) {
      logger.error(`Failed to generate ${scriptPrompt.style} script`, {
        error: error.message,
        errorType: error.constructor?.name,
        stack: error.stack?.substring(0, 500), // Limit stack trace length
        prompt: scriptPrompt.prompt.substring(0, 100), // Log first 100 chars of prompt
      });
      // Add fallback script
      scripts.push({
        style: scriptPrompt.style,
        title: scriptPrompt.title,
        points: [
          '开场吸引观众注意力',
          '展开主要内容',
          '总结和行动号召',
        ],
        description: '脚本生成遇到问题，请重试',
      });
      logger.warn(`Added fallback script for ${scriptPrompt.style}`, {
        reason: 'API call or parsing failed',
        errorMessage: error.message,
      });
    }
  }

  return scripts;
}

/**
 * Generate hashtags (5-10)
 */
async function generateHashtags(prompt: string, model: string): Promise<HashtagSuggestion[]> {
  const hashtagPrompt = `请为"${prompt}"这个主题生成5-10个相关的、高潜力的Hashtag标签。只返回标签文本，每行一个，不要包含#符号。`;

  try {
    const response = await callBailianAPI(hashtagPrompt, model);
    const lines = response
      .split('\n')
      .map(line => line.trim().replace(/^#\s*/, ''))
      .filter(line => line.length > 0 && line.length < 50)
      .slice(0, 10);

    // Ensure 5-10 hashtags
    const hashtags: HashtagSuggestion[] = lines.slice(0, 10).map(text => ({
      text,
    }));

    // If we don't have enough, add some defaults
    while (hashtags.length < 5) {
      hashtags.push({
        text: `${prompt}相关`,
      });
    }

    return hashtags.slice(0, 10);
  } catch (error: any) {
    logger.error('Failed to generate hashtags', { error: error.message });
    // Return fallback hashtags
    return [
      { text: prompt },
      { text: '短视频' },
      { text: '创作' },
      { text: '内容' },
      { text: '分享' },
    ];
  }
}

/**
 * Generate music style suggestion
 */
async function generateMusicStyle(prompt: string, model: string): Promise<MusicStyleSuggestion> {
  const musicPrompt = `请为"${prompt}"这个主题推荐适合的背景音乐风格。只返回音乐风格的文字描述，例如"轻快节奏"、"舒缓背景音"等，不需要提供实际音频文件。`;

  try {
    const response = await callBailianAPI(musicPrompt, model);
    const style = response.trim().split('\n')[0].substring(0, 100);

    return {
      style: style || '轻快节奏',
      mood: '适合内容展示',
    };
  } catch (error: any) {
    logger.error('Failed to generate music style', { error: error.message });
    return {
      style: '轻快节奏',
      mood: '适合内容展示',
    };
  }
}

/**
 * Generate all content (scripts, hashtags, music style)
 */
export async function generateContent(
  prompt: string,
  model: string = 'deepseek-v3'
): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    // Generate all content in parallel for better performance
    const [scripts, hashtags, musicStyle] = await Promise.all([
      generateScripts(prompt, model),
      generateHashtags(prompt, model),
      generateMusicStyle(prompt, model),
    ]);

    const responseTime = Date.now() - startTime;
    logger.info('Content generation completed', {
      scriptsCount: scripts.length,
      hashtagsCount: hashtags.length,
      responseTime,
    });

    return {
      scripts,
      hashtags,
      musicStyle,
    };
  } catch (error: any) {
    logger.error('Content generation failed', { error: error.message });
    throw error;
  }
}

