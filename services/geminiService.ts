import { GoogleGenAI, Type } from "@google/genai";
import { DebateSettings, DialogueTurn, HistoricalFigure, ChatMessage } from '../types';

const getSystemInstruction = (settings: DebateSettings): string => {
  const participantsList = settings.participants.map(p => 
    `${p.name} (Philosophy: ${p.philosophy}, Personality: ${p.description})`
  ).join('\n');

  return `You are a simulator for an educational app called "Debate with History".
  
  Current Topic: "${settings.topic}"
  Target Audience: ${settings.ageGroup}
  
  Your goal is to simulate a round-table discussion between the following historical figures AND a modern human user (identified as "user").
  
  Participants:
  ${participantsList}
  
  Rules:
  1. Stay strictly in character for historical figures. 
     - Socrates should ask probing questions.
     - Marx should focus on material conditions and power.
     - Atatürk should focus on reason, science, and national/human progress.
     - Others should adhere to their defined philosophies.
  2. The language should be appropriate for the "${settings.ageGroup}" audience.
  3. Respond in JSON format as an array of dialogue turns.
  4. Ensure the debate flows naturally. Participants should respond to each other AND to the user's input if the user has spoken.
  5. The USER is a participant at the table. If the user asks a question or makes a point, the historical figures should address it directly based on their worldviews.
  6. Do not generate turns for the "user". Only generate turns for historical figures.
  `;
};

export const generateDebateTurns = async (
  settings: DebateSettings,
  history: ChatMessage[]
): Promise<DialogueTurn[]> => {
  // Initialize AI client here to pick up the latest process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("No API Key provided");
    throw new Error("API Key is missing. Please configure 'API_KEY' in your Vercel project settings or environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  // Construct context from history
  let contextPrompt = "";
  
  if (history.length === 0) {
    contextPrompt = `Start the debate on "${settings.topic}". Have 2 or 3 participants give their opening thoughts.`;
  } else {
    const formattedHistory = history.map(h => {
      const name = h.speakerId === 'user' ? 'The User' : settings.participants.find(p => p.id === h.speakerId)?.name || h.speakerId;
      return `${name}: ${h.text}`;
    }).join('\n');

    contextPrompt = `Here is the conversation so far:\n${formattedHistory}\n\nGenerate the next 1-3 turns of the debate. If the last message was from 'The User', ensure the historical figures respond to them effectively.`;
  }

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