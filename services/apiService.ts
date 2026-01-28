
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  updateDoc,
  Firestore
} from "firebase/firestore";
import { Topic, Message, User, Connection } from '../types';

// CONFIGURATION: Replace with your actual Firebase project credentials from the Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Strict check: Is the config actually provided or still the placeholder?
const isConfigPlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === "YOUR_API_KEY" || 
  firebaseConfig.projectId === "YOUR_PROJECT_ID";

let db: Firestore | null = null;
let app: FirebaseApp | null = null;

if (!isConfigPlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (e) {
    console.warn("Firebase initialization failed. Falling back to Local Storage.", e);
  }
} else {
  console.info("Firebase config not detected. Running in Local Persistence mode.");
}

const STORAGE_KEYS = {
  TOPICS: 'unmask_local_topics',
  USER: 'unmask_local_user',
  CONNECTIONS: 'unmask_local_connections',
  MESSAGES: 'unmask_local_messages'
};

const DEFAULT_USER: User = {
  id: 'me',
  realName: 'Alex Rivera',
  anonymousName: 'Vagabond_Traveler',
  avatar: 'https://picsum.photos/seed/alex/200',
  bio: 'Software engineer by day, musician by night.',
  details: {
    college: 'Stanford University',
    company: 'Google',
    lifestyle: 'Minimalist, Coffee Enthusiast'
  }
};

// --- Local Storage Fallback Implementation ---
const localBackend = {
  getTopics: (): Topic[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]'),
  setTopics: (topics: Topic[]) => localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics)),
  getUser: (): User => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || JSON.stringify(DEFAULT_USER)),
  setUser: (user: User) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
  getMessages: (topicId: string): Message[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    return all[topicId] || [];
  },
  saveMessage: (topicId: string, msg: Message) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    all[topicId] = [...(all[topicId] || []), msg];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  },
  getConnections: (): Connection[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CONNECTIONS) || '[]'),
  addConnection: (conn: Connection) => {
    const all = localBackend.getConnections();
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify([...all, conn]));
  }
};

export const apiService = {
  get isCloudConnected(): boolean {
    return db !== null;
  },

  init: async () => {
    if (db) {
      try {
        const userDocRef = doc(db, "users", "me");
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, DEFAULT_USER);
        }
      } catch (e) {
        console.error("Firestore init error (Possible permission issue or offline):", e);
        // Do not nullify db here, just let individual calls handle the fallback
      }
    }
    // Ensure default topics exist in local storage if empty
    if (localBackend.getTopics().length === 0) {
      localBackend.setTopics([
        {
          id: '1',
          title: 'Is AI going to replace junior developers?',
          description: 'A discussion on the future of the tech industry.',
          category: 'Trending',
          participantCount: 42,
          expiresAt: Date.now() + 86400000,
          isClosed: false
        }
      ]);
    }
  },

  getTopics: async (): Promise<Topic[]> => {
    if (db) {
      try {
        const snapshot = await getDocs(query(collection(db, "topics"), orderBy("expiresAt", "desc")));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Topic));
      } catch (e) { 
        console.warn("Falling back to local topics");
        return localBackend.getTopics(); 
      }
    }
    return localBackend.getTopics();
  },

  createTopic: async (topicData: Omit<Topic, 'id'>): Promise<Topic> => {
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "topics"), topicData);
        return { id: docRef.id, ...topicData };
      } catch (e) { console.error("Cloud createTopic failed:", e); }
    }
    const topic = { id: Math.random().toString(36).substr(2, 9), ...topicData };
    localBackend.setTopics([topic, ...localBackend.getTopics()]);
    return topic;
  },

  subscribeToMessages: (topicId: string, callback: (messages: Message[]) => void) => {
    if (db) {
      try {
        const messagesCol = collection(db, `topics/${topicId}/messages`);
        const q = query(messagesCol, orderBy("timestamp", "asc"));
        return onSnapshot(q, (snapshot) => {
          callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
        }, (err) => {
          console.error("Snapshot subscription failed:", err);
          callback(localBackend.getMessages(topicId));
        });
      } catch (e) {
        console.warn("Subscription failed, using local polling");
        callback(localBackend.getMessages(topicId));
        return () => {};
      }
    }
    callback(localBackend.getMessages(topicId));
    return () => {};
  },

  saveMessage: async (topicId: string, message: Message): Promise<void> => {
    if (db) {
      try {
        await addDoc(collection(db, `topics/${topicId}/messages`), message);
        return;
      } catch (e) { console.error("Cloud saveMessage failed:", e); }
    }
    localBackend.saveMessage(topicId, message);
  },

  getUser: async (): Promise<User> => {
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, "users", "me"));
        return userDoc.exists() ? (userDoc.data() as User) : DEFAULT_USER;
      } catch (e) { return localBackend.getUser(); }
    }
    return localBackend.getUser();
  },

  updateUser: async (updates: Partial<User>): Promise<void> => {
    if (db) {
      try {
        await updateDoc(doc(db, "users", "me"), updates);
        return;
      } catch (e) { console.error("Cloud updateUser failed:", e); }
    }
    const current = localBackend.getUser();
    localBackend.setUser({ ...current, ...updates });
  },

  getConnections: async (): Promise<Connection[]> => {
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, "connections"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Connection));
      } catch (e) { return localBackend.getConnections(); }
    }
    return localBackend.getConnections();
  },

  addConnection: async (connection: Connection): Promise<void> => {
    if (db) {
      try {
        await addDoc(collection(db, "connections"), connection);
        return;
      } catch (e) { console.error("Cloud addConnection failed:", e); }
    }
    localBackend.addConnection(connection);
  }
};
