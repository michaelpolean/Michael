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
    You are an expert travel consultant and itinerary planner. 
    
    Task: Create a comprehensive, "Master Travel Guide" based on the topics, destinations, and advice found in the following URLs:
    ${validUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
    
    User Preferences & Constraints:
    - Budget Level: ${preferences.budget || "Not specified (Provide a balanced mix)"}
    - Travel Season: ${preferences.season || "Not specified (Mention best times generally)"}
    - Travel Companions: ${preferences.companion || "Not specified (General)"}
    - Additional Focus/Notes: "${preferences.additionalNotes || "None"}"

    Instructions:
    1. Use the Google Search tool to research the content, locations, and itineraries mentioned in these specific URLs. If the specific URL content is not directly accessible, search for the destination and topic inferred from the URL to gather the best current information.
    2. Synthesize all information into a single, cohesive guide. Do not just list the websites; combine their wisdom.
    3. **CRITICAL**: Tailor the recommendations based on the User Preferences above. 
       - If Budget is Economy, focus on free attractions and cheap eats. If Luxury, suggest fine dining and exclusive experiences.
       - If Family/Kids, check for kid-friendly activities. If Couple, look for romantic spots.
       - If Season is specified, adjust for weather and seasonal closures.
    4. Verify facts (opening hours, ticket prices, transport options) using Google Search to ensure the guide is up-to-date.
    5. Structure the guide in Markdown with the following sections:
       - **Executive Summary**: A quick vibe check of the trip, specifically addressing the ${preferences.companion || 'traveler'} style.
       - **Best Time to Go**: Weather and crowd advice (specifically for ${preferences.season || 'the recommended season'}).
       - **Day-by-Day Itinerary**: A detailed schedule combining the best parts of the inputs.
       - **Must-See Attractions**: With practical tips (e.g., "book in advance").
       - **Food & Dining**: Recommendations tailored to the ${preferences.budget || 'standard'} budget.
       - **Logistics**: Transport, accommodation areas, and budget estimates.
    
    Make the tone inspiring, practical, and organized. Use bullet points, bold text for emphasis, and clear headings.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a world-class travel writer helping a user build the perfect trip summary from multiple sources.",
        temperature: 0.4, // Lower temperature for more factual/grounded responses
      }
    });

    const markdownContent = response.text || "Sorry, I couldn't generate a guide based on those links. Please try different URLs.";
    
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