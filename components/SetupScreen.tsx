import React, { useState } from 'react';
import { AgeGroup, DebateSettings } from '../types';
import { HISTORICAL_FIGURES, SUGGESTED_TOPICS } from '../constants';

interface SetupScreenProps {
  onStart: (settings: DebateSettings) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [topic, setTopic] = useState(SUGGESTED_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.ADULT);
  const [selectedIds, setSelectedIds] = useState<string[]>(['ataturk', 'socrates', 'marx']);

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

  const handleStart = () => {
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

        {/* Right Column: Preview / CTA */}
        <div className="flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full border-4 border-neutral-800 shadow-2xl flex items-center justify-center relative p-8">
            <div className="absolute inset-4 border border-dashed border-neutral-700 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }}></div>
            <p className="font-serif text-2xl italic text-gray-500">
              "The unexamined life is not worth living."
            </p>
          </div>
          
          <button 
            onClick={handleStart}
            disabled={selectedIds.length < 2 || (!topic && !customTopic)}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Enter the Chamber
          </button>
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