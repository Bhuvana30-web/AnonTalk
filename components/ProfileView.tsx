
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, Connection } from '../types';

interface ProfileViewProps {
  user: User;
  connections: Connection[];
  onUpdateUser: (updates: Partial<User>) => void;
}

const PREDEFINED_AVATARS = [
  { url: 'https://picsum.photos/seed/fox/200', tags: 'fox animal orange' },
  { url: 'https://picsum.photos/seed/owl/200', tags: 'owl bird night' },
  { url: 'https://picsum.photos/seed/wolf/200', tags: 'wolf animal grey' },
  { url: 'https://picsum.photos/seed/cat/200', tags: 'cat pet kitty' },
  { url: 'https://picsum.photos/seed/deer/200', tags: 'deer forest animal' },
  { url: 'https://picsum.photos/seed/bear/200', tags: 'bear wild brown' },
  { url: 'https://picsum.photos/seed/hawk/200', tags: 'hawk bird predator' },
  { url: 'https://picsum.photos/seed/panda/200', tags: 'panda bamboo animal' },
  { url: 'https://picsum.photos/seed/robot/200', tags: 'robot tech future' },
  { url: 'https://picsum.photos/seed/alien/200', tags: 'alien space mystery' },
  { url: 'https://picsum.photos/seed/dragon/200', tags: 'dragon myth fire' },
  { url: 'https://picsum.photos/seed/tiger/200', tags: 'tiger cat wild' },
  { url: 'https://picsum.photos/seed/lion/200', tags: 'lion king cat' },
  { url: 'https://picsum.photos/seed/eagle/200', tags: 'eagle bird freedom' },
  { url: 'https://picsum.photos/seed/shark/200', tags: 'shark ocean water' },
  { url: 'https://picsum.photos/seed/whale/200', tags: 'whale sea giant' },
];

const ProfileView: React.FC<ProfileViewProps> = ({ user, connections, onUpdateUser }) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingAnonymousName, setIsEditingAnonymousName] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);
  const [tempAnonymousName, setTempAnonymousName] = useState(user.anonymousName);
  const [avatarSearch, setAvatarSearch] = useState('');
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const filteredAvatars = useMemo(() => {
    return PREDEFINED_AVATARS.filter(av => 
      av.tags.toLowerCase().includes(avatarSearch.toLowerCase())
    );
  }, [avatarSearch]);

  const handleAvatarSelect = (url: string) => {
    onUpdateUser({ avatar: url });
    setIsEditingAvatar(false);
    setAvatarSearch('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingImage(reader.result as string);
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBio = () => {
    onUpdateUser({ bio: tempBio });
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(user.bio);
    setIsEditingBio(false);
  };

  const handleSaveAnonymousName = () => {
    if (tempAnonymousName.trim()) {
      onUpdateUser({ anonymousName: tempAnonymousName.trim() });
      setIsEditingAnonymousName(false);
    }
  };

  const handleCancelAnonymousName = () => {
    setTempAnonymousName(user.anonymousName);
    setIsEditingAnonymousName(false);
  };

  const performCrop = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!ctx) return;

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth, drawHeight;

    if (imgAspect > 1) {
      drawHeight = size * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = size * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onUpdateUser({ avatar: croppedDataUrl });
    setCroppingImage(null);
    setIsEditingAvatar(false);
    setAvatarSearch('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="w-full md:w-1/3 bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center">
            <div className="group relative w-32 h-32 rounded-3xl border-4 border-blue-600 overflow-hidden mb-4 shadow-lg shadow-blue-900/20">
              <img src={user.avatar} alt={user.realName} className="w-full h-full object-cover" />
              <button 
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white">{user.realName}</h2>
            
            {/* Anonymous Name Editor */}
            <div className="mb-4 w-full">
              {isEditingAnonymousName ? (
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                    <input
                      type="text"
                      value={tempAnonymousName}
                      onChange={(e) => setTempAnonymousName(e.target.value.replace(/\s+/g, '_'))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-sm text-blue-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="anonymous_handle"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveAnonymousName}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancelAnonymousName}
                      className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group/handle">
                  <p className="text-blue-400 font-medium">@{user.anonymousName}</p>
                  <button 
                    onClick={() => setIsEditingAnonymousName(true)}
                    className="opacity-0 group-hover/handle:opacity-100 text-slate-500 hover:text-blue-400 transition-all p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="w-full mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">About Me</span>
                {!isEditingBio && (
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[100px]"
                    placeholder="Tell the community about yourself..."
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveBio}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancelBio}
                      className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  "{user.bio}"
                </p>
              )}
            </div>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isEditingAvatar ? 'bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {isEditingAvatar ? 'Cancel Avatar Edit' : 'Change Avatar'}
              </button>
            </div>
          </div>

          {/* Avatar Selector Overlay */}
          {isEditingAvatar && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col z-10 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Choose Avatar</h3>
                <button 
                  onClick={() => { setIsEditingAvatar(false); setAvatarSearch(''); }} 
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search (e.g. cat, bird, space)..."
                  value={avatarSearch}
                  onChange={(e) => setAvatarSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-6 flex-1 overflow-y-auto pr-1">
                {filteredAvatars.length > 0 ? (
                  filteredAvatars.map((av, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleAvatarSelect(av.url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        user.avatar === av.url ? 'border-blue-500 scale-95' : 'border-transparent hover:border-slate-600'
                      }`}
                    >
                      <img src={av.url} alt={`Option ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))
                ) : (
                  <div className="col-span-4 flex flex-col items-center justify-center py-8 text-slate-600 italic text-xs">
                    No matching avatars
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Custom
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details & Connections */}
        <div className="flex-1 space-y-8">
          <section className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Verified Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">College</span>
                <span className="text-white font-medium">{user.details.college}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Current Company</span>
                <span className="text-white font-medium">{user.details.company}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 sm:col-span-2">
                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Lifestyle Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.details.lifestyle?.split(',').map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-600/10 text-blue-400 text-xs rounded-lg border border-blue-500/20">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              My Connections
            </h3>
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No identities unmasked yet. Start chatting to make friends!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{conn.status === 'accepted' ? 'John Doe' : 'Anonymous User'}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-tighter">Status: {conn.status}</p>
                      </div>
                    </div>
                    {conn.status === 'pending' ? (
                      <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-[10px] font-bold uppercase rounded-lg">Pending Reveal</span>
                    ) : (
                      <button className="text-blue-400 text-sm font-bold hover:underline">View Profile</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Image Cropping Modal */}
      {croppingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Crop Avatar</h3>
              <button onClick={() => setCroppingImage(null)} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {/* Cropping Viewport */}
              <div className="relative w-64 h-64 bg-slate-900 rounded-3xl border-2 border-dashed border-slate-700 overflow-hidden shadow-inner mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    ref={imgRef}
                    src={croppingImage} 
                    alt="To crop" 
                    className="max-w-none transition-transform duration-75 origin-center"
                    style={{ 
                      transform: `scale(${zoom})`,
                      objectFit: 'contain'
                    }}
                  />
                </div>
                {/* Guide Lines */}
                <div className="absolute inset-0 pointer-events-none border border-blue-500/30 rounded-3xl"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 pointer-events-none"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 pointer-events-none"></div>
              </div>

              {/* Zoom Control */}
              <div className="w-full max-w-xs space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Zoom</span>
                  <span className="text-blue-400">{Math.round(zoom * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.01" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setCroppingImage(null)}
                  className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={performCrop}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02]"
                >
                  Save Avatar
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
