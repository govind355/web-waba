import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ToolType, Message } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are an intelligent AI assistant integrated into a WhatsApp-like messaging interface. 
Your goal is to help users draft, refine, and understand messages. 
Keep your responses concise, friendly, and formatted for a chat application. 
Use emojis where appropriate. 
If asked to draft a message for WhatsApp, provide the text clearly so it can be copied or sent.
`;

export const sendMessageToGemini = async (history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "⚠️ I'm having trouble connecting right now. Please try again.";
  }
};

export const runAITool = async (type: ToolType, text: string, context?: string): Promise<string> => {
  let prompt = "";
  
  switch (type) {
    case ToolType.REWRITE:
      prompt = `Rewrite the following text to be more professional and clear, suitable for a business WhatsApp message. Return ONLY the rewritten text:\n\n"${text}"`;
      break;
    case ToolType.TRANSLATE:
      prompt = `Translate the following text to English (or to Spanish if it is already English). Return ONLY the translated text:\n\n"${text}"`;
      break;
    case ToolType.SUMMARIZE:
      prompt = `Summarize the following conversation/text into a single short sentence suitable for a quick status update. Return ONLY the summary:\n\n"${text}"`;
      break;
    case ToolType.REPLY_SUGGESTION:
      prompt = `Give me 3 short, relevant reply suggestions for the following message, separated by pipes (|). Example: "Yes, sure!|Maybe later|Can you call me?". Context: "${context || 'General chat'}". Message: "${text}"`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Tool Error:", error);
    return "";
  }
};

export const summarizeChatSession = async (messages: Message[]): Promise<string> => {
    if (messages.length === 0) return "No messages to summarize.";

    const conversationText = messages
        .map(m => `${m.role === 'user' ? 'Me' : 'Partner'}: ${m.text}`)
        .join('\n');

    const prompt = `
    Analyze the following WhatsApp conversation and provide a concise summary.
    
    Structure the summary as:
    1. **Topic**: One sentence on what the chat is about.
    2. **Key Points**: 3 bullet points of key details.
    3. **Action Items**: Any pending tasks or questions (if any).
    
    Conversation:
    ${conversationText}
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "Could not generate summary.";
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return "Failed to generate summary due to an error.";
    }
};
