import axios from 'axios';

// Types for API responses
export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
}

export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export class OddsApiClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

//Gets list of all available sports
  async getSports(): Promise<Sport[]> {
    try {
      const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
        params: {
          apiKey: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * @param sportKey The sport key
   * @param options Options for the API request
   */
  async getOdds(
    sportKey: string,
    options: {
      regions?: string;
      markets?: string;
      oddsFormat?: 'decimal' | 'american';
      dateFormat?: 'iso' | 'unix';
      bookmakers?: string;
    } = {}
  ): Promise<Game[]> {
    const {
      regions = 'us',
      markets = 'h2h',
      oddsFormat = 'decimal',
      dateFormat = 'iso',
      bookmakers
    } = options;

    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions,
          markets,
          oddsFormat,
          dateFormat,
          bookmakers
        }
      });
      
      console.log('Remaining requests:', response.headers['x-requests-remaining']);
      console.log('Used requests:', response.headers['x-requests-used']);
      
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

//Get Premier League odds specifically for FanDuel and DraftKings
  async getPremierLeagueOdds(): Promise<Game[]> {
    return this.getOdds('soccer_epl', {
      regions: 'us',
      markets: 'h2h', // ML odds, can edit this to get other markets
      bookmakers: 'fanduel,draftkings'
    });
  }

  private handleApiError(error: any): void {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}