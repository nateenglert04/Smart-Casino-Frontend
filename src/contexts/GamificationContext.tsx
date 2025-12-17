import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { GamificationService, type GamificationProfile } from '../services/GamificationService';

interface GamificationContextType {
  rankData: GamificationProfile | null;
  refreshRank: () => Promise<void>;
  loading: boolean;
  notification: GamificationNotification | null;
  clearNotification: () => void;
}

interface GamificationNotification {
  xpGained: number;
  newRank: string | null;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); 
  const [rankData, setRankData] = useState<GamificationProfile | null>(null);
  const [notification, setNotification] = useState<GamificationNotification | null>(null);
  const [loading, setLoading] = useState(true);

  const clearNotification = () => setNotification(null);

  // Function to fetch latest data
  const refreshRank = async () => {
    if (!user?.id) return;
    
    try {
      const data = await GamificationService.getPlayerProfile(user.id);
      if (rankData) {
        const xpDiff = (data.totalXP as number) - (rankData.totalXP as number);
        const rankChanged = data.currentRank !== rankData.currentRank;

        if (xpDiff > 0) {
          setNotification({
            xpGained: xpDiff,
            newRank: rankChanged ? (data.currentRank as string) : null
          });

          setTimeout(() => setNotification(null), 5000);
        }
      }
      
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
    <GamificationContext.Provider value={{ rankData, refreshRank, loading, notification, clearNotification }}>
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