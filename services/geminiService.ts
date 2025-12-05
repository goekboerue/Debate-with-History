import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DebateSettings, DialogueTurn, HistoricalFigure, ChatMessage } from '../types';

const getSystemInstruction = (settings: DebateSettings): string => {
  const participantsList = settings.participants.map(p => 
    `${p.name} [Gender: ${p.gender}] (Philosophy: ${p.philosophy}, Personality: ${p.description})`
  ).join('\n');

  return `You are a simulator for an educational app called "Debate with History".
  
  Current Topic: "${settings.topic}"
  Target Audience: ${settings.ageGroup}
  
  Your goal is to simulate a round-table discussion between the following historical figures AND a modern human user (identified as "user").
  
  Participants:
  ${participantsList}
  
  User Info:
  - Gender: ${settings.userGender === 'male' ? 'Male' : settings.userGender === 'female' ? 'Female' : 'Unknown/Neutral'}
  
  Rules:
  1. Stay strictly in character for historical figures. 
     - Socrates should ask probing questions.
     - Marx should focus on material conditions and power.
     - Atatürk should focus on reason, science, and national/human progress.
     - Others should adhere to their defined philosophies.
  2. LANGUAGE ADAPTATION: The debate MUST be conducted in the language of the "Current Topic" or the user's input. 
     - If the topic is Turkish (e.g., "Yapay Zeka"), speak TURKISH.
     - If the user writes in Turkish, speak TURKISH.
     - If the topic is English, speak ENGLISH.
  3. HONORIFICS & GENDER (Crucial for Turkish):
     - You MUST address participants correctly based on their [Gender].
     - In Turkish: Use "Bey" for Male (e.g. "Socrates Bey", "Mustafa Kemal Bey").
     - In Turkish: Use "Hanım" for Female (e.g. "Simone Hanım", "Marie Hanım").
     - Address the USER based on their gender setting (Bey/Hanım) if known. If 'silent' or unknown, use neutral or polite language without specific gendered honorifics unless clear.
     - Do not address a Female character as "Bey".
  4. The language complexity should be appropriate for the "${settings.ageGroup}" audience.
  5. Respond in JSON format as an array of dialogue turns.
  6. Ensure the debate flows naturally. Participants should respond to each other AND to the user's input if the user has spoken.
  7. The USER is a participant at the table. If the user asks a question or makes a point, the historical figures should address it directly based on their worldviews.
  8. Do not generate turns for the "user". Only generate turns for historical figures.
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
    contextPrompt = `Start the debate on "${settings.topic}". Have 2 or 3 participants give their opening thoughts. Ensure the language matches the topic language.`;
  } else {
    const formattedHistory = history.map(h => {
      const name = h.speakerId === 'user' ? 'The User' : settings.participants.find(p => p.id === h.speakerId)?.name || h.speakerId;
      const reactionPart = h.userReaction ? ` [User Reaction: ${h.userReaction}]` : '';
      return `${name}: ${h.text}${reactionPart}`;
    }).join('\n');

    contextPrompt = `Here is the conversation so far:\n${formattedHistory}\n\nGenerate the next 1-3 turns of the debate. Maintain the language of the conversation. Pay attention to GENDER rules (Bey/Hanım) for Turkish.`;
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

// --- TTS Helper Functions ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<AudioBuffer> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    return audioBuffer;

  } catch (error) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};