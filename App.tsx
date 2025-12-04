
import React, { useState } from 'react';
import AIPanel from './components/AIPanel';
import { Loader2, Bot, Lock, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // We detect if we are likely in a standard browser (which blocks the iframe) vs Electron
  // This is a simple heuristic. In a real app, you'd use window.ipcRenderer checks.
  const isProbablyBrowser = !window.navigator.userAgent.includes('Electron');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#d1d7db] text-slate-800">
      {/* LEFT SIDE: WhatsApp Web Wrapper */}
      <div className="flex-1 relative flex flex-col min-w-0 shadow-xl z-10">
        
        {/* Virtual Browser Address Bar */}
        <div className="bg-[#f0f2f5] border-b border-gray-300 h-10 flex items-center px-4 gap-3 shrink-0">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
                 <div className="bg-white px-3 py-1 rounded-md border border-gray-300 flex items-center gap-2 text-xs text-gray-600 w-full max-w-md">
                    <Lock size={10} className="text-green-600" />
                    <span className="flex-1 text-center">web.whatsapp.com</span>
                    <RotateCcw size={10} className="cursor-pointer hover:text-black" onClick={() => window.location.reload()} />
                 </div>
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 relative bg-white">
             {/* Loading / Error State Overlay */}
             {isProbablyBrowser && (
                 <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5]">
                      <div className="bg-white p-6 rounded-2xl shadow-sm max-w-md">
                          <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                             <ShieldAlert className="text-green-600" size={24} />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Browser Security Restriction</h2>
                          <p className="text-sm text-gray-600 mb-6">
                              WhatsApp Web cannot be loaded inside a standard website iframe due to <b>X-Frame-Options</b> security headers.
                          </p>
                          
                          <button 
                             onClick={() => setShowInstructions(true)}
                             className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                             <Terminal size={16} />
                             How to Fix (Enable Electron)
                          </button>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-400">
                                  If you just want to test the AI Panel, you can use the sidebar on the right.
                              </p>
                          </div>
                      </div>
                 </div>
             )}

            {/* The Actual Iframe */}
            {/* In Electron with the provided 'electron.js', this will load perfectly over the warning above. */}
            <iframe 
              src="https://web.whatsapp.com/" 
              className="relative z-10 w-full h-full border-none"
              title="WhatsApp Web"
              allow="microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write; geolocation; fullscreen"
            />
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

      {/* Instructions Modal */}
      {showInstructions && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                      <h3 className="text-xl font-bold text-gray-800">Enable Virtual Browser Mode</h3>
                      <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-gray-600">
                          <ShieldAlert size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div className="space-y-2">
                          <p className="text-sm text-gray-600">To bypass the white screen, you must wrap this app in Electron and strip the security headers. Use the included <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500">electron.js</code> file.</p>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-left">
                          <pre className="text-xs text-green-400 font-mono leading-relaxed">
{`// electron.js (Main Process)
const { app, session } = require('electron');

app.whenReady().then(() => {
  // 1. Strip X-Frame-Options to allow Iframe
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['*://*.whatsapp.com/*'] },
    (details, callback) => {
      const headers = { ...details.responseHeaders };
      delete headers['x-frame-options']; // <--- THE MAGIC FIX
      delete headers['content-security-policy'];
      callback({ responseHeaders: headers });
    }
  );

  // 2. Spoof User Agent so WhatsApp thinks it's Chrome
  session.defaultSession.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...'
  );
});`}
                          </pre>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-800 mb-1">Why is this necessary?</h4>
                          <p className="text-xs text-blue-600">
                              WhatsApp Web sends a specific signal (`X-Frame-Options: DENY`) telling browsers "Do not let other websites embed me." 
                              Native wrappers like Electron have the power to ignore this signal, turning your app into a customized browser.
                          </p>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                      <button onClick={() => setShowInstructions(false)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-black">
                          Got it, I'll run in Electron
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
