import React, { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { DebateArena } from './components/DebateArena';
import { ChatMessage, DebateSettings } from './types';
import { generateDebateTurns } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<'setup' | 'debating'>('setup');
  const [settings, setSettings] = useState<DebateSettings | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleStart = (newSettings: DebateSettings) => {
    setSettings(newSettings);
    setStage('debating');
  };

  const handleSend = async (text: string) => {
    if (!settings) return;

    // Create a temporary version of messages to send to API
    let updatedMessages = [...messages];

    // If user provided text, add it immediately to UI and history
    if (text.trim()) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        speakerId: 'user',
        text: text.trim(),
        mood: 'neutral' // User mood isn't really displayed
      };
      updatedMessages.push(userMsg);
      setMessages(updatedMessages);
    }

    setIsThinking(true);
    try {
      const turns = await generateDebateTurns(settings, updatedMessages);
      
      const newMessages: ChatMessage[] = turns.map((turn, index) => ({
        ...turn,
        id: Date.now().toString() + index,
        timestamp: Date.now() + index
      }));

      setMessages(prev => [...prev, ...newMessages]);

    } catch (error) {
      console.error("Failed to generate turns", error);
      alert("Failed to connect to the history spirits. Check your API key.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleRestart = () => {
    setStage('setup');
    setMessages([]);
    setSettings(null);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {stage === 'setup' && (
        <SetupScreen onStart={handleStart} />
      )}
      
      {stage === 'debating' && settings && (
        <DebateArena 
          settings={settings}
          messages={messages}
          isThinking={isThinking}
          onSend={handleSend}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;