
import React from 'react';
import { Connection } from '../types';

interface PeersViewProps {
  connections: Connection[];
  onViewProfile: () => void;
}

const PeersView: React.FC<PeersViewProps> = ({ connections, onViewProfile }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">My Peers</h2>
        <p className="text-slate-400">People you've successfully unmasked through deep discussion.</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-xl">
        {connections.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No peers unmasked yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Join active rooms, contribute meaningfully, and request to connect to reveal identities.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} // Quick hack to go to rooms
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              Discover Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {connections.map(conn => (
              <div key={conn.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-700 group hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                       <img src={`https://picsum.photos/seed/${conn.id}/100`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    {conn.status === 'accepted' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                      {conn.status === 'accepted' ? `User ${conn.id.slice(0, 4)}` : 'Anonymous Peer'}
                    </h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      Connected via {conn.status === 'accepted' ? 'Direct Reveal' : 'Pending Request'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {conn.status === 'pending' ? (
                     <span className="px-3 py-1 bg-yellow-600/10 text-yellow-400 text-[10px] font-bold uppercase rounded-lg border border-yellow-500/20">
                      Awaiting Reveal
                    </span>
                  ) : (
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-3xl text-center">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Connections</span>
          <span className="text-3xl font-bold text-white">{connections.length}</span>
        </div>
        <div className="bg-slate-800/30 border border-slate-700 p-6 rounded-3xl text-center">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Revealed Identity</span>
          <span className="text-3xl font-bold text-emerald-400">{connections.filter(c => c.status === 'accepted').length}</span>
        </div>
      </div>
    </div>
  );
};

export default PeersView;
