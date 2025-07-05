import React from 'react';
import { Match } from '../types';

interface OddsDisplayProps {
  matches: Match[];
  loading: boolean;
}

const OddsDisplay: React.FC<OddsDisplayProps> = ({ matches, loading }) => {
  console.log('OddsDisplay received matches:', matches);
  console.log('OddsDisplay loading:', loading);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading odds...</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="no-results">
        <p>No matches found. Try selecting different teams or check back later for upcoming matches.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid date';
      return new Date(dateString).toLocaleString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const formatOdds = (odds: number | string) => {
    try {
      const numOdds = typeof odds === 'string' ? parseFloat(odds) : odds;
      if (typeof numOdds !== 'number' || isNaN(numOdds)) {
        return 'N/A';
      }
      return numOdds.toFixed(2);
    } catch (error) {
      console.error('Error formatting odds:', odds, error);
      return 'N/A';
    }
  };

  return (
    <div className="odds-display">
      <h2>Match Odds</h2>
      <div className="matches-container">
        {matches.map((match, index) => {
          try {
            // Add null checks for all properties
            const homeTeam = match?.home_team || 'Unknown Team';
            const awayTeam = match?.away_team || 'Unknown Team';
            const commenceTime = match?.commence_time || '';
            const bookmaker = match?.bookmaker || 'Unknown Bookmaker';
            const homeWinOdds = match?.home_win_odds || 0;
            const drawOdds = match?.draw_odds || 0;
            const awayWinOdds = match?.away_win_odds || 0;
            const lastUpdated = match?.last_updated || '';

            console.log('Rendering match:', { homeTeam, awayTeam, bookmaker, homeWinOdds, drawOdds, awayWinOdds });

            return (
              <div key={index} className="match-card">
                <div className="match-header">
                  <div className="teams">
                    <span className="home-team">{homeTeam}</span>
                    <span className="vs">vs</span>
                    <span className="away-team">{awayTeam}</span>
                  </div>
                  <div className="match-time">
                    {formatDate(commenceTime)}
                  </div>
                </div>
                
                <div className="odds-table">
                  <div className="odds-header">
                    <span>Bookmaker</span>
                    <span>Home Win</span>
                    <span>Draw</span>
                    <span>Away Win</span>
                    <span>Updated</span>
                  </div>
                  
                  <div className="odds-row">
                    <span className="bookmaker">{bookmaker}</span>
                    <span className="odds home-win">{formatOdds(homeWinOdds)}</span>
                    <span className="odds draw">{formatOdds(drawOdds)}</span>
                    <span className="odds away-win">{formatOdds(awayWinOdds)}</span>
                    <span className="updated">{formatDate(lastUpdated)}</span>
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering match:', match, error);
            return (
              <div key={index} className="match-card">
                <div className="error-message">
                  Error rendering match data
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default OddsDisplay; 