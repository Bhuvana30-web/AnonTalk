
import React, { useState } from 'react';
import { Category } from '../types';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string, description: string, category: Category }) => void;
}

const CATEGORIES: Category[] = ['College', 'Company', 'Lifestyle', 'Trending'];

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Trending');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onCreate({ title, description, category });
    setTitle('');
    setDescription('');
    setCategory('Trending');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Start New Discussion</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    category === cat 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic Title</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Is the future of coding just AI prompt engineering?"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description / Prompt</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What specific questions should the community discuss?"
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className={`flex-1 py-3 px-6 font-bold rounded-2xl shadow-lg transition-all ${
                !title.trim() || !description.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-[1.02]'
              }`}
            >
              Launch Room
            </button>
          </div>
        </form>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
            All rooms are live for 24 hours. Be respectful and maintain anonymity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTopicModal;
