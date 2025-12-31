const STORAGE_KEYS = {
  PROGRESS: 'match3_progress',
  SETTINGS: 'match3_settings',
  LEADERBOARD: 'match3_leaderboard',
  SAVE: 'match3_save'
}

export interface LeaderboardEntry {
  playerName: string
  score: number
  level: number
  mode: string
  date: string
}

export function useStorage() {
  function getLeaderboard(): LeaderboardEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD)
    if (data) {
      try {
        return JSON.parse(data)
      } catch {
        return []
      }
    }
    return []
  }
  
  function addToLeaderboard(entry: Omit<LeaderboardEntry, 'date'>) {
    const entries = getLeaderboard()
    entries.push({
      ...entry,
      date: new Date().toISOString()
    })
    entries.sort((a, b) => b.score - a.score)
    const top50 = entries.slice(0, 50)
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(top50))
  }
  
  function getTopScores(limit: number = 10): LeaderboardEntry[] {
    return getLeaderboard().slice(0, limit)
  }
  
  function clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD)
  }
  
  return {
    getLeaderboard,
    addToLeaderboard,
    getTopScores,
    clearLeaderboard
  }
}
