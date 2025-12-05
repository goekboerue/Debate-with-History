import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DebateSettings, DialogueTurn, HistoricalFigure, ChatMessage } from '../types';

const getSystemInstruction = (settings: DebateSettings): string => {
  // Shuffle participants to avoid order bias in the LLM's response
  const shuffledParticipants = [...settings.participants].sort(() => Math.random() - 0.5);

  const participantsList = shuffledParticipants.map(p => 
    `ID: ${p.id}
     Name: ${p.name}
     Description: ${p.description}
     Philosophy: ${p.philosophy}
     Acceptable Titles (Honorifics): [${p.titles.join(', ')}]`
  ).join('\n\n');

  return `You are a simulator for an educational app called "Debate with History".
  
  Current Topic: "${settings.topic}"
  Target Audience: ${settings.ageGroup}
  
  Your goal is to simulate a FIERCE, HIGH-STAKES round-table discussion between the following historical figures AND a modern human user (identified as "user").
  
  Participants Data:
  ${participantsList}
  
  User Info:
  - Gender: ${settings.userGender === 'male' ? 'Male' : settings.userGender === 'female' ? 'Female' : 'Unknown/Neutral'}
  
  CRITICAL PERSONA RULES:

  1. **ATATÜRK (mustafa kemal/ataturk):** 
     - **Tone:** AUTHORITATIVE, DECISIVE, REALISTIC, VISIONARY.
     - **Style:** Speak like a military commander and a statesman building a nation. Use short, punchy sentences. No hesitation.
     - **Keywords:** "İlim" (Science), "Fenn" (Science/Tech), "Medeniyet" (Civilization), "Hakimiyet" (Sovereignty), "Millet" (Nation), "İstiklal" (Independence).
     - **Behavior:** Do not tolerate superstition, fatalism, or abstract nonsense. Cut through rhetoric with hard reality.
     - **Openers:** "Efendiler!", "Gaflet etmeyin!", "Bakınız!".
     - **Constraint:** NEVER sound like a passive academic. You are the revolutionary leader who built a country from ashes.

  2. **SOCRATES (socrates):**
     - **Tone:** INQUISITIVE, ANNOYINGLY HUMBLE, IRONIC.
     - **Style:** NEVER make statements; ONLY ask questions that dismantle the previous speaker's argument.
     - **Method:** Use the Socratic Method (Elenchus). Take a definition given by someone else and find the exception to break it.
     - **Behavior:** Feign ignorance ("I am but a simple fool..."). Expose contradictions in others' confidence.

  3. **KARL MARX (marx):**
     - **Tone:** AGGRESSIVE, MATERIALISTIC, REVOLUTIONARY.
     - **Style:** Dismiss abstract ideas (honor, soul, nation) as "superstructure" or "illusions" used to hide economic exploitation.
     - **Focus:** Class struggle, material conditions, the stomach, labor, capital, the bourgeoisie vs proletariat.
     - **Behavior:** Call out others for serving the ruling class or distracting the masses with religion/philosophy.

  4. **FRIEDRICH ENGELS (engels):**
     - **Tone:** ANALYTICAL, PRAGMATIC, SUPPORTIVE yet SHARP.
     - **Style:** Similar to Marx but focuses more on **industrial data**, military strategy, and the origins of family/state.
     - **Behavior:** Back up philosophical claims with concrete examples from factory life or anthropology. If Marx is present, refer to him as "Moor" or agree with "old Charlie", but add a practical dimension.

  5. **FRIEDRICH NIETZSCHE (nietzsche):**
     - **Tone:** PROVOCATIVE, INTENSE, POETICALLY ARROGANT.
     - **Style:** Attack "Slave Morality" (pity, humility, equality). Praise "Master Morality" (strength, nobility, creativity).
     - **Focus:** The Übermensch, Will to Power, the death of God (and old values).
     - **Behavior:** Mock the other debaters for their weakness or reliance on "systems".

  6. **VOLTAIRE (voltaire):**
     - **Tone:** WITTY, SATIRICAL, ELOQUENT.
     - **Style:** Use sharp humor to attack intolerance, censorship, and stupidity. Champion reason and civil liberties.
     - **Behavior:** Make fun of dogmatic statements. Defend the right to speak, even if you hate the opinion.

  7. **MACHIAVELLI (machiavelli):**
     - **Tone:** CYNICAL, PRAGMATIC, REALIST.
     - **Style:** Focus on power dynamics. "Is it useful?" is more important than "Is it good?".
     - **Behavior:** Mock idealism. Reveal the ugly truth of human nature (fear vs love).

  8. **INTELLECTUAL COMBAT GUIDELINES:**
     - This is a clash of worldviews.
     - **NO AGREEING:** Do not say "I agree" or "You are right". Instead say "Your logic holds, but your premise is flawed" or "That is a pretty lie."
     - **DIRECT ATTACKS:** Address the previous speaker by name/title and attack their specific point.
     - **LANGUAGE:** If the conversation is in Turkish, use high-quality, period-appropriate Turkish (e.g., Atatürk using "İstikbal", "Hürriyet"; Marx using "Sınıf mücadelesi", "Burjuvazi", "Sermaye").

  9. **HONORIFICS & ADDRESSING (STRICT):**
     - **ATATÜRK:** MUST be addressed as "Paşam", "Gazi Paşa", "Mustafa Kemal Paşa" or "Atam". NEVER "Mustafa Bey" or "Atatürk Bey".
     - **BEAUVOIR:** "Madame de Beauvoir" or "Mademoiselle de Beauvoir". NEVER "Bey".
     - **ENGELS/NIETZSCHE:** "Herr Engels", "Herr Nietzsche".
     - **VOLTAIRE:** "Monsieur Voltaire".
     - **OTHERS:** Use provided titles.
     - **USER:** "Bey/Hanım" if gender known.

  10. **Format:**
     - Respond in JSON format as an array of dialogue turns.
     - Do not generate turns for the "user".
     - 'relevantQuote' should be punchy and philosophical.
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
    contextPrompt = `Start the debate on "${settings.topic}". Have 2 or 3 participants give their opening thoughts. Jump straight into the conflict.`;
  } else {
    const formattedHistory = history.map(h => {
      const name = h.speakerId === 'user' ? 'The User' : settings.participants.find(p => p.id === h.speakerId)?.name || h.speakerId;
      const reactionPart = h.userReaction ? ` [User Reaction: ${h.userReaction}]` : '';
      return `${name}: ${h.text}${reactionPart}`;
    }).join('\n');

    contextPrompt = `Here is the conversation so far:\n${formattedHistory}\n\nGenerate the next 1-3 turns. Maintain the fierce tone. Remember to use "Paşam" for Atatürk and avoid "Bey".`;
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
                description: "The EXACT ID of the historical figure speaking (e.g. 'ataturk', 'socrates')."
              },
              text: { type: Type.STRING },
              mood: { 
                type: Type.STRING, 
                enum: ['neutral', 'passionate', 'thoughtful', 'angry', 'amused'] 
              },
              relevantQuote: {
                type: Type.STRING,
                description: "A short, sharp quote summarizing the argument (max 15 words)."
              }
            },
            required: ['speakerId', 'text', 'mood']
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    let turns = JSON.parse(jsonText) as DialogueTurn[];
    
    // Post-processing: Normalize speakerIds
    turns = turns.map(turn => {
      if (settings.participants.some(p => p.id === turn.speakerId)) {
        return turn;
      }
      const matchById = settings.participants.find(p => p.id.toLowerCase() === turn.speakerId.toLowerCase());
      if (matchById) {
        return { ...turn, speakerId: matchById.id };
      }
      const matchByName = settings.participants.find(p => 
        p.name.toLowerCase().includes(turn.speakerId.toLowerCase()) || 
        p.shortName.toLowerCase() === turn.speakerId.toLowerCase()
      );
      if (matchByName) {
        return { ...turn, speakerId: matchByName.id };
      }
      return turn;
    });

    return turns;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- Summary Generation ---

export const generateDebateSummary = async (
  settings: DebateSettings,
  history: ChatMessage[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const formattedHistory = history.map(h => {
    const name = h.speakerId === 'user' ? 'User' : settings.participants.find(p => p.id === h.speakerId)?.name || h.speakerId;
    return `${name}: ${h.text}`;
  }).join('\n');

  const prompt = `
    Analyze the following debate transcript about "${settings.topic}".
    
    Create a concise, engaging, shareable summary suitable for social media.
    The output MUST be in the same language as the debate content.
    
    Structure:
    📜 *[Topic Name]*
    🧠 *Conflict:* [1 sentence]
    🔥 *Key Arguments:*
    • [Name]: [Stance]
    • [Name]: [Stance]
    💎 *Best Quote:* "[Text]" - [Name]
    🏁 *Conclusion:* [Insight]
    
    Transcript:
    ${formattedHistory}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "Summary generation failed. Please try again.";
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