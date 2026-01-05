import { callBailianAPI } from './bailian.js';
import { logger } from '../utils/logger.js';
import { getSession } from '../models/session.js';
import type { ScriptOutline } from '../models/session.js';
import type { HashtagSuggestion, MusicStyleSuggestion } from '../types/index.js';
import { sanitizeForPrompt, sanitizeUserInput, cleanAIResponse } from '../utils/text-sanitizer.js';

/**
 * Generate 3 different style scripts from content
 * Per FR-041: Convert content to scripts as "短视频拆解大师"
 * Per FR-042: Generate 3 styles (story, tutorial, comparison)
 * Per FR-043: Include professional elements (emotional anchors, memory points, conflict design, info density)
 */
export async function generateScripts(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<ScriptOutline[]> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please complete stage 1 first.');
  }

  if (!session.contentOutline || session.contentOutline.length === 0) {
    throw new Error('No content outline found. Please complete stage 2 first.');
  }

  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(session.selectedHook.text);

  // Build content outline description (with sanitization)
  const contentDescription = session.contentOutline
    .map((point, index) => {
      const sanitizedTitle = sanitizeForPrompt(point.title || '无标题');
      const sanitizedContent = sanitizeForPrompt(point.content);
      return `要点${index + 1}（${sanitizedTitle}）：${sanitizedContent}`;
    })
    .join('\n\n');

  const prompt = `你是一位拥有15年短视频创作经验的脚本拆解大师，深谙短视频脚本的专业创作方法和行业最佳实践。你擅长将内容转化为可执行的、专业的短视频脚本，确保每个脚本都具备高完播率、高互动率的潜力。

**重要提示**：用户输入可能包含中文、英文或中英文混合内容。请根据输入内容的语言特点，生成相应语言风格的脚本。如果输入是混合语言，请根据主要语言或内容特点选择最合适的语言风格。

## 创作背景
用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}

内容大纲：
${contentDescription}

## 专业元素详解

请基于以上内容，生成3种不同风格的短视频脚本。每种脚本必须包含以下专业元素，并确保每个元素都有具体的、可执行的设计：

### 1. 情绪锚点 (Emotional Anchors)
**定义**：在关键时间点设置情绪触发点，引导观众情绪起伏
**具体要求**：
- **开场3秒锚点**：必须用金句开场，设计悬念、疑问或反差，在3秒内触发强烈情绪
- **中段锚点（15-30秒）**：设计情感共鸣点、惊喜点或转折点，保持观众注意力
- **结尾锚点（最后5秒）**：设计价值升华点或行动引导点，留下深刻印象
- **每个锚点必须包含**：具体时间点、情绪类型（好奇/共鸣/惊喜/感动等）、触发方式、预期效果

### 2. 记忆点植入 (Memory Points)
**定义**：设计容易让观众记住的亮点，增强传播力
**具体要求**：
- **金句重复策略**：在关键位置重复金句，强化记忆（开场、中段、结尾各一次）
- **视觉记忆点**：设计独特的道具、场景、动作，形成视觉符号
- **听觉记忆点**：设计独特的音效、音乐、口头禅，形成听觉符号
- **反差记忆点**：通过价格vs价值、预期vs现实等反差，制造记忆点
- **每个记忆点必须包含**：具体内容、出现位置、设计理由、预期效果

### 3. 冲突设计 (Conflict Design)
**定义**：通过对比、反转、悬念等方式制造冲突，保持观众注意力
**具体要求**：
- **对比冲突**：价格vs价值、普通vs独特、预期vs现实等
- **反转冲突**：设置预期，然后反转，制造惊喜
- **悬念冲突**：提出问题，延迟解答，保持悬念
- **冲突设计必须包含**：冲突类型、冲突点位置、制造方式、解决方式、预期效果

### 4. 信息密度控制 (Information Density)
**定义**：合理分配信息密度，确保观众能跟上节奏
**具体要求**：
- **前3秒（高密度）**：金句+场景+悬念，信息密度最高，快速抓住注意力
- **中段（中密度）**：展开细节，节奏放缓，信息密度适中，便于理解
- **结尾（低密度）**：总结升华，信息收敛，留下回味空间
- **信息密度控制必须包含**：每个阶段的信息量、节奏控制、时间分配、预期效果

## 三种脚本风格的差异化要求

### 1. 故事叙述型 (story)
**核心特点**：通过故事线展开，有情节、有情感、有起伏
**专业要求**：
- **情节结构**：必须遵循"起承转合"结构
  * 起（开场）：用金句开场，建立场景和人物
  * 承（展开）：展开故事，推进情节，建立期待
  * 转（高潮）：出现转折或冲突，制造高潮
  * 合（结尾）：解决问题，升华主题，留下回味
- **人物/场景设定**：明确故事中的人物、场景、时间、环境
- **情感弧线**：设计清晰的情感变化路径（如：好奇→探索→惊喜→满足→回味）
- **points要求**：
  * 开场吸引：用金句开场，建立故事场景和人物，设计悬念
  * 故事展开：推进情节，展开细节，建立期待感
  * 高潮部分：出现转折或冲突，制造情感高潮
  * 结尾总结：解决问题，升华主题，留下回味空间

### 2. 教程教学型 (tutorial)
**核心特点**：以教学为主，结构清晰，步骤明确，实用性强
**专业要求**：
- **步骤清晰度**：每个教学步骤必须清晰、可操作、易理解
- **实操演示点**：明确哪些步骤需要实操演示，如何演示
- **知识点拆解**：将复杂知识点拆解为简单易懂的部分
- **实用价值**：确保观众能学到实用技能或知识
- **points要求**：
  * 开场引入：用金句开场，快速吸引注意力，明确教学主题
  * 核心教学：详细的教学步骤和要点，确保清晰易懂
  * 实操演示：展示实际操作过程，确保可学可做
  * 总结要点：总结关键知识点，强化记忆，引导实践

### 3. 对比评测型 (comparison)
**核心特点**：通过对比突出特点，有对比、有结论、有推荐
**专业要求**：
- **对比维度设计**：明确对比的维度（价格、质量、体验、效果等）
- **评测标准明确**：明确评测的标准和方法，确保客观公正
- **结论推导逻辑**：通过对比数据或体验，推导出明确结论
- **推荐理由充分**：给出推荐的理由，确保有说服力
- **points要求**：
  * 开场对比：用金句开场，引出对比主题，建立期待
  * 对比展开：详细的对比维度和内容，确保客观全面
  * 结论分析：通过对比得出明确结论，确保逻辑清晰
  * 推荐总结：给出推荐和总结，强化价值，引导行动

## 可执行性要求

每个脚本必须包含以下可执行性要素：

### 时间分配建议
- **总时长建议**：根据内容复杂度，建议15秒、30秒或60秒
- **每个要点的时间分配**：明确每个要点建议的时长
- **关键时间节点**：明确情绪锚点、记忆点的具体时间位置

### 镜头语言建议
- **镜头类型**：特写、中景、全景、运动镜头等
- **镜头切换**：明确镜头切换的时机和方式
- **画面构图**：明确画面构图的要求和重点

### 动作指导
- **创作者/演员的动作**：明确具体的动作和互动
- **道具使用**：明确需要的道具和使用方式
- **场景布置**：明确场景的要求和布置方式

## 输出要求

请以JSON格式返回，格式如下：
{
  "scripts": [
    {
      "style": "story",
      "title": "故事叙述型脚本标题（必须吸引人，体现故事核心）",
      "points": [
        "开场吸引：具体描述如何用金句开场，建立故事场景和人物，设计悬念（建议时长：3-5秒）",
        "故事展开：具体描述如何推进情节，展开细节，建立期待感（建议时长：10-15秒）",
        "高潮部分：具体描述如何出现转折或冲突，制造情感高潮（建议时长：5-8秒）",
        "结尾总结：具体描述如何解决问题，升华主题，留下回味空间（建议时长：3-5秒）"
      ],
      "description": "这个脚本的整体思路和特点说明，包括故事类型、情感弧线、核心亮点等，不少于150字",
      "emotionalAnchors": [
        "开场3秒：具体描述情绪锚点（情绪类型、触发方式、预期效果）",
        "中段15-30秒：具体描述情绪锚点（情绪类型、触发方式、预期效果）",
        "结尾最后5秒：具体描述情绪锚点（情绪类型、触发方式、预期效果）"
      ],
      "memoryPoints": [
        "金句重复：具体描述在哪些位置重复金句，如何强化记忆",
        "视觉记忆点：具体描述独特的视觉符号（道具、场景、动作）",
        "反差记忆点：具体描述反差设计（如：价格vs价值），如何制造记忆点"
      ],
      "conflictDesign": "具体描述冲突类型（对比/反转/悬念）、冲突点位置、制造方式、解决方式、预期效果，不少于100字",
      "informationDensity": "具体描述前3秒（高密度）、中段（中密度）、结尾（低密度）的信息密度控制策略，包括信息量、节奏控制、时间分配，不少于100字"
    },
    {
      "style": "tutorial",
      "title": "教程教学型脚本标题（必须明确教学主题）",
      "points": [
        "开场引入：具体描述如何用金句开场，快速吸引注意力，明确教学主题（建议时长：3-5秒）",
        "核心教学：具体描述详细的教学步骤和要点，确保清晰易懂（建议时长：15-20秒）",
        "实操演示：具体描述如何展示实际操作过程，确保可学可做（建议时长：8-12秒）",
        "总结要点：具体描述如何总结关键知识点，强化记忆，引导实践（建议时长：3-5秒）"
      ],
      "description": "这个脚本的整体思路和特点说明，包括教学类型、核心知识点、实用价值等，不少于150字",
      "emotionalAnchors": [...],
      "memoryPoints": [...],
      "conflictDesign": "...",
      "informationDensity": "..."
    },
    {
      "style": "comparison",
      "title": "对比评测型脚本标题（必须体现对比主题）",
      "points": [
        "开场对比：具体描述如何用金句开场，引出对比主题，建立期待（建议时长：3-5秒）",
        "对比展开：具体描述详细的对比维度和内容，确保客观全面（建议时长：15-20秒）",
        "结论分析：具体描述如何通过对比得出明确结论，确保逻辑清晰（建议时长：8-12秒）",
        "推荐总结：具体描述如何给出推荐和总结，强化价值，引导行动（建议时长：3-5秒）"
      ],
      "description": "这个脚本的整体思路和特点说明，包括对比维度、评测标准、核心结论等，不少于150字",
      "emotionalAnchors": [...],
      "memoryPoints": [...],
      "conflictDesign": "...",
      "informationDensity": "..."
    }
  ]
}

**重要要求**：
1. 每个脚本的 points 数组必须包含4个要点，每个要点必须包含具体描述和建议时长
2. emotionalAnchors 必须包含至少3个情绪锚点（开场、中段、结尾）
3. memoryPoints 必须包含至少3个记忆点（金句重复、视觉记忆点、反差记忆点等）
4. conflictDesign 和 informationDensity 必须具体描述，不少于100字，不是简单的一句话
5. description 必须详细说明脚本的整体思路和特点，不少于150字
6. 确保每个脚本都有明确的、可执行的时间分配、镜头语言和动作指导

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Generating scripts', { 
      sessionId, 
      model, 
      hook: session.selectedHook.text,
      contentPointsCount: session.contentOutline.length
    });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response
    let scriptsData: { scripts: Array<{
      style: string;
      title: string;
      points: string[];
      description: string;
      emotionalAnchors?: string[];
      memoryPoints?: string[];
      conflictDesign?: string;
      informationDensity?: string;
    }> };
    
    try {
      // Try to extract JSON from response (might have markdown code blocks)
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse scripts JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: cleanedResponse.substring(0, 200)
      });
      
      // Fallback: create basic scripts
      scriptsData = {
        scripts: [
          {
            style: 'story',
            title: '故事叙述型脚本',
            points: ['开场吸引', '故事展开', '高潮部分', '结尾总结'],
            description: '脚本生成遇到问题，请重试',
            emotionalAnchors: [],
            memoryPoints: [],
            conflictDesign: '',
            informationDensity: ''
          },
          {
            style: 'tutorial',
            title: '教程教学型脚本',
            points: ['开场引入', '核心教学', '实操演示', '总结要点'],
            description: '脚本生成遇到问题，请重试',
            emotionalAnchors: [],
            memoryPoints: [],
            conflictDesign: '',
            informationDensity: ''
          },
          {
            style: 'comparison',
            title: '对比评测型脚本',
            points: ['开场对比', '对比展开', '结论分析', '推荐总结'],
            description: '脚本生成遇到问题，请重试',
            emotionalAnchors: [],
            memoryPoints: [],
            conflictDesign: '',
            informationDensity: ''
          }
        ]
      };
    }

    // Validate and format scripts with sanitization
    const scripts: ScriptOutline[] = (scriptsData.scripts || [])
      .slice(0, 3) // Limit to 3 scripts
      .map((script: any) => ({
        style: script.style || 'story',
        title: script.title ? sanitizeUserInput(script.title) : '脚本标题',
        points: Array.isArray(script.points) 
          ? script.points.map((p: string) => sanitizeUserInput(p))
          : [],
        description: script.description ? sanitizeUserInput(script.description) : '脚本描述',
        emotionalAnchors: Array.isArray(script.emotionalAnchors) 
          ? script.emotionalAnchors.map((a: string) => sanitizeUserInput(a))
          : [],
        memoryPoints: Array.isArray(script.memoryPoints) 
          ? script.memoryPoints.map((p: string) => sanitizeUserInput(p))
          : [],
        conflictDesign: script.conflictDesign ? sanitizeUserInput(script.conflictDesign) : '',
        informationDensity: script.informationDensity ? sanitizeUserInput(script.informationDensity) : '',
      }));

    // Ensure we have exactly 3 scripts with correct styles
    const requiredStyles = ['story', 'tutorial', 'comparison'];
    const existingStyles = scripts.map(s => s.style);
    
    requiredStyles.forEach((style, index) => {
      if (!existingStyles.includes(style)) {
        if (scripts[index]) {
          scripts[index].style = style;
        } else {
          scripts.push({
            style,
            title: `${style === 'story' ? '故事叙述型' : style === 'tutorial' ? '教程教学型' : '对比评测型'}脚本`,
            points: style === 'story' 
              ? ['开场吸引', '故事展开', '高潮部分', '结尾总结']
              : style === 'tutorial'
              ? ['开场引入', '核心教学', '实操演示', '总结要点']
              : ['开场对比', '对比展开', '结论分析', '推荐总结'],
            description: '脚本生成遇到问题，请重试',
            emotionalAnchors: [],
            memoryPoints: [],
            conflictDesign: '',
            informationDensity: '',
          });
        }
      }
    });

    // Ensure we have exactly 3 scripts
    while (scripts.length < 3) {
      scripts.push({
        style: requiredStyles[scripts.length] || 'story',
        title: '脚本标题',
        points: ['要点1', '要点2', '要点3', '要点4'],
        description: '脚本生成遇到问题，请重试',
        emotionalAnchors: [],
        memoryPoints: [],
        conflictDesign: '',
        informationDensity: '',
      });
    }

    logger.info('Scripts generated successfully', { 
      sessionId, 
      scriptsCount: scripts.length 
    });

    return scripts.slice(0, 3); // Ensure exactly 3 scripts
  } catch (error: any) {
    logger.error('Failed to generate scripts', {
      sessionId,
      error: error.message,
      errorType: error.constructor.name,
    });

    // Return fallback scripts
    return [
      {
        style: 'story',
        title: '故事叙述型脚本',
        points: ['脚本生成遇到问题，请重试'],
        description: '脚本生成遇到问题，请重试',
        emotionalAnchors: [],
        memoryPoints: [],
        conflictDesign: '',
        informationDensity: '',
      },
      {
        style: 'tutorial',
        title: '教程教学型脚本',
        points: ['脚本生成遇到问题，请重试'],
        description: '脚本生成遇到问题，请重试',
        emotionalAnchors: [],
        memoryPoints: [],
        conflictDesign: '',
        informationDensity: '',
      },
      {
        style: 'comparison',
        title: '对比评测型脚本',
        points: ['脚本生成遇到问题，请重试'],
        description: '脚本生成遇到问题，请重试',
        emotionalAnchors: [],
        memoryPoints: [],
        conflictDesign: '',
        informationDensity: '',
      },
    ];
  }
}

/**
 * Refine/optimize a specific script
 * Per FR-044: Support script refinement
 */
export async function refineScript(
  sessionId: string,
  scriptStyle: 'story' | 'tutorial' | 'comparison',
  model: string = 'deepseek-v3'
): Promise<ScriptOutline> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please complete stage 1 first.');
  }

  if (!session.contentOutline || session.contentOutline.length === 0) {
    throw new Error('No content outline found. Please complete stage 2 first.');
  }

  if (!session.generatedScripts || session.generatedScripts.length === 0) {
    throw new Error('No scripts found. Please generate scripts first.');
  }

  const scriptToRefine = session.generatedScripts.find(s => s.style === scriptStyle);
  if (!scriptToRefine) {
    throw new Error(`Script with style "${scriptStyle}" not found`);
  }

  // Sanitize inputs for prompt
  const sanitizedUserInput = sanitizeForPrompt(session.userInput);
  const sanitizedHookText = sanitizeForPrompt(session.selectedHook.text);

  // Build content outline description (with sanitization)
  const contentDescription = session.contentOutline
    .map((point, index) => {
      const sanitizedTitle = sanitizeForPrompt(point.title || '无标题');
      const sanitizedContent = sanitizeForPrompt(point.content);
      return `要点${index + 1}（${sanitizedTitle}）：${sanitizedContent}`;
    })
    .join('\n\n');

  const prompt = `你是一位短视频拆解大师，擅长优化和精炼短视频脚本。

