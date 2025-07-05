import React from 'react';
import { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  selectedHomeTeam: string;
  selectedAwayTeam: string;
  onHomeTeamChange: (team: string) => void;
  onAwayTeamChange: (team: string) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedHomeTeam,
  selectedAwayTeam,
  onHomeTeamChange,
  onAwayTeamChange,
}) => {
  return (
    <div className="team-selector">
      <div className="team-input">
        <label htmlFor="home-team">Home Team:</label>
        <select
          id="home-team"
          value={selectedHomeTeam}
          onChange={(e) => onHomeTeamChange(e.target.value)}
        >
          <option value="">Select Home Team</option>
          {teams.map((team) => (
            <option key={team.team} value={team.team}>
              {team.team}
            </option>
          ))}
        </select>
      </div>

      <div className="vs-divider">VS</div>

      <div className="team-input">
        <label htmlFor="away-team">Away Team:</label>
        <select
          id="away-team"
          value={selectedAwayTeam}
          onChange={(e) => onAwayTeamChange(e.target.value)}
        >
          <option value="">Select Away Team</option>
          {teams.map((team) => (
            <option key={team.team} value={team.team}>
              {team.team}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TeamSelector; 