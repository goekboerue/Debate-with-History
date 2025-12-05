import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChatMessage, DebateSettings, HistoricalFigure } from '../types';
import { generateSpeech } from '../services/geminiService';

interface DebateArenaProps {
  settings: DebateSettings;
  messages: ChatMessage[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onRestart: () => void;
  onReaction: (msgId: string, reaction: 'Agree' | 'Disagree' | 'Interesting') => void;
}

// Map characters to specific Gemini TTS voices
const VOICE_MAP: Record<string, string> = {
  ataturk: 'Fenrir', // Strong, authoritative
  rumi: 'Zephyr', // Soft, poetic, spiritual
  aquinas: 'Charon', // Deep, theological, heavy
  maimonides: 'Fenrir', // Strong, legalistic
  socrates: 'Charon', // Deep, old/wise
  marx: 'Puck', // Energetic
  churchill: 'Fenrir',
  curie: 'Kore', // Female
  beauvoir: 'Kore', // Female
  machiavelli: 'Puck',
  davinci: 'Zephyr', // Soft/Intellectual
  user: 'Zephyr' 
};

export const DebateArena: React.FC<DebateArenaProps> = ({ 
  settings, 
  messages, 
  isThinking, 
  onSend,
  onRestart,
  onReaction
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  
  // Audio Playback State
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Refs for State in Callbacks
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const autoPlayIndexRef = useRef<number>(-1);
  const isAutoPlayingRef = useRef<boolean>(false);
  const playbackReqRef = useRef<number>(0);

  // Initialize Audio Context on first interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        setAudioContext(ctx);
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, [audioContext]);
  
  // Auto-scroll logic
  useEffect(() => {
    // Only auto-scroll if we are NOT reading history (i.e. thinking or new message added while not playing old history)
    if (isThinking || (!playingMsgId && messages.length > 0)) {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Scroll to playing message
  useEffect(() => {
    if (playingMsgId) {
      const el = document.getElementById(`msg-${playingMsgId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [playingMsgId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio(true);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  // Generate random quote indices for each participant whenever message count changes.
  // This ensures variety as the conversation progresses.
  const quoteIndices = useMemo(() => {
    const map: Record<string, number> = {};
    settings.participants.forEach(p => {
      if (p.quotes.length > 0) {
        map[p.id] = Math.floor(Math.random() * p.quotes.length);
      }
    });
    return map;
  }, [messages.length, settings.participants]);

  const stopAudio = (resetIndex: boolean = false) => {
    // Invalidate pending async audio requests
    playbackReqRef.current += 1;

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.onended = null;
        currentSourceRef.current.stop();
      } catch (e) { /* ignore */ }
      currentSourceRef.current = null;
    }
    setPlayingMsgId(null);
    setIsAutoPlaying(false);
    isAutoPlayingRef.current = false;
    
    if (resetIndex) {
      autoPlayIndexRef.current = -1;
    }
  };

  const playNextInQueue = async () => {
    // Check ref to ensure we haven't stopped
    if (!isAutoPlayingRef.current) return;

    // If we were at the end, restart from beginning
    if (autoPlayIndexRef.current >= messages.length - 1) {
       autoPlayIndexRef.current = -1;
    }

    const nextIndex = autoPlayIndexRef.current + 1;
    
    if (nextIndex >= messages.length) {
      stopAudio(false); // Done playing, pause (don't hard reset so toggle can restart if needed, or handled by loop back above)
      return;
    }

    autoPlayIndexRef.current = nextIndex;
    const msg = messages[nextIndex];

    // Check for user silence setting
    if (msg.speakerId === 'user' && settings.userGender === 'silent') {
       // Skip this message, recurse to next
       setTimeout(() => playNextInQueue(), 500);
       return;
    }

    await playAudioForMessage(msg, true);
  };

  const playAudioForMessage = async (msg: ChatMessage, continueSequence: boolean) => {
    if (!audioContext) return;

    // Increment request ID to handle race conditions
    playbackReqRef.current += 1;
    const reqId = playbackReqRef.current;

    // Stop previous if exists
    if (currentSourceRef.current) {
      try { 
          currentSourceRef.current.onended = null;
          currentSourceRef.current.stop(); 
      } catch(e){}
      currentSourceRef.current = null;
    }

    setPlayingMsgId(msg.id);

    try {
      // Determine voice based on character or user setting
      let voice = VOICE_MAP[msg.speakerId] || 'Puck';
      
      if (msg.speakerId === 'user') {
        if (settings.userGender === 'male') voice = 'Fenrir';
        else if (settings.userGender === 'female') voice = 'Kore';
        else voice = 'Zephyr'; // Default if somehow silent not caught or other
      }

      const audioBuffer = await generateSpeech(msg.text, voice);
      
      // Check if this request is still valid (user hasn't clicked stop/next)
      if (reqId !== playbackReqRef.current) return;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        currentSourceRef.current = null;
        if (continueSequence && isAutoPlayingRef.current) {
          // Small delay for natural flow
          setTimeout(() => playNextInQueue(), 500); 
        } else if (!continueSequence) {
           setPlayingMsgId(null);
        }
      };

      currentSourceRef.current = source;
      source.start();

    } catch (error) {
      if (reqId === playbackReqRef.current) {
          console.error("Failed to play audio", error);
          setPlayingMsgId(null);
          // If error, try skip to next if auto playing
          if (continueSequence && isAutoPlayingRef.current) {
            setTimeout(() => playNextInQueue(), 1000);
          }
      }
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlayingRef.current) {
      stopAudio(false); // Pause, do not reset index
    } else {
      isAutoPlayingRef.current = true;
      setIsAutoPlaying(true);
      playNextInQueue();
    }
  };

  const handleSingleMessagePlay = (msg: ChatMessage, index: number) => {
    if (playingMsgId === msg.id) {
      stopAudio(false);
    } else {
      stopAudio(false); // Stop any existing sequence/audio
      autoPlayIndexRef.current = index; // Update index so "Listen Debate" continues from here
      playAudioForMessage(msg, false);
    }
  };

  // Determine who is currently SPEAKING (Audio)
  const currentAudioSpeakerId = playingMsgId 
    ? messages.find(m => m.id === playingMsgId)?.speakerId 
    : null;

  // Determine who is visually active (Last text message if no audio)
  const activeTextSpeakerId = messages.length > 0 ? messages[messages.length - 1].speakerId : null;
  
  // The figure to highlight is the audio speaker if playing, otherwise the last texter
  const visualFocusId = currentAudioSpeakerId || activeTextSpeakerId;

  // Calculate positions for round table
  const participants = settings.participants;
  const radius = 140; // px
  
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  const handleSendClick = () => {
    stopAudio(false); // Pause audio if user interrupts, keep index in case they resume
    onSend(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <h2 className="text-xl font-serif text-amber-500 truncate">{settings.topic}</h2>
          
          {/* Global Play Button */}
          {messages.length > 0 && (
            <button 
              onClick={toggleAutoPlay}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                isAutoPlaying 
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 animate-pulse' 
                : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                  Listening...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  {autoPlayIndexRef.current > -1 && autoPlayIndexRef.current < messages.length - 1 ? 'Resume' : 'Listen Debate'}
                </>
              )}
            </button>
          )}
        </div>

        <button onClick={onRestart} className="text-xs text-gray-500 hover:text-white uppercase tracking-widest ml-4 whitespace-nowrap">
          End Session
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Visual Stage */}
        <div className="flex-1 bg-[#121212] relative flex items-center justify-center min-h-[300px] md:min-h-auto order-1 md:order-1">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center">
            {/* Table */}
            <div className="absolute inset-8 rounded-full bg-neutral-800 border-4 border-amber-900/30 shadow-2xl flex items-center justify-center">
               <div className="text-center opacity-20 p-8">
                 <p className="font-serif text-4xl text-amber-700">Debate</p>
               </div>
            </div>

            {/* Participants */}
            {participants.map((participant, index) => {
              const pos = getPosition(index, participants.length);
              
              // Visual focus logic: 
              // If audio is playing, ONLY focus the speaker.
              // If silence, focus the last person who texted.
              const isSpeakingAudio = currentAudioSpeakerId === participant.id;
              const hasFocus = visualFocusId === participant.id;
              const quoteIndex = quoteIndices[participant.id] || 0;
              
              return (
                <div 
                  key={participant.id}
                  className={`absolute transition-all duration-500 ease-out flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 transform -translate-x-1/2 -translate-y-1/2`}
                  style={{ 
                    left: `calc(50% + ${pos.x}px)`, 
                    top: `calc(50% + ${pos.y}px)`,
                    zIndex: hasFocus ? 30 : 10
                  }}
                >
                  <div className={`relative transition-all duration-300 ${hasFocus ? 'scale-110' : 'scale-90 opacity-60 grayscale'}`}>
                    
                    {/* Floating Speech Bubble for Audio Speaker */}
                    {isSpeakingAudio && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-xl rounded-bl-none shadow-lg animate-bounce z-40 whitespace-nowrap flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                         <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse delay-75"></span>
                         <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse delay-150"></span>
                      </div>
                    )}

                    {/* Character Quote Bubble (Only if focussed and not showing generic speech dots) */}
                    {hasFocus && !isSpeakingAudio && participant.quotes.length > 0 && (
                       <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-48 bg-neutral-800/90 backdrop-blur-sm border border-amber-500/30 text-amber-100 p-3 rounded-lg shadow-xl z-50 text-center animate-fade-in pointer-events-none">
                          <p className="text-[10px] md:text-xs font-serif italic leading-tight">
                            "{participant.quotes[quoteIndex]}"
                          </p>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-neutral-800 border-r border-b border-amber-500/30 rotate-45"></div>
                       </div>
                    )}

                    <img 
                      src={participant.avatarUrl} 
                      alt={participant.name} 
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 shadow-lg transition-colors duration-300 ${
                        isSpeakingAudio 
                          ? 'border-amber-400 shadow-amber-500/50 ring-2 ring-amber-500/30' 
                          : hasFocus 
                            ? 'border-neutral-500 shadow-neutral-500/20' 
                            : 'border-neutral-700'
                      }`}
                    />
                    
                    <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] md:text-xs px-2 py-1 rounded border transition-colors ${
                      isSpeakingAudio
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-neutral-900/90 text-white border-neutral-700'
                    }`}>
                      {participant.shortName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 md:max-w-xl bg-neutral-900 flex flex-col border-l border-neutral-800 h-[60%] md:h-auto z-20 order-2 md:order-2 shadow-2xl">
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && !isThinking && (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-sm text-center px-8">
                The chamber is silent. Make a statement to begin.
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isUser = msg.speakerId === 'user';
              const speaker = isUser 
                ? { shortName: 'You', id: 'user' } 
                : settings.participants.find(p => p.id === msg.speakerId);
              
              const isPlaying = playingMsgId === msg.id;

              return (
                <div 
                  key={msg.id} 
                  id={`msg-${msg.id}`}
                  className={`animate-slide-up flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-opacity duration-500 ${
                    playingMsgId && !isPlaying ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className={`flex items-baseline gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`font-bold font-serif ${isUser ? 'text-blue-400' : 'text-amber-500'}`}>
                      {speaker?.shortName || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className={`relative p-3 rounded-xl max-w-[90%] group transition-all duration-300 ${
                    isUser 
                      ? 'bg-blue-900/30 text-blue-100 border border-blue-800/50 rounded-tr-none' 
                      : 'bg-neutral-800/50 text-neutral-300 border-l-2 border-neutral-700 rounded-tl-none'
                  } ${isPlaying ? 'ring-2 ring-amber-500/50 bg-neutral-800 shadow-lg scale-[1.02]' : ''}`}>
                    
                    <p className="leading-relaxed text-sm md:text-base mb-1">
                      {msg.text}
                    </p>
                    
                    {/* Individual Play Button */}
                    <button 
                      onClick={() => handleSingleMessagePlay(msg, idx)}
                      className={`absolute -right-8 bottom-0 p-1.5 rounded-full transition-all ${
                         isPlaying 
                         ? 'text-amber-500 bg-amber-900/20' 
                         : 'text-gray-600 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Play this message"
                    >
                      {isPlaying ? (
                        <span className="flex gap-0.5 items-end h-3">
                           <span className="w-0.5 h-2 bg-current animate-bounce"></span>
                           <span className="w-0.5 h-3 bg-current animate-bounce delay-75"></span>
                           <span className="w-0.5 h-1.5 bg-current animate-bounce delay-150"></span>
                        </span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Reaction Buttons (Only for non-user messages) */}
                  {!isUser && (
                    <div className="flex gap-2 mt-1 px-1">
                       <button 
                         onClick={() => onReaction(msg.id, 'Agree')}
                         className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                           msg.userReaction === 'Agree' 
                             ? 'bg-green-900/30 border-green-700 text-green-400' 
                             : 'bg-transparent border-transparent text-gray-600 hover:bg-neutral-800 hover:text-gray-400'
                         }`}
                       >
                         Agree
                       </button>
                       <button 
                         onClick={() => onReaction(msg.id, 'Disagree')}
                         className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                           msg.userReaction === 'Disagree' 
                             ? 'bg-red-900/30 border-red-700 text-red-400' 
                             : 'bg-transparent border-transparent text-gray-600 hover:bg-neutral-800 hover:text-gray-400'
                         }`}
                       >
                         Disagree
                       </button>
                       <button 
                         onClick={() => onReaction(msg.id, 'Interesting')}
                         className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                           msg.userReaction === 'Interesting' 
                             ? 'bg-blue-900/30 border-blue-700 text-blue-400' 
                             : 'bg-transparent border-transparent text-gray-600 hover:bg-neutral-800 hover:text-gray-400'
                         }`}
                       >
                         Interesting
                       </button>
                    </div>
                  )}

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

          <div className="p-4 bg-neutral-950 border-t border-neutral-800">
             <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendClick();
                    }
                  }}
                  placeholder="Share your thoughts..."
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
                  Speak
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};