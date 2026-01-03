
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Paper } from '../types';
import { Send, X, Bot, User } from 'lucide-react';
import { askQuestionAboutPaper } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ChatPanelProps {
  paper: Paper;
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ paper, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm ready to answer any questions you have about "${paper.title}".`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const answer = await askQuestionAboutPaper(paper, userMsg.text, history);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div 
      className={`fixed top-[73px] right-0 bottom-0 bg-surface border-l border-borderSkin shadow-xl transition-transform duration-300 transform w-full md:w-[450px] flex flex-col z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-borderSkin flex justify-between items-center bg-main">
        <h3 className="font-serif font-bold text-textMain flex items-center gap-2">
          <Bot size={18} className="text-amber-600"/> 
          Research Assistant
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-borderSkin rounded text-textMuted transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-main/50 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-textMain text-main' : 'bg-amber-100 text-amber-800'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm overflow-hidden ${
              msg.role === 'user' 
                ? 'bg-textMain text-main rounded-tr-none' 
                : 'bg-surface text-textMain border border-borderSkin rounded-tl-none'
            }`}>
              {/* React Markdown for perfect rendering */}
              <div className={`prose prose-sm max-w-none break-words ${
                 msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <Bot size={16} />
            </div>
            <div className="bg-surface border border-borderSkin px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t border-borderSkin">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-main border-none rounded-xl py-3 pl-4 pr-12 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-amber-200 focus:bg-surface transition-all placeholder:text-textMuted"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-textMain text-main rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
