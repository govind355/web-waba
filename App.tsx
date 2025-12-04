
import React, { useState, useEffect } from 'react';
import AIPanel from './components/AIPanel';
import { Bot, Lock, RotateCcw, ShieldCheck, ExternalLink, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Robust check for Electron
    // Because we spoof UserAgent in electron.js, we cannot rely on navigator.userAgent.
    // Instead, we check for the process object injected by nodeIntegration: true
    const isNative = !!(window.process && window.process.versions && window.process.versions.electron);
    setIsElectron(isNative);
  }, []);

  const handleOpenWeb = () => {
    window.open('https://web.whatsapp.com/', '_blank');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#d1d7db] text-slate-800 font-sans">
      {/* LEFT SIDE: WhatsApp Area */}
      <div className="flex-1 relative flex flex-col min-w-0 shadow-xl z-10">
        
        {/* Header / Virtual Address Bar */}
        <div className="bg-[#f0f2f5] border-b border-gray-300 h-10 flex items-center px-4 gap-3 shrink-0">
            <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
                 <div className="bg-white px-3 py-1 rounded-md border border-gray-300 flex items-center gap-2 text-xs text-gray-600 w-full max-w-md shadow-sm">
                    <Lock size={10} className="text-green-600" />
                    <span className="flex-1 text-center font-mono text-[11px]">
                      {isElectron ? 'web.whatsapp.com (Native Wrapper)' : 'web.whatsapp.com (External Tab)'}
                    </span>
                    <RotateCcw size={10} className="cursor-pointer hover:text-black" onClick={() => window.location.reload()} />
                 </div>
            </div>
            <div className="w-10"></div> 
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-[#f0f2f5] flex flex-col">
             
            {/* SCENARIO A: ELECTRON (NATIVE) */}
            {isElectron && (
                <iframe 
                  src="https://web.whatsapp.com/" 
                  className="w-full h-full border-none"
                  title="WhatsApp Web"
                  allow="microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write; geolocation; fullscreen"
                />
            )}

            {/* SCENARIO B: BROWSER (FALLBACK) */}
            {!isElectron && (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5]">
                   <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
                       <div className="w-16 h-16 bg-[#25d366] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                           <Smartphone className="text-white" size={32} />
                       </div>
                       
                       <h2 className="text-2xl font-light text-gray-800 mb-2">Welcome to WhatsAI</h2>
                       <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                           To use WhatsApp inside this window, you must run this app using <b>Electron</b>. 
                           Currently, you are in a standard browser, so we can't embed WhatsApp directly.
                       </p>

                       <button 
                           onClick={handleOpenWeb}
                           className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                       >
                           Open WhatsApp Web <ExternalLink size={16} />
                       </button>

                       <div className="mt-6 pt-6 border-t border-gray-100 w-full">
                           <div className="flex items-start gap-3 text-left p-3 bg-blue-50 rounded-lg">
                               <ShieldCheck className="text-blue-600 mt-0.5" size={16} />
                               <div>
                                   <p className="text-xs font-semibold text-blue-800">Want the full experience?</p>
                                   <p className="text-[11px] text-blue-600 mt-1">
                                       Run <code className="bg-blue-100 px-1 rounded">npm run electron</code> in your terminal. This will launch a dedicated window where WhatsApp works perfectly alongside the AI.
                                   </p>
                               </div>
                           </div>
                       </div>
                   </div>
                   
                   <p className="mt-8 text-xs text-gray-400">
                       The AI Panel on the right is fully active! You can draft messages there.
                   </p>
               </div>
            )}
        </div>

        {/* Floating Toggle (Mobile/Closed State) */}
        {!isPanelOpen && (
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="absolute bottom-6 right-6 z-50 bg-[#00a884] text-white p-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-105 hover:bg-[#008f6f] transition-all flex items-center justify-center"
          >
             <Bot size={24} />
          </button>
        )}
      </div>

      {/* RIGHT SIDE: AI Panel */}
      <div 
        className={`bg-white border-l border-gray-200 z-20 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isPanelOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'}`}
      >
        <div className="w-[400px] h-full">
            <AIPanel isOpen={isPanelOpen} toggleOpen={() => setIsPanelOpen(!isPanelOpen)} />
        </div>
      </div>
    </div>
  );
};

export default App;
