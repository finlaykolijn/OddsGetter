import React from 'react';

export interface League {
  key: string;
  name: string;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (leagueKey: string) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  leagues,
  selectedLeague,
  onLeagueChange,
}) => {
  return (
    <div className="league-selector">
      <label htmlFor="league-select">League:</label>
      <select
        id="league-select"
        value={selectedLeague}
        onChange={(e) => onLeagueChange(e.target.value)}
        className="league-select"
      >
        {leagues.map((league) => (
          <option key={league.key} value={league.key}>
            {league.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LeagueSelector; 