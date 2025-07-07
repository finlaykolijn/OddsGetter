import React from 'react';
import { Match } from '../types';

interface OddsDisplayProps {
  matches: Match[];
  loading: boolean;
}

interface GroupedMatch {
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: {
    bookmaker: string;
    home_win_odds: number | string;
    draw_odds: number | string;
    away_win_odds: number | string;
    last_updated: string;
  }[];
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

  // Normalize team names to handle potential variations between bookmakers
  const normalizeTeamName = (teamName: string): string => {
    return teamName.toLowerCase().trim();
  };

  // Group matches by home team, away team, and commence time
  const groupMatches = (matches: Match[]): GroupedMatch[] => {
    const grouped: { [key: string]: GroupedMatch } = {};

    matches.forEach((match) => {
      // Create a base key using just the teams (without time)
      const teamKey = `${match.home_team}-${match.away_team}`;
      
      // Try to find an existing group with the same teams and similar time
      let foundGroup = false;
      const matchTime = new Date(match.commence_time).getTime();
      
      for (const existingKey in grouped) {
        const existingMatch = grouped[existingKey];
        
        if (!existingMatch) continue;
        
        // Check if teams match (using normalized names)
        const normalizedHomeTeam = normalizeTeamName(match.home_team);
        const normalizedAwayTeam = normalizeTeamName(match.away_team);
        const normalizedExistingHomeTeam = normalizeTeamName(existingMatch.home_team);
        const normalizedExistingAwayTeam = normalizeTeamName(existingMatch.away_team);
        
        if (normalizedHomeTeam === normalizedExistingHomeTeam && 
            normalizedAwayTeam === normalizedExistingAwayTeam) {
          
          // Check if times are within 2 days of each other
          const existingTime = new Date(existingMatch.commence_time).getTime();
          const timeDifference = Math.abs(matchTime - existingTime);
          const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
          
          if (timeDifference <= twoDaysInMs) {
            // Use the existing group
            const groupToUpdate = grouped[existingKey];
            if (groupToUpdate) {
              groupToUpdate.bookmakers.push({
                bookmaker: match.bookmaker,
                home_win_odds: match.home_win_odds,
                draw_odds: match.draw_odds,
                away_win_odds: match.away_win_odds,
                last_updated: match.last_updated
              });
            }
            foundGroup = true;
            break;
          }
        }
      }
      
      // If no matching group found, create a new one
      if (!foundGroup) {
        const newKey = `${teamKey}-${match.commence_time}`;
        grouped[newKey] = {
          home_team: match.home_team,
          away_team: match.away_team,
          commence_time: match.commence_time,
          bookmakers: [{
            bookmaker: match.bookmaker,
            home_win_odds: match.home_win_odds,
            draw_odds: match.draw_odds,
            away_win_odds: match.away_win_odds,
            last_updated: match.last_updated
          }]
        };
      }
    });

    return Object.values(grouped);
  };

  const groupedMatches = groupMatches(matches);

  return (
    <div className="odds-display">
      <h2>Match Odds</h2>
      <div className="matches-container">
        {groupedMatches.map((match, index) => {
          try {
            console.log('Rendering grouped match:', match);

            return (
              <div key={index} className="match-card">
                <div className="match-header">
                  <div className="teams">
                    <span className="home-team">{match.home_team}</span>
                    <span className="vs">vs</span>
                    <span className="away-team">{match.away_team}</span>
                  </div>
                  <div className="match-time">
                    {formatDate(match.commence_time)}
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
                  
                  {match.bookmakers.map((bookmaker, bookmakerIndex) => (
                    <div key={bookmakerIndex} className="odds-row">
                      <span className="bookmaker">{bookmaker.bookmaker}</span>
                      <span className="odds home-win">{formatOdds(bookmaker.home_win_odds)}</span>
                      <span className="odds draw">{formatOdds(bookmaker.draw_odds)}</span>
                      <span className="odds away-win">{formatOdds(bookmaker.away_win_odds)}</span>
                      <span className="updated">{formatDate(bookmaker.last_updated)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering grouped match:', match, error);
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