import { supabase } from '../config/supabase';

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
}

export const submitScore = async (playerName: string, score: number) => {
  try {
    const { error } = await supabase
      .from('gatito_leaderboard')
      .insert([{ player_name: playerName, score }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error submitting score:', err);
    return false;
  }
};

export const getTopScores = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('gatito_leaderboard')
      .select('id, player_name, score')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
};
