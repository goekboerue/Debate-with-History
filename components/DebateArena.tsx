import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, DebateSettings, HistoricalFigure } from '../types';

interface DebateArenaProps {
  settings: DebateSettings;
  messages: ChatMessage[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onRestart: () => void;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ 
  settings, 
  messages, 
  isThinking, 
  onSend,
  onRestart
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Identify active speaker (last message)
  const activeSpeakerId = messages.length > 0 ? messages[messages.length - 1].speakerId : null;

  // Calculate positions for round table
  const participants = settings.participants;
  const radius = 140; // px
  
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - (Math.PI / 2); // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  const handleSendClick = () => {
    onSend(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-10">
        <h2 className="text-xl font-serif text-amber-500 truncate">{settings.topic}</h2>
        <button onClick={onRestart} className="text-xs text-gray-500 hover:text-white uppercase tracking-widest">
          End Session
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Visual Stage (Top on mobile, Left on desktop) */}
        <div className="flex-1 bg-[#121212] relative flex items-center justify-center min-h-[300px] md:min-h-auto order-1 md:order-1">
          {/* Background Decor */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* The Table */}
          <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center">
            {/* Table Surface */}
            <div className="absolute inset-8 rounded-full bg-neutral-800 border-4 border-amber-900/30 shadow-2xl flex items-center justify-center">
               <div className="text-center opacity-20 p-8">
                 <p className="font-serif text-4xl text-amber-700">Debate</p>
               </div>
            </div>

            {/* Participants */}
            {participants.map((participant, index) => {
              const pos = getPosition(index, participants.length);
              const isActive = participant.id === activeSpeakerId;
              
              return (
                <div 
                  key={participant.id}
                  className={`absolute transition-all duration-500 ease-out flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 transform -translate-x-1/2 -translate-y-1/2`}
                  style={{ 
                    left: `calc(50% + ${pos.x}px)`, 
                    top: `calc(50% + ${pos.y}px)`,
                    zIndex: isActive ? 20 : 10
                  }}
                >
                  <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
                    <img 
                      src={participant.avatarUrl} 
                      alt={participant.name} 
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 shadow-lg ${isActive ? 'border-amber-500 shadow-amber-500/20' : 'border-neutral-600 grayscale'}`}
                    />
                    {/* Name Badge */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-neutral-900/90 text-white text-[10px] md:text-xs px-2 py-1 rounded border border-neutral-700">
                      {participant.shortName}
                    </div>
                    
                    {/* Speaking Indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transcript / Chat (Bottom on mobile, Right on desktop) */}
        <div className="flex-1 md:max-w-xl bg-neutral-900 flex flex-col border-l border-neutral-800 h-[60%] md:h-auto z-20 order-2 md:order-2">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && !isThinking && (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-sm text-center px-8">
                The chamber is silent. Make a statement to begin, or simply listen.
              </div>
            )}
            
            {messages.map((msg) => {
              const isUser = msg.speakerId === 'user';
              const speaker = isUser 
                ? { shortName: 'You', id: 'user' } 
                : settings.participants.find(p => p.id === msg.speakerId);

              return (
                <div key={msg.id} className={`animate-slide-up flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`font-bold font-serif ${isUser ? 'text-blue-400' : 'text-amber-500'}`}>
                      {speaker?.shortName || 'Unknown'}
                    </span>
                    {!isUser && <span className="text-xs text-gray-600 uppercase">{msg.mood}</span>}
                  </div>
                  <p className={`leading-relaxed text-sm md:text-base p-3 rounded-xl max-w-[90%] ${
                    isUser 
                      ? 'bg-blue-900/30 text-blue-100 border border-blue-800/50 rounded-tr-none' 
                      : 'bg-neutral-800/50 text-neutral-300 border-l-2 border-neutral-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              );
            })}
            
            {isThinking && (
               <div className="animate-pulse flex items-center gap-2 text-gray-500 text-sm p-2">
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                 <span className="ml-2 font-serif italic">History is pondering...</span>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 bg-neutral-950 border-t border-neutral-800">
             <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your thoughts... (or leave empty to let them talk)"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  disabled={isThinking}
                />
                <button
                  onClick={handleSendClick}
                  disabled={isThinking}
                  className={`px-4 md:px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 border disabled:opacity-50 whitespace-nowrap ${
                    inputText.trim() 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-transparent' 
                    : 'bg-neutral-800 hover:bg-neutral-700 text-gray-300 border-neutral-700'
                  }`}
                >
                  {inputText.trim() ? "Speak" : "Listen"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};