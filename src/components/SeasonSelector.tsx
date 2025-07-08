import React from 'react';

export interface Season {
  id: string;
  name: string;
  year: string;
  isCurrent: boolean;
}

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: string;
  onSeasonChange: (seasonId: string) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedSeason,
  onSeasonChange,
}) => {
  return (
    <div className="season-selector">
      <label htmlFor="season-select">Season:</label>
      <select
        id="season-select"
        value={selectedSeason}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="season-select"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name} {season.isCurrent && '(Current)'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector; 