用户想要创作的主题是：${sanitizedUserInput}
已选择的金句是：${sanitizedHookText}

内容大纲：
${contentDescription}

当前要优化的脚本（${scriptStyle}风格）：
标题：${sanitizeForPrompt(scriptToRefine.title)}
要点：
${scriptToRefine.points.map((p, i) => `${i + 1}. ${sanitizeForPrompt(p)}`).join('\n')}
描述：${sanitizeForPrompt(scriptToRefine.description)}
情绪锚点：${scriptToRefine.emotionalAnchors?.map(a => sanitizeForPrompt(a)).join('；') || '无'}
记忆点：${scriptToRefine.memoryPoints?.map(p => sanitizeForPrompt(p)).join('；') || '无'}
冲突设计：${sanitizeForPrompt(scriptToRefine.conflictDesign || '无')}
信息密度：${sanitizeForPrompt(scriptToRefine.informationDensity || '无')}

请优化这个脚本，要求：
1. 保持原有的风格和结构
2. 增强专业元素（情绪锚点、记忆点、冲突设计、信息密度）
3. 让脚本更具体、更有画面感、更适合拍摄
4. 确保所有专业元素都详细具体，不是简单的一句话

请以JSON格式返回优化后的脚本，格式如下：
{
  "style": "${scriptStyle}",
  "title": "优化后的脚本标题",
  "points": [
    "优化后的要点1",
    "优化后的要点2",
    "优化后的要点3",
    "优化后的要点4"
  ],
  "description": "优化后的描述，不少于100字",
  "emotionalAnchors": [
    "优化后的情绪锚点1（具体描述）",
    "优化后的情绪锚点2（具体描述）"
  ],
  "memoryPoints": [
    "优化后的记忆点1（具体描述）",
    "优化后的记忆点2（具体描述）"
  ],
  "conflictDesign": "优化后的冲突设计（详细具体描述）",
  "informationDensity": "优化后的信息密度控制（详细具体描述）"
}

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Refining script', { sessionId, scriptStyle, model });

    const response = await callBailianAPI(prompt, model);
    
    // Clean AI response before parsing
    const cleanedResponse = cleanAIResponse(response);
    
    // Parse JSON response
    let refinedData: {
      style: string;
      title: string;
      points: string[];
      description: string;
      emotionalAnchors?: string[];
      memoryPoints?: string[];
      conflictDesign?: string;
      informationDensity?: string;
    };
    
    try {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        refinedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse refined script JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      
      // Fallback: return original script
      return scriptToRefine;
    }

    // Sanitize all fields in refined script
    const refinedScript: ScriptOutline = {
      style: refinedData.style || scriptStyle,
      title: refinedData.title ? sanitizeUserInput(refinedData.title) : scriptToRefine.title,
      points: Array.isArray(refinedData.points) 
        ? refinedData.points.map(p => sanitizeUserInput(p))
        : scriptToRefine.points,
      description: refinedData.description ? sanitizeUserInput(refinedData.description) : scriptToRefine.description,
      emotionalAnchors: Array.isArray(refinedData.emotionalAnchors) 
        ? refinedData.emotionalAnchors.map(a => sanitizeUserInput(a))
        : scriptToRefine.emotionalAnchors || [],
      memoryPoints: Array.isArray(refinedData.memoryPoints) 
        ? refinedData.memoryPoints.map(p => sanitizeUserInput(p))
        : scriptToRefine.memoryPoints || [],
      conflictDesign: refinedData.conflictDesign ? sanitizeUserInput(refinedData.conflictDesign) : (scriptToRefine.conflictDesign || ''),
      informationDensity: refinedData.informationDensity ? sanitizeUserInput(refinedData.informationDensity) : (scriptToRefine.informationDensity || ''),
    };

    logger.info('Script refined successfully', { sessionId, scriptStyle });

    return refinedScript;
  } catch (error: any) {
    logger.error('Failed to refine script', {
      sessionId,
      scriptStyle,
      error: error.message,
    });

    // Return original script as fallback
    return scriptToRefine;
  }
}

