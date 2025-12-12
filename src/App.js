import React, { useState, useEffect } from "react";

export default function ChristmasFriendPublicReveal() {
  // All participants
  const [entries, setEntries] = useState([]);
  
  // Chain of selections
  const [chain, setChain] = useState([]);
  
  // Currently selected person (who is revealing now)
  const [currentSelector, setCurrentSelector] = useState(null);
  
  // Revealed friend for current selector
  const [currentReveal, setCurrentReveal] = useState(null);
  
  // Whether the chain is complete
  const [isChainComplete, setIsChainComplete] = useState(false);
  
  // Loading states
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [dataMethod, setDataMethod] = useState(""); // "sample", "manual"
  
  // Manual data input
  const [manualData, setManualData] = useState("");

  // Instructions for Google Forms setup
  const setupInstructions = `HOW TO SET UP GOOGLE FORMS:

  1. CREATE YOUR GOOGLE FORM:
     • Go to forms.google.com
     • Create a new form
     • Add these questions (exactly):
       1. Email (Short answer)
       2. Name (Short answer)
       3. Role (Short answer) or (multiple choice)
       
  2. GET RESPONSES SHEET:
     • In form editor, click "Responses" tab
     • Click Google Sheets icon 📊
     • Create a new sheet
     • This creates a linked spreadsheet
  
  3. SHARE THE FORM:
     • Click "Send" button
     • Click link icon 🔗
     • Copy the form URL
     • Share with participants`;
     
  
    


  // Load sample data based on your Excel file
  const loadSampleData = () => {
    const sampleEntries = [
      { id: 1, name: "Sarah Alcott", role: "PhD" },
      { id: 2, name: "James Vance", role: "MSc" },
      { id: 3, name: "Linda Chen", role: "PhD" },
      { id: 4, name: "Marco Rossi", role: "PhD" },
      { id: 5, name: "Hannah Smith", role: "PostDoc" },
      { id: 6, name: "Deepak Kumar", role: "PhD" },
      { id: 7, name: "Alice White", role: "Admin" },     
    ];
    
    setEntries(sampleEntries);
    setDataMethod("sample");
    alert(`✅ Loaded ${sampleEntries.length} sample participants from your Excel file!`);
  };

  // Load data from manual input (paste from Excel)
  const loadManualData = () => {
    if (!manualData.trim()) {
      alert("Please paste data from your Excel/Google Sheet");
      return;
    }
    
    const lines = manualData.trim().split('\n');
    const processedEntries = [];
    
    lines.forEach((line, index) => {
      // Skip empty lines and header row if present
      if (!line.trim() || line.toLowerCase().includes("timestamp") || line.toLowerCase().includes("email")) {
        return;
      }
      
      // Split by tab or comma
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (parts.length >= 3) {
        // Assuming format: Timestamp, Email, Name, Role
        const name = parts[2]?.trim();
        const role = parts[3]?.trim() || "Participant";
        
        if (name && name !== "Name") {
          processedEntries.push({
            id: processedEntries.length + 1,
            name: name,
            role: role
          });
        }
      }
    });
    
    if (processedEntries.length > 0) {
      setEntries(processedEntries);
      setDataMethod("manual");
      alert(`✅ Loaded ${processedEntries.length} participants from pasted data!`);
    } else {
      alert("Could not parse data. Please copy exactly from your Excel file.");
    }
  };

  // Start chain with selected person
  const startChainWith = (person) => {
    if (chain.length > 0) {
      alert("Chain already started! Please continue with the next person.");
      return;
    }
    
    setCurrentSelector(person);
    setChain([{
      selector: person,
      selected: null,
      step: 1,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setIsChainComplete(false);
    setCurrentReveal(null);
  };

  // Get next person who needs to select
  const getNextSelector = () => {
    if (chain.length === 0) return null;
    
    // If starter hasn't selected yet, starter is next
    if (chain.length === 1 && !chain[0].selected) {
      return chain[0].selector;
    }
    
    const lastEntry = chain[chain.length - 1];
    
    // If chain is complete
    if (lastEntry.selected?.id === chain[0].selector.id) {
      return null;
    }
    
    // If someone was just selected, they should be the next selector
    if (lastEntry.selected) {
      return lastEntry.selected;
    }
    
    // Find people who haven't selected yet
    const allSelectors = chain.map(c => c.selector.id);
    const allSelected = chain.map(c => c.selected?.id).filter(id => id);
    const starter = chain[0].selector;
    
    const availableSelectors = entries.filter(e => 
      !allSelectors.includes(e.id) && 
      e.id !== starter.id
    );
    
    return availableSelectors[0] || null;
  };

  // Reveal friend for current selector
  const revealFriend = () => {
    if (!currentSelector) return;
    
    setLoadingReveal(true);
    
    setTimeout(() => {
      // Get available people for this selector
      const allSelectors = chain.map(c => c.selector.id);
      const allSelected = chain.map(c => c.selected?.id).filter(id => id);
      const unavailable = [...allSelectors, ...allSelected, currentSelector.id];
      
      let available = entries.filter(e => !unavailable.includes(e.id));
      
      // Special case: If only starter remains and we're at the last step
      const starter = chain[0].selector;
      if (available.length === 1 && available[0].id === starter.id) {
        const newSelection = {
          selector: currentSelector,
          selected: available[0],
          step: chain.length + 1,
          timestamp: new Date().toLocaleTimeString()
        };
        
        const newChain = [...chain, newSelection];
        setChain(newChain);
        setCurrentReveal(available[0]);
        setIsChainComplete(true);
      } else if (available.length > 0) {
        // Random selection from available pool
        const randomIdx = Math.floor(Math.random() * available.length);
        const selectedFriend = available[randomIdx];
        
        const newSelection = {
          selector: currentSelector,
          selected: selectedFriend,
          step: chain.length + 1,
          timestamp: new Date().toLocaleTimeString()
        };
        
        const newChain = [...chain, newSelection];
        setChain(newChain);
        setCurrentReveal(selectedFriend);
      } else {
        alert("No available friends to select!");
      }
      
      setLoadingReveal(false);
    }, 1500);
  };

  // Manual click for next person
  const manualNextPerson = () => {
    const nextSelector = getNextSelector();
    if (nextSelector) {
      setCurrentSelector(nextSelector);
      setCurrentReveal(null);
    }
  };

  // Reset everything
  const resetAll = () => {
    setChain([]);
    setCurrentSelector(null);
    setCurrentReveal(null);
    setIsChainComplete(false);
    setEntries([]);
    setDataMethod("");
    setManualData("");
  };

  // Check if current selector can reveal
  const canReveal = currentSelector && 
                    chain.length > 0 && 
                    !chain.find(c => c.selector.id === currentSelector.id && c.selected) &&
                    !currentReveal &&
                    getNextSelector()?.id === currentSelector.id;

  // Check if a participant can be clicked to start/continue
  const canClickParticipant = (person) => {
    if (chain.length === 0) return true; // Can start chain
    
    // Can only click if they're the next in chain
    const nextSelector = getNextSelector();
    return nextSelector?.id === person.id && !currentReveal;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🎄 Christmas Friend  Reveal 🎅
          </h1>
          <p className="text-xl text-yellow-200">
            Project on a big screen! Each person clicks when it's their turn!
          </p>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Setup & Participants */}
          <div className="space-y-8">
            {/* Setup Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">⚙️</span> Load Participants
              </h2>
              
              <div className="space-y-4">
                {/* Instructions */}
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-yellow-200 mb-3">📋 Setup Instructions</h3>
                  <div className="text-xs text-gray-300 whitespace-pre-line">
                    {setupInstructions}
                  </div>
                </div>
                
                {/* Option 2: Paste Data */}
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-blue-200 mb-3">Paste from Excel/Sheet</h3>
                  <textarea
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    placeholder="Paste your data here (copy from Excel or Google Sheets)"
                    className="w-full h-32 p-3 mb-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 resize-none"
                  />
                  <button
                    onClick={loadManualData}
                    className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg"
                  >
                    📋 Load Pasted Data
                  </button>
                </div>
              </div>
                                          
              {entries.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {entries.length} Participants Loaded
                    </div>
                    <div className="text-sm text-gray-300">
                      {dataMethod === "sample" && "Using your Excel data"}
                      {dataMethod === "manual" && "Using pasted data"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Participants List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3">👥</span> Participants
                </h2>
                <span className="text-lg font-bold text-yellow-300">
                  {entries.length}
                </span>
              </div>
              
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4 text-white/50">👥</div>
                  <div className="text-white/70 mb-2">No participants loaded</div>
                  <div className="text-sm text-gray-400">
                    Choose a loading option above
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {entries.map(person => {
                    const isSelector = chain.some(c => c.selector.id === person.id);
                    const isSelected = chain.some(c => c.selected?.id === person.id);
                    const isCurrent = currentSelector?.id === person.id;
                    const canClick = canClickParticipant(person);
                    
                    return (
                      <div
                        key={person.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isCurrent
                            ? 'border-yellow-400 bg-yellow-500/20 transform scale-[1.02]'
                            : isSelector && isSelected
                            ? 'border-green-400 bg-green-500/20'
                            : isSelector
                            ? 'border-blue-400 bg-blue-500/20'
                            : isSelected
                            ? 'border-purple-400 bg-purple-500/20'
                            : canClick && !currentReveal
                            ? 'border-white/40 bg-white/10 hover:bg-white/20 cursor-pointer'
                            : 'border-white/20 bg-white/5 opacity-70'
                        } ${canClick && !currentReveal ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
                        onClick={() => {
                          if (canClick && !currentReveal) {
                            if (chain.length === 0) {
                              startChainWith(person);
                            } else if (getNextSelector()?.id === person.id) {
                              setCurrentSelector(person);
                            }
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{person.name}</div>
                            <div className="text-xs text-gray-300">{person.role}</div>
                          </div>
                          <div className="text-xs">
                            {isCurrent && <span className="text-yellow-300 animate-pulse">🎤 NOW</span>}
                            {isSelector && isSelected && <span className="text-green-300">✓ DONE</span>}
                            {isSelector && !isSelected && canClick && <span className="text-blue-300">⏳ CLICK ME</span>}
                            {isSelector && !isSelected && !canClick && <span className="text-blue-300/50">⏳ WAITING</span>}
                            {!isSelector && isSelected && <span className="text-purple-300">🎁 SELECTED</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Main Stage */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Selection Stage */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl p-8 border-2 border-yellow-400/50">
              <div className="text-center mb-8">
                <div className="text-7xl mb-6">🎤</div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {currentSelector 
                    ? `${currentSelector.name}'s Turn` 
                    : entries.length > 0 
                    ? "Click a Name to Start Chain" 
                    : "Load Participants First"}
                </h2>
                <p className="text-xl text-gray-300">
                  {currentSelector 
                    ? "Click the button to reveal your Christmas Friend!"
                    : entries.length > 0
                    ? "First person: Click your name above to start"
                    : "Use one of the loading options on the left"}
                </p>
              </div>
              
              {/* Current Person Display */}
              {currentSelector && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-center">
                    <div className="text-2xl text-white mb-2">Currently Revealing:</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">
                      {currentSelector.name}
                    </div>
                    <div className="text-xl text-white/80">{currentSelector.role}</div>
                  </div>
                </div>
              )}
              
              {/* Reveal Button */}
              {currentSelector && canReveal && (
                <button
                  onClick={revealFriend}
                  disabled={loadingReveal}
                  className={`w-full py-6 rounded-2xl font-bold text-3xl mb-6 transition-all transform hover:scale-[1.02] ${
                    loadingReveal
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white hover:shadow-2xl animate-pulse'
                  }`}
                >
                  {loadingReveal ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mr-4"></span>
                      REVEALING...
                    </span>
                  ) : (
                    "🎯 CLICK TO REVEAL FRIEND!"
                  )}
                </button>
              )}
              
              {/* Next Person Info */}
              {chain.length > 0 && !isChainComplete && !currentReveal && getNextSelector() && (
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-6 border border-green-400/30">
                  <div className="text-center">
                    <div className="text-xl text-white mb-2">Next in Line:</div>
                    <div className="text-3xl font-bold text-green-300">
                      {getNextSelector()?.name}
                    </div>
                    <div className="text-sm text-gray-300 mt-2">
                      Click your name in the participant list when ready
                    </div>
                  </div>
                </div>
              )}
              
              {/* Manual Next Button */}
              {currentReveal && !isChainComplete && chain.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-400/30">
                  <div className="text-center">
                    <div className="text-xl text-white mb-2">Next Person's Turn</div>
                    <div className="text-3xl font-bold text-yellow-300 mb-4">
                      {getNextSelector()?.name}
                    </div>
                    <button
                      onClick={manualNextPerson}
                      className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg"
                    >
                      👉 Click to Pass to {getNextSelector()?.name}
                    </button>
                    <div className="text-sm text-gray-300 mt-2">
                      Or they can click their name in the list
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reveal Display */}
              {currentReveal ? (
                <div className="mt-8 p-8 bg-gradient-to-b from-green-900/80 to-emerald-900/80 rounded-2xl border-4 border-green-400/50 shadow-2xl">
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-6">✨</div>
                    <div className="text-3xl text-white/80 mb-4">
                      {currentSelector?.name}'s Christmas Friend is...
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border-4 border-yellow-400">
                      <div className="text-6xl font-bold text-yellow-300 mb-4">
                        {currentReveal.name}
                      </div>
                      <div className="text-2xl text-white/90">{currentReveal.role}</div>
                      <div className="mt-8 text-2xl text-white/70">
                        🎁 {currentSelector?.name} → {currentReveal.name} 🎁
                      </div>
                    </div>
                    {!isChainComplete && (
                      <div className="text-lg text-green-300 mt-6">
                        Next: {getNextSelector()?.name}
                      </div>
                    )}
                  </div>
                </div>
              ) : currentSelector && !canReveal ? (
                <div className="mt-8 p-8 bg-gradient-to-b from-blue-900/80 to-purple-900/80 rounded-2xl border-4 border-blue-400/50 shadow-2xl">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">⏳</div>
                    <div className="text-2xl mb-4">Waiting for {currentSelector.name} to reveal</div>
                    <div className="text-lg">Click the red button above when ready!</div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-8 bg-gradient-to-b from-blue-900/80 to-purple-900/80 rounded-2xl border-4 border-blue-400/50 shadow-2xl">
                  <div className="text-center text-white/60">
                    <div className="text-6xl mb-4">🎁</div>
                    <div className="text-2xl">Waiting for chain to start...</div>
                    <div className="text-lg mt-4">
                      {entries.length > 0 
                        ? "First person: Click your name in the participant list"
                        : "Load participants to begin"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chain Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🔗</span> Chain Progress
              </h2>
              
              {chain.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4 text-white/50">⏳</div>
                  <div className="text-white/70">Chain not started yet</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chain.map((step, index) => (
                    <div
                      key={index}
                      className={`relative p-4 rounded-xl border-2 ${
                        step.selector.id === currentSelector?.id
                          ? "border-yellow-400 bg-yellow-500/20"
                          : "border-white/20 bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                            {step.step}
                          </div>
                          <div>
                            <div className="text-xl font-bold text-white">{step.selector.name}</div>
                            <div className="text-sm text-gray-300">selected →</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">🎁</div>
                          <div className="text-right">
                            {step.selected ? (
                              <>
                                <div className="text-xl font-bold text-green-300">{step.selected.name}</div>
                                <div className="text-sm text-gray-300">{step.selected.role}</div>
                              </>
                            ) : (
                              <div className="text-yellow-300 font-bold text-xl">Waiting...</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {step.timestamp && (
                        <div className="text-xs text-gray-400 mt-2 text-right">
                          {step.timestamp}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isChainComplete && (
                    <div className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border-2 border-green-400/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-300 mb-2">🎉 Chain Complete!</div>
                        <div className="text-white/80">Everyone has been assigned a friend!</div>
                        <div className="text-sm text-gray-300 mt-2">
                          The loop is closed! 🎄→🎁→🎄
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300">{chain.length}</div>
                    <div className="text-sm text-gray-300">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">
                      {entries.length > 0 ? entries.length - chain.length - (chain.length > 0 ? 1 : 0) : 0}
                    </div>
                    <div className="text-sm text-gray-300">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">{entries.length}</div>
                    <div className="text-sm text-gray-300">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          {entries.length > 0 && (
            <>
              <button
                onClick={resetAll}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-lg"
              >
                🔄 Reset Everything
              </button>
              
              {chain.length > 0 && !isChainComplete && (
                <button
                  onClick={() => {
                    const next = getNextSelector();
                    if (next) {
                      setCurrentSelector(next);
                      setCurrentReveal(null);
                    }
                  }}
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-lg"
                >
                  ⏭️ Skip to Next Person
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-white/20">
          <div className="text-white/60">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <span className="animate-bounce">🎄</span>
              <span>Public Reveal • Project on Big Screen • Manual Click Progression</span>
              <span className="animate-bounce">🎁</span>
            </div>
            <div className="text-sm text-gray-400">
              {entries.length > 0 
                ? `${entries.length} participants • Chain: ${chain.length}/${entries.length} completed • ${isChainComplete ? '🎉 Complete!' : 'In Progress'}`
                : "Load participants to begin"}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
