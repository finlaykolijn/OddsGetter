import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import './App.css';
import OddsDisplay from './components/OddsDisplay';
import TeamSelector from './components/TeamSelector';
import SeasonSelector, { Season } from './components/SeasonSelector';
import { Match, Team } from './types';

type View = 'home' | 'teams' | 'matches' | 'odds';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<string>('');
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentView, setCurrentView] = useState<View>('home');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('2025-26');

  const handleSeasonChange = (seasonId: string) => {
    console.log(`Season changed from ${selectedSeason} to ${seasonId}`);
    setSelectedSeason(seasonId);
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (seasons.length > 0) {
      fetchTeams();
      fetchAllMatches();
    }
  }, [selectedSeason, seasons.length]);

  const fetchSeasons = async () => {
    try {
      console.log('Fetching seasons...');
      const response = await fetch('/api/seasons');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Seasons data:', data);
      setSeasons(data);
    } catch (err) {
      console.error('Error fetching seasons:', err);
      setError('Failed to fetch seasons');
    }
  };

  const fetchTeams = async () => {
    try {
      console.log(`Fetching teams for season: ${selectedSeason}`);
      const response = await fetch(`/api/teams?season=${selectedSeason}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Teams data for ${selectedSeason}:`, data);
      setTeams(data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to fetch teams');
    }
  };

  const fetchAllMatches = async () => {
    try {
      console.log(`Fetching all matches for season: ${selectedSeason}`);
      const response = await fetch(`/api/matches?season=${selectedSeason}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`All matches data for ${selectedSeason}:`, data);
      setAllMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches');
    }
  };

  const fetchMatches = async () => {
    if (!selectedHomeTeam && !selectedAwayTeam) {
      setError('Please select at least one team');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedHomeTeam) params.append('homeTeam', selectedHomeTeam);
      if (selectedAwayTeam) params.append('awayTeam', selectedAwayTeam);
      params.append('season', selectedSeason);

      console.log('Fetching matches with params:', params.toString());
      const response = await fetch(`/api/matches?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Matches data:', data);
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedHomeTeam('');
    setSelectedAwayTeam('');
    setMatches([]);
    setError('');
  };

  const renderHomeView = () => (
    <div className="home-view">
      <div className="welcome-section">
        <h2>Welcome to OddsGetter!</h2>
        <p>Your Premier League odds tracking application</p>
      </div>
      
      <div className="quick-stats">
        <div className="stat-card">
          <h3>{teams.length}</h3>
          <p>Teams Available</p>
        </div>
        <div className="stat-card">
          <h3>{allMatches.length}</h3>
          <p>Matches Available</p>
        </div>
        <div className="stat-card">
          <h3>⚽</h3>
          <p>Live Odds</p>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => setCurrentView('teams')}
          className="nav-button"
        >
          View All Teams
        </button>
        <button 
          onClick={() => setCurrentView('matches')}
          className="nav-button"
        >
          View All Matches
        </button>
        <button 
          onClick={() => setCurrentView('odds')}
          className="nav-button"
        >
          Search Odds
        </button>
        <button 
          onClick={async () => {
            console.log('Testing API endpoints...');
            try {
              const teamsResponse = await fetch('/api/teams');
              const teamsData = await teamsResponse.json();
              console.log('Teams API test:', teamsData);
              
              const matchesResponse = await fetch('/api/matches');
              const matchesData = await matchesResponse.json();
              console.log('Matches API test:', matchesData);
              
              alert('API test completed! Check console for details.');
            } catch (error) {
              console.error('API test failed:', error);
              alert('API test failed! Check console for details.');
            }
          }}
          className="nav-button"
          style={{ backgroundColor: '#ff6b6b' }}
        >
          Test API
        </button>
      </div>
    </div>
  );

  const renderTeamsView = () => (
    <div className="teams-view">
      <h2>Premier League Teams</h2>
      <div className="teams-grid">
        {teams.map((team, index) => (
          <div key={index} className="team-card">
            <h3>{team.team}</h3>
          </div>
        ))}
      </div>
      <button 
        onClick={() => setCurrentView('home')}
        className="back-button"
      >
        ← Back to Home
      </button>
    </div>
  );

  const renderMatchesView = () => (
    <div className="matches-view">
      <h2>All Available Matches</h2>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <ErrorBoundary>
        <OddsDisplay matches={allMatches} loading={false} />
      </ErrorBoundary>
      <button 
        onClick={() => setCurrentView('home')}
        className="back-button"
      >
        ← Back to Home
      </button>
    </div>
  );

  const renderOddsView = () => (
    <div className="odds-view">
      <h2>Search for Specific Odds</h2>
      <div className="controls">
        <TeamSelector
          teams={teams}
          selectedHomeTeam={selectedHomeTeam}
          selectedAwayTeam={selectedAwayTeam}
          onHomeTeamChange={setSelectedHomeTeam}
          onAwayTeamChange={setSelectedAwayTeam}
        />
        
        <div className="button-group">
          <button 
            onClick={fetchMatches}
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Loading...' : 'Get Odds'}
          </button>
          <button 
            onClick={clearFilters}
            className="secondary-button"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <ErrorBoundary>
        <OddsDisplay matches={matches} loading={loading} />
      </ErrorBoundary>
      
      <button 
        onClick={() => setCurrentView('home')}
        className="back-button"
      >
        ← Back to Home
      </button>
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚽ OddsGetter</h1>
        <p>Premier League Odds Tracker</p>
        
        <div className="header-controls">
          <SeasonSelector
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSeasonChange={handleSeasonChange}
          />
        </div>
        
        <nav className="nav-menu">
          <button 
            onClick={() => setCurrentView('home')}
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('teams')}
            className={`nav-link ${currentView === 'teams' ? 'active' : ''}`}
          >
            Teams
          </button>
          <button 
            onClick={() => setCurrentView('matches')}
            className={`nav-link ${currentView === 'matches' ? 'active' : ''}`}
          >
            Matches
          </button>
          <button 
            onClick={() => setCurrentView('odds')}
            className={`nav-link ${currentView === 'odds' ? 'active' : ''}`}
          >
            Search Odds
          </button>
        </nav>
      </header>

      <main className="app-main">
        <ErrorBoundary>
          {currentView === 'home' && renderHomeView()}
          {currentView === 'teams' && renderTeamsView()}
          {currentView === 'matches' && renderMatchesView()}
          {currentView === 'odds' && renderOddsView()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 