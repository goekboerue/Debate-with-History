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
    // We don't auto-start the call here to give user time to see the arena, 
    // but the Arena component shows a "Begin" button.
  };

  const handleNextTurn = async () => {
    if (!settings) return;

    setIsThinking(true);
    try {
      const turns = await generateDebateTurns(settings, messages);
      
      // Add turns one by one with a small artificial delay for better UX flow, 
      // or just add them all. Adding all at once is safer for state simplicity 
      // but we need to map them to ChatMessages.
      
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
          onNextTurn={handleNextTurn}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;