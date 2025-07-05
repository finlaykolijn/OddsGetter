# OddsGetter - Premier League Odds Tracker

A modern web application for tracking Premier League betting odds with a beautiful React frontend and Node.js backend.

## Features

- 🏈 Real-time Premier League odds tracking
- 🎨 Modern, responsive UI with beautiful gradients
- 🔍 Filter matches by home and away teams
- 📊 Detailed odds comparison across bookmakers
- ⚡ Fast API queries with PostgreSQL
- 📱 Mobile-responsive design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Styling**: Modern CSS with gradients and animations

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Make sure your PostgreSQL database is running and configured. Update the database connection in `db/config.ts` if needed.

### 3. Start the Backend Server

```bash
npm run server
```

This will start the Express API server on port 5000.

### 4. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

This will start the Vite development server on port 3000, 3001, or 3002 (depending on availability).

### 5. Open the Application

Navigate to the URL shown in your terminal (e.g., `http://localhost:3002`) in your browser.

## Testing Your Setup

### Test the API Endpoints

Run the test script to verify your backend is working:

```bash
node test-api.js
```

You should see output like:
```
🧪 Testing OddsGetter API...
✅ Teams endpoint working! Found 23 teams
✅ Matches endpoint working! Found 20 matches
🎉 All API tests passed!
```

### Test the Frontend

1. Open your browser to the URL shown in your terminal (e.g., `http://localhost:3002`)
2. You should see the OddsGetter interface with:
   - Team selection dropdowns
   - "Get Odds" and "Clear Filters" buttons
   - A beautiful gradient background

### Using the Application

1. **Select Teams**: Choose home and/or away teams from the dropdown menus
2. **Get Odds**: Click "Get Odds" to fetch the latest odds data
3. **View Results**: See detailed odds from different bookmakers
4. **Clear Filters**: Reset your selections with the "Clear Filters" button

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend API server
- `npm run start` - Start both servers together
- `npm run build` - Build frontend for production
- `npm run scrape` - Run the odds scraper
- `npm run odds` - Run odds demo
- `npm run check-bookmakers` - Check available bookmakers

## API Endpoints

- `GET /api/teams` - Get all available teams
- `GET /api/matches?homeTeam=X&awayTeam=Y` - Get matches with optional team filters
- `GET /api/bookmakers` - Get all available bookmakers
- `GET /api/odds/:homeTeam/:awayTeam` - Get specific match odds

## Troubleshooting

### Common Issues

1. **Port conflicts**: The frontend will automatically try different ports (3000, 3001, 3002, etc.)
2. **Database connection errors**: Check your PostgreSQL server and `db/config.ts`
3. **CORS errors**: The backend includes CORS middleware, but check your proxy settings
4. **No matches found**: Try different team combinations or check your database data

### Error Messages

- **"Failed to fetch teams"**: Check if the backend server is running
- **"No matches found"**: The selected teams might not have upcoming matches
- **"Failed to fetch matches"**: Check your database connection and data

## Database Schema

The application uses the following main tables:
- `games` - Match information
- `bookmakers` - Bookmaker details
- `match_odds` - Odds data for each match/bookmaker combination

## Development

The application is structured as follows:

```
OddsGetter/
├── src/                    # Frontend React components
│   ├── components/        # React components
│   ├── types.ts          # TypeScript type definitions
│   └── App.tsx           # Main App component
├── db/                   # Database configuration and schema
├── server.ts             # Express API server
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=odds_database
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

## What You Should See

When everything is working correctly:

1. **Backend**: Server running on port 5000 with API endpoints responding
2. **Frontend**: Beautiful UI with team dropdowns and odds display
3. **Database**: Teams and matches data being served through the API
4. **Browser**: Modern, responsive interface with gradient backgrounds

## Next Steps

- Add more filtering options (by date, bookmaker, etc.)
- Implement real-time odds updates
- Add user authentication
- Create mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own odds tracking needs!