/**
 * Generate hashtags (5-10) based on session content
 * Per FR-005: Generate 5-10 high-potential hashtags
 */
export async function generateHashtags(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<HashtagSuggestion[]> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please complete stage 1 first.');
  }

  // Build content description for context
  const contentDescription = session.contentOutline
    ? session.contentOutline
        .map((point, index) => {
          return `要点${index + 1}（${point.title || '无标题'}）：${point.content}`;
        })
        .join('\n\n')
    : '';

  const prompt = `你是一位短视频内容创作专家，擅长为短视频内容推荐高潜力的Hashtag标签。

用户想要创作的主题是：${session.userInput}
已选择的金句是：${session.selectedHook.text}
${contentDescription ? `内容大纲：\n${contentDescription}` : ''}

请为这个短视频内容生成5-10个相关的、高潜力的Hashtag标签。要求：
1. 标签要与内容高度相关
2. 标签要有一定的搜索热度和传播潜力
3. 标签要简洁明了，易于记忆
4. 可以包含主题相关的标签、情感标签、场景标签等

请以JSON格式返回，格式如下：
{
  "hashtags": [
    "标签1",
    "标签2",
    "标签3",
    "标签4",
    "标签5"
  ]
}

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Generating hashtags', { sessionId, model });

    const response = await callBailianAPI(prompt, model);
    
    // Parse JSON response
    let hashtagsData: { hashtags: string[] };
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        hashtagsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse hashtags JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: response.substring(0, 200)
      });
      
      // Fallback: extract hashtags from text
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      const fallbackHashtags = lines
        .map(line => line.trim().replace(/^[-*•#]\s*/, '').replace(/^#/, ''))
        .filter(line => line.length > 0 && line.length < 50)
        .slice(0, 10);
      hashtagsData = { hashtags: fallbackHashtags.length > 0 ? fallbackHashtags : ['短视频', '创作', '内容', '分享', '推荐'] };
    }

    // Validate and format hashtags
    const hashtags: HashtagSuggestion[] = (hashtagsData.hashtags || [])
      .slice(0, 10) // Limit to 10 hashtags
      .filter((tag: string) => tag && tag.trim().length > 0 && tag.trim().length < 50)
      .map((tagText: string) => ({
        text: tagText.trim(),
      }));

    // Ensure we have at least 5 hashtags
    if (hashtags.length < 5) {
      logger.warn('Generated less than 5 hashtags, adding fallback hashtags', { hashtagsCount: hashtags.length });
      const fallbackTags = ['短视频', '创作', '内容', '分享', '推荐'];
      while (hashtags.length < 5) {
        const tag = fallbackTags[hashtags.length] || `标签${hashtags.length + 1}`;
        if (!hashtags.some(h => h.text === tag)) {
          hashtags.push({ text: tag });
        }
      }
    }

    logger.info('Hashtags generated successfully', { 
      sessionId, 
      hashtagsCount: hashtags.length 
    });

    return hashtags.slice(0, 10); // Ensure max 10 hashtags
  } catch (error: any) {
    logger.error('Failed to generate hashtags', {
      sessionId,
      error: error.message,
    });

    // Return fallback hashtags
    return [
      { text: session.userInput.substring(0, 20) || '短视频' },
      { text: '创作' },
      { text: '内容' },
      { text: '分享' },
      { text: '推荐' },
    ];
  }
}

/**
 * Generate music style suggestion based on session content
 * Per FR-006: Generate background music style description
 */
export async function generateMusicStyle(
  sessionId: string,
  model: string = 'deepseek-v3'
): Promise<MusicStyleSuggestion> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedHook) {
    throw new Error('No hook selected. Please complete stage 1 first.');
  }

  // Build content description for context
  const contentDescription = session.contentOutline
    ? session.contentOutline
        .map((point, index) => {
          return `要点${index + 1}（${point.title || '无标题'}）：${point.content}`;
        })
        .join('\n\n')
    : '';

  const prompt = `你是一位短视频音乐推荐专家，擅长为短视频内容推荐适合的背景音乐风格。

