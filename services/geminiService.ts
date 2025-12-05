import { GoogleGenAI, Type } from "@google/genai";
import { DebateSettings, DialogueTurn, HistoricalFigure, ChatMessage } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getSystemInstruction = (settings: DebateSettings): string => {
  const participantsList = settings.participants.map(p => 
    `${p.name} (Philosophy: ${p.philosophy}, Personality: ${p.description})`
  ).join('\n');

  return `You are a simulator for an educational app called "Debate with History".
  
  Current Topic: "${settings.topic}"
  Target Audience: ${settings.ageGroup}
  
  Your goal is to simulate a round-table discussion between the following historical figures:
  ${participantsList}
  
  Rules:
  1. Stay strictly in character. 
     - Socrates should ask probing questions.
     - Marx should focus on material conditions and power.
     - Atatürk should focus on reason, science, and national/human progress.
  2. The language should be appropriate for the "${settings.ageGroup}" audience.
     - For "Child", keep it simple, use analogies, avoid jargon.
     - For "Adult", use sophisticated philosophical arguments.
  3. Respond in JSON format as an array of dialogue turns.
  4. Ensure the debate flows naturally. Participants should respond to each other, not just state opinions in a vacuum.
  5. If the topic is modern (e.g., AI), the characters should interpret it through their historical lens (e.g., Marx seeing AI as a means of production, Socrates questioning what "intelligence" is).
  `;
};

export const generateDebateTurns = async (
  settings: DebateSettings,
  history: ChatMessage[]
): Promise<DialogueTurn[]> => {
  if (!apiKey) {
    console.error("No API Key provided");
    return [{ speakerId: 'system', text: 'Error: API Key missing.', mood: 'neutral' }];
  }

  const modelId = 'gemini-2.5-flash';

  // Construct context from history
  const contextPrompt = history.length === 0 
    ? `Start the debate on "${settings.topic}". Have 2 or 3 participants give their opening thoughts.`
    : `Here is the conversation so far:\n${history.map(h => `${h.speakerId}: ${h.text}`).join('\n')}\n\nGenerate the next 2-3 turns of the debate. Move the conversation forward or have them challenge each other.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: contextPrompt,
      config: {
        systemInstruction: getSystemInstruction(settings),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speakerId: { 
                type: Type.STRING,
                description: "The ID of the historical figure speaking (must match one of: " + settings.participants.map(p => p.id).join(', ') + ")"
              },
              text: { type: Type.STRING },
              mood: { 
                type: Type.STRING, 
                enum: ['neutral', 'passionate', 'thoughtful', 'angry', 'amused'] 
              }
            },
            required: ['speakerId', 'text', 'mood']
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const turns = JSON.parse(jsonText) as DialogueTurn[];
    return turns;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};