export interface Team {
  team: string;
}

export interface Match {
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmaker: string;
  home_win_odds: number | string;
  draw_odds: number | string;
  away_win_odds: number | string;
  last_updated: string;
} 