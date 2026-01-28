
import React from 'react';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: any) => void;
  onHomeClick: () => void;
  userAvatar: string;
  anonymousName: string;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onHomeClick, userAvatar, anonymousName }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Unmask</span>
        </div>

        <div 
          className="flex items-center gap-4 cursor-pointer group px-2 py-1 rounded-xl hover:bg-slate-800/50 transition-all"
          onClick={() => setActiveView('profile')}
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-500">Posting as</span>
            <span className={`text-sm font-semibold transition-colors ${activeView === 'profile' ? 'text-blue-400' : 'text-slate-300 group-hover:text-blue-400'}`}>
              {anonymousName}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full bg-slate-800 border-2 transition-all overflow-hidden ${activeView === 'profile' ? 'border-blue-500 scale-110 shadow-lg shadow-blue-900/40' : 'border-slate-700 group-hover:border-blue-500/50'}`}>
            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
