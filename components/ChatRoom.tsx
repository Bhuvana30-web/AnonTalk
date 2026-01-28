
import React, { useState, useRef, useEffect } from 'react';
import { Topic, Message, User } from '../types';
import { moderateMessage } from '../services/geminiService';

interface ChatRoomProps {
  topic: Topic;
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onConnect: (userId: string) => void;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ topic, messages, currentUser, onSendMessage, onConnect, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setIsSending(true);
    
    // Simple mock moderation check
    const isSafe = await moderateMessage(inputText);
    if (!isSafe) {
      alert("Message flagged by AI as potentially harmful. Please keep it respectful.");
      setIsSending(false);
      return;
    }

    onSendMessage(inputText);
    setInputText('');
    setIsSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{topic.title}</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Discussion
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map(i => (
            <img key={i} className="w-8 h-8 rounded-full border-2 border-slate-800" src={`https://picsum.photos/seed/${i+10}/50`} alt="user" />
          ))}
          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white font-bold">+28</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-center">No messages yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  {!isMe && (
                    <button 
                      onClick={() => onConnect(msg.userId)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-tight"
                    >
                      Connect
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{msg.anonymousName}</span>
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-600 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="relative flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your anonymous thought..."
            className="flex-1 min-h-[44px] max-h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          />
          <button 
            disabled={isSending || !inputText.trim()}
            onClick={handleSend}
            className={`p-2.5 rounded-xl transition-all ${
              !inputText.trim() ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/40'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 text-center uppercase tracking-widest font-medium">
          Encrypted & Anonymous Discussion
        </p>
      </div>
    </div>
  );
};

export default ChatRoom;
