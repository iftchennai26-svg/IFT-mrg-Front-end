import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase.js';

const AuthContext = createContext({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  loginAsGuest: () => {},
  loginAsAdmin: () => {},
  logoutGuest: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [guestUser, setGuestUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setIsAdmin(u.email === 'gostman064@gmail.com');
      } else if (guestUser) {
        setUser(guestUser);
        setIsAdmin(guestUser.email === 'gostman064@gmail.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [guestUser]);

  const loginAsGuest = () => {
    setGuestUser({
      uid: 'guest-user-123',
      displayName: 'IFT Reader',
      email: 'guest@ift.demo',
      metadata: { creationTime: new Date().toISOString() }
    });
  };

  const loginAsAdmin = () => {
    setGuestUser({
      uid: 'admin-user-456',
      displayName: 'Store Admin',
      email: 'gostman064@gmail.com',
      metadata: { creationTime: new Date().toISOString() }
    });
  };

  const logoutGuest = () => {
    setGuestUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginAsGuest, loginAsAdmin, logoutGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
