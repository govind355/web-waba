import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare, Bot, FileText, Languages, PenTool, Loader2, Clipboard, ChevronRight } from 'lucide-react';
import { sendMessageToGemini, runAITool } from '../services/gemini';
import { ToolType } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIPanelProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const AIPanel: React.FC<AIPanelProps> = ({ isOpen, toggleOpen }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tools'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
      { role: 'model', text: 'Hi! I am your WhatsApp AI Companion. Paste a chat here to summarize it, or ask me to draft a message for you.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tool States
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        // Convert local message format to Gemini format
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        
        const response = await sendMessageToGemini(history, userMsg);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const executeTool = async (type: ToolType) => {
      if (!toolInput.trim()) return;
      setActiveTool(type);
      setIsLoading(true);
      setToolOutput('');

      try {
          const result = await runAITool(type, toolInput);
          setToolOutput(result);
      } catch (e) {
          setToolOutput("Error processing request.");
      } finally {
          setIsLoading(false);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-white shadow-2xl border-l border-gray-200 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-[#00a884] text-white p-4 flex items-center justify-between shadow-md z-10">
         <div className="flex items-center gap-2 font-medium">
            <Bot size={20} />
            WhatsAI Companion
         </div>
         <button onClick={toggleOpen} className="hover:bg-[#008f6f] p-1.5 rounded-full transition-colors">
            <X size={20} />
         </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'text-[#00a884] border-b-2 border-[#00a884] bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
             <MessageSquare size={16} /> Chat
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'tools' ? 'text-[#00a884] border-b-2 border-[#00a884] bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
             <Sparkles size={16} /> Tools
          </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#efeae2] relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>
         
         {activeTab === 'chat' ? (
             <div className="p-4 flex flex-col gap-4 min-h-full">
                 {messages.map((m, i) => (
                     <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${m.role === 'user' ? 'bg-[#d9fdd3] text-gray-800' : 'bg-white text-gray-800'}`}>
                             <ReactMarkdown>{m.text}</ReactMarkdown>
                         </div>
                     </div>
                 ))}
                 {isLoading && activeTab === 'chat' && (
                     <div className="flex justify-start">
                         <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                             <Loader2 size={16} className="animate-spin text-gray-500"/>
                         </div>
                     </div>
                 )}
                 <div ref={messagesEndRef} />
             </div>
         ) : (
             <div className="p-4 flex flex-col gap-4 z-10 relative">
                 <div className="bg-white p-4 rounded-lg shadow-sm">
                     <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Input Text / Chat</label>
                     <textarea 
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        placeholder="Paste WhatsApp messages here or type a draft..."
                        className="w-full text-sm p-2 border border-gray-200 rounded focus:border-[#00a884] outline-none min-h-[100px] resize-none"
                     />
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => executeTool(ToolType.SUMMARIZE)}
                        disabled={isLoading}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 flex flex-col items-center gap-2 text-gray-600 transition-all"
                     >
                         <FileText size={20} className="text-orange-500" />
                         <span className="text-xs font-medium">Summarize</span>
                     </button>
                     <button 
                        onClick={() => executeTool(ToolType.REWRITE)}
                        disabled={isLoading}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 flex flex-col items-center gap-2 text-gray-600 transition-all"
                     >
                         <PenTool size={20} className="text-purple-500" />
                         <span className="text-xs font-medium">Fix Grammar</span>
                     </button>
                     <button 
                        onClick={() => executeTool(ToolType.TRANSLATE)}
                        disabled={isLoading}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 flex flex-col items-center gap-2 text-gray-600 transition-all"
                     >
                         <Languages size={20} className="text-blue-500" />
                         <span className="text-xs font-medium">Translate</span>
                     </button>
                      <button 
                        onClick={() => executeTool(ToolType.REPLY_SUGGESTION)}
                        disabled={isLoading}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 flex flex-col items-center gap-2 text-gray-600 transition-all"
                     >
                         <MessageSquare size={20} className="text-green-500" />
                         <span className="text-xs font-medium">Suggest Reply</span>
                     </button>
                 </div>

                 {isLoading && activeTab === 'tools' && (
                     <div className="flex items-center justify-center py-4 text-[#00a884]">
                         <Loader2 size={24} className="animate-spin" />
                     </div>
                 )}

                 {toolOutput && (
                     <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#00a884] overflow-hidden animate-in slide-in-from-bottom-2">
                         <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                             <span className="text-xs font-semibold text-gray-500 uppercase">AI Result</span>
                             <button onClick={() => copyToClipboard(toolOutput)} className="text-gray-400 hover:text-[#00a884]" title="Copy">
                                 <Clipboard size={14} />
                             </button>
                         </div>
                         <div className="p-3 text-sm text-gray-800 whitespace-pre-wrap">
                             {toolOutput}
                         </div>
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Input Footer (Only for Chat Tab) */}
      {activeTab === 'chat' && (
          <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
             <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-white focus-within:border-gray-300">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Gemini..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className={`ml-2 p-1.5 rounded-full transition-all ${input.trim() ? 'text-[#00a884] hover:bg-gray-100' : 'text-gray-300'}`}
                 >
                     <Send size={18} />
                 </button>
             </div>
          </div>
      )}
    </div>
  );
};

export default AIPanel;