用户想要创作的主题是：${session.userInput}
已选择的金句是：${session.selectedHook.text}
${contentDescription ? `内容大纲：\n${contentDescription}` : ''}

请为这个短视频内容推荐适合的背景音乐风格。要求：
1. 音乐风格要与内容主题和情绪相匹配
2. 提供详细的音乐风格描述（如：轻快节奏、舒缓背景音、激昂配乐等）
3. 可以包含情绪、节奏、适用场景等信息
4. 只提供文字描述，不需要提供实际音频文件

请以JSON格式返回，格式如下：
{
  "style": "音乐风格描述（如：轻快节奏、舒缓背景音等）",
  "mood": "情绪描述（如：轻松愉快、紧张刺激等）",
  "tempo": "节奏描述（如：中速、快速、慢速等）",
  "scene": "适用场景描述（如：日常分享、产品展示、故事叙述等）"
}

只返回JSON，不要其他文字说明。`;

  try {
    logger.info('Generating music style', { sessionId, model });

    const response = await callBailianAPI(prompt, model);
    
    // Parse JSON response
    let musicData: {
      style: string;
      mood?: string;
      tempo?: string;
      scene?: string;
    };
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        musicData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse music style JSON, using fallback', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: response.substring(0, 200)
      });
      
      // Fallback: extract style from text
      const style = response.trim().split('\n')[0].substring(0, 100) || '轻快节奏';
      musicData = {
        style,
        mood: '适合内容展示',
      };
    }

    const musicStyle: MusicStyleSuggestion = {
      style: musicData.style || '轻快节奏',
      mood: musicData.mood || '适合内容展示',
      tempo: musicData.tempo,
      scene: musicData.scene,
    };

    logger.info('Music style generated successfully', { sessionId, style: musicStyle.style });

    return musicStyle;
  } catch (error: any) {
    logger.error('Failed to generate music style', {
      sessionId,
      error: error.message,
    });

    // Return fallback music style
    return {
      style: '轻快节奏',
      mood: '适合内容展示',
    };
  }
}

