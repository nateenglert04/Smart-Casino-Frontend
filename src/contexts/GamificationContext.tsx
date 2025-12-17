import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { GamificationService, type GamificationProfile } from '../services/GamificationService';

interface GamificationContextType {
  rankData: GamificationProfile | null;
  refreshRank: () => Promise<void>;
  loading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); 
  const [rankData, setRankData] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch latest data
  const refreshRank = async () => {
    if (!user?.id) return;
    
    try {
      const data = await GamificationService.getPlayerProfile(user.id);
      setRankData(data);
    } catch (error) {
      console.error("Failed to refresh rank:", error);
    }
  };

  // Automatically fetch when user logs in
  useEffect(() => {
    if (user?.id) {
      refreshRank();
    } else {
      setRankData(null);
    }
    setLoading(false);
  }, [user?.id]);

  return (
    <GamificationContext.Provider value={{ rankData, refreshRank, loading }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};