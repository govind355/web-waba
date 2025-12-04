import React, { useState } from 'react';
import AIPanel from './components/AIPanel';
import { Loader2, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#d1d7db]">
      {/* LEFT SIDE: WhatsApp Web Wrapper */}
      <div className="flex-1 relative flex flex-col min-w-0">
        
        {/* Loading Splash Screen (Behind Iframe) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 text-[#41525d] select-none">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                    alt="WhatsApp Logo" 
                    className="w-16 h-16"
                />
            </div>
            <div className="flex items-center gap-2 text-lg font-light text-gray-500">
                <Loader2 className="animate-spin text-[#00a884]" size={20} />
                <span>Loading WhatsApp...</span>
            </div>
            <p className="mt-8 text-xs text-gray-400 max-w-xs text-center">
                Authenticating with official web client.
                <br/>
                Please scan the QR code if prompted.
            </p>
        </div>

        {/* WhatsApp Iframe */}
        {/* 
           Note for Electron/Capacitor: 
           This iframe will load successfully if your wrapper strips 'X-Frame-Options' headers 
           or sets 'webPreferences: { webSecurity: false }' (though stripping headers is safer).
        */}
        <iframe 
          src="https://web.whatsapp.com/" 
          className="relative z-10 w-full h-full border-none bg-transparent"
          title="WhatsApp Web"
          allow="microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write; geolocation; fullscreen"
        />

        {/* Floating Toggle Button (Visible only when sidebar is closed) */}
        {!isPanelOpen && (
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="absolute bottom-6 right-6 z-50 bg-[#00a884] text-white p-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-105 hover:bg-[#008f6f] transition-all flex items-center justify-center"
            title="Open AI Tools"
          >
             <Bot size={24} />
          </button>
        )}
      </div>

      {/* RIGHT SIDE: AI Panel (Push Layout) */}
      {/* The container transitions width to create a smooth open/close effect without overlapping content */}
      <div 
        className={`bg-white border-l border-gray-200 z-20 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isPanelOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0'}`}
      >
        {/* We keep the inner component mounted to preserve chat state */}
        <div className="w-[360px] h-full">
            <AIPanel isOpen={isPanelOpen} toggleOpen={() => setIsPanelOpen(!isPanelOpen)} />
        </div>
      </div>
    </div>
  );
};

export default App;