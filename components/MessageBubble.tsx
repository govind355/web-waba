import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { Check, CheckCheck, Share } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isAI?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isAI }) => {
  const isSelf = message.role === 'user';
  
  // Format Time
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(message.text);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`flex w-full mb-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative max-w-[65%] px-2 py-1.5 rounded-lg shadow-sm text-[14.2px] leading-[19px] break-words
          ${isSelf ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
        `}
      >
        {/* Text Content */}
        <div className="px-1 pt-1 pb-4 text-[#111b21]">
            <ReactMarkdown 
                components={{
                    p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                    a: ({node, ...props}) => <a className="text-[#027eb5] hover:underline" target="_blank" {...props} />,
                }}
            >
                {message.text}
            </ReactMarkdown>
        </div>

        {/* Metadata & Actions */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
            {/* If it is an AI message, show a share/send button */}
            {!isSelf && isAI && (
                <button 
                    onClick={handleShareToWhatsApp}
                    className="opacity-50 hover:opacity-100 hover:text-[#25d366] transition-opacity mr-2"
                    title="Send this text to WhatsApp"
                >
                    <Share size={12} />
                </button>
            )}

            <span className="text-[11px] text-[#667781] min-w-fit">
                {time}
            </span>
            {isSelf && (
                <span className={`ml-0.5 ${message.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`}>
                    <CheckCheck size={16} />
                </span>
            )}
        </div>

        {/* Tail SVG */}
        <span className="absolute top-0 block w-2 h-3">
             {isSelf ? (
                 <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-2 fill-[#d9fdd3]">
                     <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                 </svg>
             ) : (
                 <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-2 fill-white scale-x-[-1]">
                     <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                 </svg>
             )}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
