import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TravelGuideResponse, GroundingSource, TravelPreferences } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTravelGuide = async (
  urls: string[],
  preferences: TravelPreferences
): Promise<TravelGuideResponse> => {
  
  if (urls.length === 0) {
    throw new Error("Please provide at least one URL.");
  }

  // Filter out empty strings
  const validUrls = urls.filter(u => u.trim() !== "");

  const prompt = `
    你是一位专业的旅游顾问和行程规划师。
    
    任务：基于以下提供的URL链接中的主题、目的地和建议，创建一份详尽的“大师级旅游攻略”。
    链接：
    ${validUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
    
    用户偏好与限制：
    - 预算等级：${preferences.budget || "未指定（请提供均衡的建议）"}
    - 出行季节：${preferences.season || "未指定（请提及一般最佳旅行时间）"}
    - 同行人员：${preferences.companion || "未指定（通用）"}
    - 额外关注/备注："${preferences.additionalNotes || "无"}"

    指令：
    1. 使用 Google Search 工具研究这些具体 URL 中提到的内容、地点和行程。如果无法直接访问具体 URL 内容，请根据 URL 推断的目的地和主题进行搜索，以获取最新的最佳信息。
    2. 将所有信息综合成一份连贯的指南。不要只是列出网站；要融合它们的精华。
    3. **关键**：根据上述用户偏好量身定制建议。
       - 如果预算是经济型，专注于免费景点和便宜的美食。如果是豪华型，建议精致餐饮和独家体验。
       - 如果是家庭/亲子，查找适合儿童的活动。如果是情侣，寻找浪漫景点。
       - 如果指定了季节，请针对天气和季节性关闭情况进行调整。
    4. 使用 Google Search 核实事实（开放时间、门票价格、交通选项），确保指南是最新的。
    5. **必须使用中文（简体）撰写**。
    6. **图文并茂**：虽然你只能生成文本，但请充分使用 Emoji 图标（如 📍, 🍜, 🚗, 📸）来美化排版，让内容生动有趣，避免大段枯燥文字。
    7. 请按以下 Markdown 结构组织指南：
       - **🌟 核心摘要**: 旅行基调速览，特别针对${preferences.companion || '旅行者'}风格。
       - **📅 最佳旅行时间**: 天气和拥挤程度建议（特别是针对${preferences.season || '推荐季节'}）。
       - **🗺️ 每日行程规划**: 结合输入源精华的详细日程安排。
       - **📍 必游景点**: 包含实用贴士（例如“提前预订”）。
       - **🍴 美食推荐**: 针对${preferences.budget || '标准'}预算的当地特色和餐厅推荐。
       - **🚗 交通与住宿**: 交通方式、住宿区域建议及预算预估。
    
    语调要充满灵感、实用且条理清晰。使用项目符号、**加粗文本**强调重点。
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a world-class travel writer helping a user build the perfect trip summary from multiple sources. Always output in Simplified Chinese.",
        temperature: 0.4, // Lower temperature for more factual/grounded responses
      }
    });

    const markdownContent = response.text || "抱歉，我无法根据这些链接生成攻略。请尝试其他网址。";
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({
        title: web.title,
        uri: web.uri
      }));

    // Dedup sources
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      markdownContent,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate the travel guide. Please verify the URLs or try again later.");
  }
};