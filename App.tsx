import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { DebateArena } from './components/DebateArena';
import { ChatMessage, DebateSettings } from './types';
import { generateDebateTurns } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<'setup' | 'debating'>('setup');
  const [settings, setSettings] = useState<DebateSettings | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Auto-save history when messages change
  useEffect(() => {
    if (!sessionId || !settings || stage !== 'debating') return;

    try {
      const history = JSON.parse(localStorage.getItem('debate_history') || '[]');
      const index = history.findIndex((h: any) => h.id === sessionId);

      if (index !== -1) {
        // Update existing session
        history[index].messages = messages;
        history[index].timestamp = Date.now();
        
        // Move to top
        const updatedItem = history.splice(index, 1)[0];
        history.unshift(updatedItem);
      } else {
        // Create new session entry if somehow missing (or first save)
        const newItem = {
          id: sessionId,
          ...settings,
          messages,
          timestamp: Date.now()
        };
        history.unshift(newItem);
      }

      // Limit to 20
      const trimmedHistory = history.slice(0, 20);
      localStorage.setItem('debate_history', JSON.stringify(trimmedHistory));
    } catch (e) {
      console.warn("Failed to auto-save history", e);
    }
  }, [messages, sessionId, settings, stage]);

  const handleStart = (newSettings: DebateSettings, initialMessages: ChatMessage[] = [], resumeId?: string) => {
    const id = resumeId || Date.now().toString();
    
    setSessionId(id);
    setSettings(newSettings);
    setMessages(initialMessages);
    setStage('debating');
    
    // If it's a completely new session, create the initial history entry immediately
    if (!resumeId) {
       try {
         const history = JSON.parse(localStorage.getItem('debate_history') || '[]');
         const newItem = {
            id,
            ...newSettings,
            messages: [],
            timestamp: Date.now()
         };
         const newHistory = [newItem, ...history].slice(0, 20);
         localStorage.setItem('debate_history', JSON.stringify(newHistory));
       } catch(e) {
         console.warn("Failed to create initial history", e);
       }
    }
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
    setSessionId(null);
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