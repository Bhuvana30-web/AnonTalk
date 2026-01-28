
import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onJoin: (t: Topic) => void;
  onViewSummary: (t: Topic) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onJoin, onViewSummary }) => {
  const isExpired = topic.isClosed;
  const timeLeft = Math.max(0, topic.expiresAt - Date.now());
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);

  return (
    <div className={`group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 ${isExpired ? 'opacity-90' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg">
          {topic.category}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {topic.participantCount}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {topic.title}
      </h3>
      <p className="text-slate-400 text-sm mb-6 line-clamp-2">
        {topic.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
          <span className={`text-xs font-medium ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isExpired ? 'Discussion Closed' : `${hoursLeft}h ${minutesLeft}m left`}
          </span>
        </div>

        {isExpired ? (
          <button 
            onClick={() => onViewSummary(topic)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            View Summary
          </button>
        ) : (
          <button 
            onClick={() => onJoin(topic)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
          >
            Join Live Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicCard;
