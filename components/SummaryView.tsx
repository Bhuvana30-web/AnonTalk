
import React, { useState, useEffect } from 'react';
import { Topic, Message } from '../types';
import { summarizeChat } from '../services/geminiService';

interface SummaryViewProps {
  topic: Topic;
  messages: Message[];
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ topic, messages, onBack }) => {
  const [summary, setSummary] = useState<string | null>(topic.summary || null);
  const [isLoading, setIsLoading] = useState(!topic.summary);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!topic.summary && messages.length > 0) {
        const result = await summarizeChat(topic.title, messages);
        setSummary(result);
        setIsLoading(false);
      } else if (messages.length === 0 && !topic.summary) {
        setSummary("No messages were sent in this discussion window.");
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [topic, messages]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Discussion Summary</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
          <p className="text-slate-400">{topic.description}</p>
        </div>

        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 animate-pulse">Gemini AI is analyzing the discussion...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Total Participants</span>
              <span className="text-xl font-bold text-white">{topic.participantCount}</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Messages Sent</span>
              <span className="text-xl font-bold text-white">{messages.length || topic.participantCount * 3}</span>
            </div>
             <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Sentiment</span>
              <span className="text-xl font-bold text-emerald-400">Mostly Positive</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 text-center">
        <p className="text-blue-400 text-sm font-medium">
          This discussion is now archived. Identities remain hidden unless mutual connections were made during the live chat.
        </p>
      </div>
    </div>
  );
};

export default SummaryView;
