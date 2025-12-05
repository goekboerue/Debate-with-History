import React, { useState, useEffect } from 'react';
import { AgeGroup, DebateSettings, ChatMessage } from '../types';
import { HISTORICAL_FIGURES, SUGGESTED_TOPICS } from '../constants';

interface SetupScreenProps {
  onStart: (settings: DebateSettings, messages?: ChatMessage[], sessionId?: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [topic, setTopic] = useState(SUGGESTED_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.ADULT);
  const [selectedIds, setSelectedIds] = useState<string[]>(['ataturk', 'socrates', 'marx']);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('debate_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Loads settings into the form but DOES NOT start the debate (Clone Settings)
  const loadSettingsFromHistory = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (SUGGESTED_TOPICS.includes(item.topic)) {
      setTopic(item.topic);
      setCustomTopic('');
    } else {
      setTopic(SUGGESTED_TOPICS[0]); 
      setCustomTopic(item.topic);
    }
    setAgeGroup(item.ageGroup);
    if (item.participants && Array.isArray(item.participants)) {
      setSelectedIds(item.participants.map((p: any) => p.id));
    }
  };

  // Resume the session immediately
  const resumeSession = (item: any) => {
    const sessionSettings: DebateSettings = {
      topic: item.topic,
      ageGroup: item.ageGroup,
      participants: item.participants || []
    };
    onStart(sessionSettings, item.messages || [], item.id);
  };

  const deleteHistoryItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    try {
      const newHistory = [...history];
      newHistory.splice(index, 1);
      setHistory(newHistory);
      localStorage.setItem('debate_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  const toggleCharacter = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) { // Minimum 2
        setSelectedIds(selectedIds.filter(pid => pid !== id));
      }
    } else {
      if (selectedIds.length < 4) { // Maximum 4
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleStartNew = () => {
    const finalTopic = customTopic.trim() || topic;
    const participants = HISTORICAL_FIGURES.filter(f => selectedIds.includes(f.id));
    onStart({
      topic: finalTopic,
      ageGroup,
      participants
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in flex flex-col min-h-screen justify-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-4 text-amber-500 serif-font">Debate with History</h1>
        <p className="text-gray-400 text-lg">Select a modern topic and invite history's greatest minds to the table.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Left Column: Settings */}
        <div className="space-y-8 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-2xl">
          <div>
            <label className="block text-amber-500 font-semibold mb-2 uppercase tracking-wider text-xs">The Topic</label>
            <div className="space-y-3">
              <select 
                value={topic} 
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCustomTopic('');
                }}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
              >
                {SUGGESTED_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="Or type a custom topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-500 font-semibold mb-2 uppercase tracking-wider text-xs">Target Audience</label>
            <div className="flex gap-2">
              {Object.values(AgeGroup).map((age) => (
                <button
                  key={age}
                  onClick={() => setAgeGroup(age)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition font-medium ${
                    ageGroup === age 
                      ? 'bg-amber-600 text-white shadow-lg' 
                      : 'bg-neutral-900 text-gray-400 hover:bg-neutral-700'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-amber-500 font-semibold mb-2 uppercase tracking-wider text-xs">
               Select Participants ({selectedIds.length}/4)
             </label>
             <div className="grid grid-cols-1 gap-3">
               {HISTORICAL_FIGURES.map(figure => {
                 const isSelected = selectedIds.includes(figure.id);
                 return (
                   <button
                     key={figure.id}
                     onClick={() => toggleCharacter(figure.id)}
                     className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left border relative overflow-hidden group ${
                       isSelected
                         ? 'bg-neutral-900 border-amber-500/50 shadow-md'
                         : 'bg-transparent border-transparent hover:bg-neutral-700/50 opacity-70 hover:opacity-100'
                     }`}
                   >
                     {/* Selection Indicator Background */}
                     {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}

                     {/* Avatar */}
                     <div className={`relative p-0.5 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-neutral-600 group-hover:bg-neutral-500'}`}>
                        <img 
                          src={figure.avatarUrl} 
                          alt={figure.name} 
                          className={`w-12 h-12 rounded-full object-cover ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} 
                        />
                     </div>

                     <div className="flex-1 min-w-0">
                       <div className={`font-serif font-semibold text-lg ${isSelected ? 'text-amber-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                         {figure.name}
                       </div>
                       <div className="text-xs text-gray-500 truncate">{figure.philosophy}</div>
                     </div>

                     {/* Checkmark */}
                     <div className={`transform transition-transform ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-neutral-900">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Right Column: Preview / CTA / History */}
        <div className="flex flex-col justify-start items-center text-center space-y-6">
          <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full border-4 border-neutral-800 shadow-2xl flex items-center justify-center relative p-8">
            <div className="absolute inset-4 border border-dashed border-neutral-700 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }}></div>
            <p className="font-serif text-2xl italic text-gray-500">
              "The unexamined life is not worth living."
            </p>
          </div>
          
          <button 
            onClick={handleStartNew}
            disabled={selectedIds.length < 2 || (!topic && !customTopic)}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Enter the Chamber
          </button>

          {/* History Section */}
          {history.length > 0 && (
            <div className="w-full max-w-sm mt-8 pt-6 border-t border-neutral-800">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest text-left">Recent Sessions</h3>
                 {history.length > 0 && (
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{history.length} Saved</span>
                 )}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, idx) => (
                  <div key={idx} className="flex gap-2 group w-full">
                    <button 
                      onClick={() => resumeSession(item)}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-3 rounded-lg flex items-center gap-3 transition-colors text-left"
                    >
                       <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                          {item.participants.slice(0, 3).map((p: any) => (
                             <img 
                                key={p.id} 
                                src={p.avatarUrl} 
                                alt={p.name} 
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-neutral-900 object-cover grayscale group-hover:grayscale-0 transition-all" 
                             />
                          ))}
                          {item.participants.length > 3 && (
                             <div className="h-8 w-8 rounded-full bg-neutral-800 ring-2 ring-neutral-900 flex items-center justify-center text-[10px] text-gray-400">
                                +{item.participants.length - 3}
                             </div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-300 truncate group-hover:text-amber-500 transition-colors">
                             {item.topic}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-600">
                               {item.ageGroup}
                            </p>
                            {item.messages && item.messages.length > 0 && (
                              <span className="text-[10px] text-amber-500/80 bg-amber-900/20 px-1.5 py-0.5 rounded">
                                {item.messages.length} msgs
                              </span>
                            )}
                          </div>
                       </div>
                    </button>
                    
                    <div className="flex flex-col gap-1">
                      {/* Copy Settings Button */}
                      <button
                        onClick={(e) => loadSettingsFromHistory(e, item)}
                        className="h-full flex-1 px-3 bg-neutral-900 hover:bg-blue-900/20 border border-neutral-800 hover:border-blue-900/50 text-gray-600 hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center"
                        title="Copy Settings (Start New)"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                         </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => deleteHistoryItem(e, idx)}
                        className="h-full flex-1 px-3 bg-neutral-900 hover:bg-red-900/20 border border-neutral-800 hover:border-red-900/50 text-gray-600 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center"
                        title="Delete Session"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature */}
      <div className="mt-auto pt-8 pb-4 flex justify-center items-center opacity-40 hover:opacity-70 transition-opacity duration-700 cursor-default">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-900/50 to-transparent w-24 md:w-32 mr-4"></div>
        <p className="font-serif italic text-amber-500/80 text-sm md:text-base tracking-[0.2em] whitespace-nowrap">
          Cafer Ahmet Koç
        </p>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-900/50 to-transparent w-24 md:w-32 ml-4"></div>
      </div>
    </div>
  );
};