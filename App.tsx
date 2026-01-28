
import React, { useState, useEffect } from 'react';
import { Topic, User, Message, Connection, Category } from './types';
import Header from './components/Header';
import TopicCard from './components/TopicCard';
import ChatRoom from './components/ChatRoom';
import SummaryView from './components/SummaryView';
import ProfileView from './components/ProfileView';
import PeersView from './components/PeersView';
import CreateTopicModal from './components/CreateTopicModal';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'summary' | 'profile' | 'peers' | 'rooms'>('home');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [user, setUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudMode, setIsCloudMode] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await apiService.init();
        const [fetchedTopics, fetchedUser, fetchedConnections] = await Promise.all([
          apiService.getTopics(),
          apiService.getUser(),
          apiService.getConnections()
        ]);
        setTopics(fetchedTopics);
        setUser(fetchedUser);
        setConnections(fetchedConnections);
        setIsCloudMode(apiService.isCloudConnected);
      } catch (error) {
        console.warn("Backend initialization error. Continuing in Local Mode.", error);
        setIsCloudMode(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeView === 'chat' && selectedTopic) {
      const unsubscribe = apiService.subscribeToMessages(selectedTopic.id, (topicMessages) => {
        setMessages(prev => ({
          ...prev,
          [selectedTopic.id]: topicMessages
        }));
      });
      return () => unsubscribe();
    }
  }, [activeView, selectedTopic]);

  const handleJoinChat = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveView('chat');
  };

  const sendMessage = async (topicId: string, text: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      anonymousName: user.anonymousName,
      text,
      timestamp: Date.now(),
    };
    await apiService.saveMessage(topicId, newMessage);
    if (!isCloudMode) {
      setMessages(prev => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), newMessage]
      }));
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
    await apiService.updateUser(updates);
  };

  const handleCreateTopic = async (newTopicData: { title: string, description: string, category: Category }) => {
    const newTopic = await apiService.createTopic({
      ...newTopicData,
      participantCount: 1,
      expiresAt: Date.now() + 86400000,
      isClosed: false
    });
    setTopics(prev => [newTopic, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    const newConn: Connection = {
      id: Math.random().toString(36),
      fromUserId: user.id,
      toUserId: targetUserId,
      status: 'pending'
    };
    await apiService.addConnection(newConn);
    setConnections(prev => [...prev, newConn]);
    alert("Connection request sent!");
  };

  const filteredTopics = topics.filter(t => filter === 'All' || t.category === filter);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Initializing Secure Node</h2>
          <p className="text-slate-500 text-sm font-mono">Checking cloud sync status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {!isCloudMode && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-1 text-center">
          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em]">
            Demo Mode: Local Persistence Active (Firebase Config Missing)
          </p>
        </div>
      )}
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onHomeClick={() => { setActiveView('home'); setSelectedTopic(null); }}
        userAvatar={user.avatar}
        anonymousName={user.anonymousName}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {(activeView === 'home' || activeView === 'rooms') && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {activeView === 'home' ? 'Trending Discussions' : 'Available Rooms'}
                </h1>
                <p className="text-slate-400">Join a topic and speak your mind, anonymously.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Discussion
                </button>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['All', 'College', 'Company', 'Lifestyle', 'Trending'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat as any)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        filter === cat 
                        ? 'bg-slate-700 text-white border border-blue-500/50' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.length > 0 ? filteredTopics.map(topic => (
                <TopicCard 
                  key={topic.id} 
                  topic={topic} 
                  onJoin={handleJoinChat}
                  onViewSummary={(t) => { setSelectedTopic(t); setActiveView('summary'); }}
                />
              )) : (
                <div className="col-span-full py-20 text-center text-slate-500 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                  <p>No active discussions found in "{filter}".</p>
                  <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 text-blue-400 hover:underline font-bold text-sm uppercase tracking-widest">Create the first one</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'chat' && selectedTopic && (
          <ChatRoom 
            topic={selectedTopic} 
            messages={messages[selectedTopic.id] || []} 
            currentUser={user}
            onSendMessage={(text) => sendMessage(selectedTopic.id, text)}
            onConnect={handleConnect}
            onBack={() => setActiveView('home')}
          />
        )}

        {activeView === 'summary' && selectedTopic && (
          <SummaryView 
            topic={selectedTopic} 
            messages={messages[selectedTopic.id] || []}
            onBack={() => setActiveView('home')}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView 
            user={user} 
            connections={connections}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeView === 'peers' && (
          <PeersView 
            connections={connections} 
            onViewProfile={() => setActiveView('profile')}
          />
        )}
      </main>

      <CreateTopicModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTopic}
      />

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 md:relative">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around px-6">
          <button onClick={() => setActiveView('home')} className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-blue-500' : 'text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
          </button>
          <button onClick={() => setActiveView('rooms')} className={`flex flex-col items-center gap-1 ${activeView === 'rooms' ? 'text-blue-500' : 'text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Rooms</span>
          </button>
          <button onClick={() => setActiveView('peers')} className={`flex flex-col items-center gap-1 ${activeView === 'peers' ? 'text-blue-500' : 'text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Peers</span>
          </button>
          <button onClick={() => setActiveView('profile')} className={`flex flex-col items-center gap-1 ${activeView === 'profile' ? 'text-blue-500' : 'text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full border overflow-hidden ${activeView === 'profile' ? 'border-blue-500' : 'border-slate-500'}`}>
              <img src={user.avatar} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Me</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
